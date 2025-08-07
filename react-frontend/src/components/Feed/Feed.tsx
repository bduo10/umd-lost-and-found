import './Feed.css'
import { useEffect, useState } from 'react';
import PostForm from '../Post/PostForm';
import Post from '../Post/Post';
import type { PostProps } from '../../types/post';

export default function Feed() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showPostForm, setShowPostForm] = useState<boolean>(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/posts/all');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const posts = await response.json();
                setPosts(posts);
            } catch (error) {
                console.error('Error fetching posts:', error);
                setError('Failed to fetch posts');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handleNewPost = () => {
        setShowPostForm(true);
    };

    const handleCloseForm = () => {
        setShowPostForm(false);
    }

    return (
        <div className="feed">
            <div className="feed-header">
                <h1>Lost & Found</h1>
                <button className="new-post" onClick={handleNewPost}>New Post</button>
                {showPostForm && (
                    <PostForm onClose={handleCloseForm} />
                )}
            </div>
            <div className="feed-content">
                {isLoading && <p>Loading posts...</p>}
                {error && <p className="error">{error}</p>}
                {posts.map((post) => (
                    <Post key={post.id} {...post} />
                ))}
            </div>
        </div>
    );
}