import './Feed.css'
import { useEffect, useState } from 'react';
import Post from '../Post/Post';
import type { PostProps } from '../../types/post';

interface UserFeedProps {
    username: string;
    isCurrentUser: boolean;
}

export default function UserFeed({ username, isCurrentUser }: UserFeedProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [error, setError] = useState<string | null>(null);

    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

    useEffect(() => {
        const fetchUserPosts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/v1/posts/user/${username}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user posts');
                }
                const posts = await response.json();
                setPosts(posts);
            } catch (error) {
                console.error('Error fetching user posts:', error);
                setError('Failed to fetch posts');
            } finally {
                setIsLoading(false);
            }
        };

        if (username) {
            fetchUserPosts();
        }
    }, [username, BASE_URL]);

    const handlePostDeleted = (postId: number) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    };

    const handlePostUpdated = (updatedPost: PostProps) => {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post.id === updatedPost.id ? updatedPost : post
            )
        );
    };

    return (
        <div className="user-feed">
            <div className="feed-title">
                <h2>{isCurrentUser ? 'My Posts' : `${username}'s Posts`}</h2>
                <div className="feed-title-underline"></div>
            </div>

            <div className="feed-content">
                {isLoading && <p>Loading posts...</p>}
                {error && <p className="error">{error}</p>}
                {posts.length === 0 && !isLoading && !error && (
                    <p>
                        {isCurrentUser 
                            ? 'You haven\'t created any posts yet. Create your first post!' 
                            : `${username} hasn't posted anything yet.`
                        }
                    </p>
                )}
                {posts.map((post) => (
                    <Post 
                        key={post.id} 
                        {...post} 
                        showEditDelete={isCurrentUser}
                        onPostDeleted={handlePostDeleted}
                        onPostUpdated={handlePostUpdated}
                    />
                ))}
            </div>
        </div>
    );
}
