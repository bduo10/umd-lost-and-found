import './Feed.css'
import { useEffect, useState } from 'react';
import PostForm from '../Post/PostForm';
import Post from '../Post/Post';
import type { PostProps } from '../../types/post';
import { useAuth } from '../../context/AuthContext';

export default function Feed() {
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showPostForm, setShowPostForm] = useState<boolean>(false);

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/v1/posts/all`, {
                    method: 'GET',
                    credentials: 'include',
                });
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

    const handlePostCreated = (newPost: PostProps) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setShowPostForm(false);
    };

    const handleNewPost = () => {
        if (!isAuthenticated) {
            setError('You must be logged in to create a post.');
            return;
        }
        setShowPostForm(true);
    };

    const handleCloseForm = () => {
        setShowPostForm(false);
    }

    if (showPostForm) {
        return <PostForm onClose={handleCloseForm} onPostCreated={handlePostCreated} />;
    }

    return (
        <div className="feed">
            <div className="feed-header">
                <h1>Lost & Found</h1>
                <button 
                    className="new-post" 
                    onClick={handleNewPost}
                    disabled={!isAuthenticated}
                >
                    {isAuthenticated ? 'Create New Post' : 'Login to Post'}
                </button>
            </div>
            <div className="feed-content">
                {isLoading && <p>Loading posts...</p>}
                {error && <p className="error">{error}</p>}
                {posts.length == 0 && !isLoading && !error && (
                    <p>No posts available</p>
                )}
                {posts.map((post) => (
                    <Post key={post.id} {...post} />
                ))}
            </div>
        </div>
    );
}