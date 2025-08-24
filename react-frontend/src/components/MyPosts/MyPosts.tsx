import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Post from '../Post/Post';
import type { PostProps } from '../../types/post';
import './MyPosts.css';

export default function MyPosts() {
    const { user, isAuthenticated } = useAuth();
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchMyPosts = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/v1/posts/my`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const userPosts = await response.json();
                    setPosts(userPosts);
                } else {
                    setError('Failed to fetch your posts');
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                setError('Failed to load your posts');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyPosts();
    }, [isAuthenticated, navigate, BASE_URL]);

    const filteredPosts = posts.filter(post => {
        if (filter === 'all') return true;
        return post.itemType.toLowerCase().includes(filter);
    });

    const handleDeletePost = async (postId: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`${BASE_URL}/api/v1/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setPosts(posts.filter(post => post.id !== postId));
            } else {
                alert('Failed to delete post');
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post');
        }
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="my-posts-container">
                <div className="loading">Loading your posts...</div>
            </div>
        );
    }

    return (
        <div className="my-posts-container">
            <div className="my-posts-header">
                <h1>My Posts</h1>
                <button 
                    className="back-button"
                    onClick={() => navigate('/profile')}
                >
                    ← Back to Profile
                </button>
            </div>

            <div className="filter-section">
                <h3>Filter by type:</h3>
                <div className="filter-buttons">
                    <button 
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All ({posts.length})
                    </button>
                    <button 
                        className={filter === 'lost' ? 'active' : ''}
                        onClick={() => setFilter('lost')}
                    >
                        Lost ({posts.filter(p => p.itemType.toLowerCase().includes('lost')).length})
                    </button>
                    <button 
                        className={filter === 'found' ? 'active' : ''}
                        onClick={() => setFilter('found')}
                    >
                        Found ({posts.filter(p => p.itemType.toLowerCase().includes('found')).length})
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="posts-section">
                {filteredPosts.length === 0 ? (
                    <div className="no-posts">
                        <p>
                            {filter === 'all' 
                                ? "You haven't created any posts yet." 
                                : `You don't have any ${filter} item posts yet.`
                            }
                        </p>
                        <button 
                            className="create-post-btn"
                            onClick={() => navigate('/feed')}
                        >
                            Create Your First Post
                        </button>
                    </div>
                ) : (
                    <div className="posts-grid">
                        {filteredPosts.map(post => (
                            <div key={post.id} className="post-wrapper">
                                <Post {...post} />
                                <div className="post-actions">
                                    <button 
                                        className="edit-btn"
                                        onClick={() => navigate(`/edit-post/${post.id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDeletePost(post.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
