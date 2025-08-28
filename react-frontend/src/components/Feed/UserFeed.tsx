import './Feed.css'
import { useEffect, useState } from 'react';
import Post from '../Post/Post';
import type { PostProps } from '../../types/post';
import FilterSidebar from '../Filter/FilterSidebar';

interface UserFeedProps {
    username: string;
    isCurrentUser: boolean;
}

export default function UserFeed({ username, isCurrentUser }: UserFeedProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<PostProps[]>([]);
    const [selectedItemType, setSelectedItemType] = useState<string>('ALL');
    const [error, setError] = useState<string | null>(null);

    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

    useEffect(() => {
        const fetchUserPosts = async () => {
            setIsLoading(true);
            setError(null); // Clear any previous errors
            try {
                const response = await fetch(`${BASE_URL}/api/v1/posts/user/${username}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                
                if (!response.ok) {
                    // If it's a 404 or similar, just show empty posts
                    if (response.status === 404) {
                        setPosts([]);
                        return;
                    }
                    throw new Error(`Failed to fetch user posts: ${response.status}`);
                }
                
                // Check if response has content before parsing JSON
                const text = await response.text();
                if (!text.trim()) {
                    // Empty response, set empty array
                    setPosts([]);
                    return;
                }
                
                try {
                    const posts = JSON.parse(text);
                    // Ensure posts is an array
                    setPosts(Array.isArray(posts) ? posts : []);
                } catch (jsonError) {
                    // JSON parse error, likely empty or malformed response
                    setPosts([]);
                }
            } catch (error) {
                setError('Failed to load posts. Please try again later.');
                setPosts([]); // Set empty array as fallback
            } finally {
                setIsLoading(false);
            }
        };

        if (username) {
            fetchUserPosts();
        }
    }, [username, BASE_URL]);

    // Filter posts when posts or selectedItemType changes
    useEffect(() => {
        if (selectedItemType === 'ALL') {
            setFilteredPosts(posts);
        } else {
            setFilteredPosts(posts.filter(post => post.itemType === selectedItemType));
        }
    }, [posts, selectedItemType]);

    const handleFilterChange = (itemType: string) => {
        setSelectedItemType(itemType);
    };

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

            <div className="feed-main">
                <FilterSidebar 
                    selectedItemType={selectedItemType}
                    onFilterChange={handleFilterChange}
                />
                
                <div className="feed-content">
                    {isLoading && <p>Loading posts...</p>}
                    {error && <p className="error">{error}</p>}
                    {filteredPosts.length === 0 && !isLoading && !error && (
                        <p>
                            {selectedItemType === 'ALL' 
                                ? (isCurrentUser 
                                    ? 'You haven\'t created any posts yet. Create your first post!' 
                                    : `${username} hasn't posted anything yet.`
                                  )
                                : `No ${selectedItemType.toLowerCase().replace('waterbottle', 'water bottle')} items found. Try a different filter.`
                            }
                        </p>
                    )}
                    {filteredPosts.map((post) => (
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
        </div>
    );
}
