import './Feed.css'
import { useEffect, useState } from 'react';
import PostForm from '../Post/PostForm';
import Post from '../Post/Post';
import type { PostProps } from '../../types/post';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/lostfound.jpg';
import FilterSidebar from '../Filter/FilterSidebar';

export default function Feed() {
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<PostProps[]>([]);
    const [selectedItemType, setSelectedItemType] = useState<string>('ALL');
    const [error, setError] = useState<string | null>(null);
    const [showPostForm, setShowPostForm] = useState<boolean>(false);

    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

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
        <div className="feed-container">
            <div className="feed">
                <div className="feed-header">
                    <img src={Logo} alt="Lost and Found Logo" className="feed-logo" />
                    {isAuthenticated ? (
                        <button 
                            className="new-post authenticated" 
                            onClick={handleNewPost}
                        >
                            Create New Post
                        </button>
                    ) : (
                        <div className="auth-prompt">
                            <p>Want to post a lost or found item?</p>
                            <button 
                                className="new-post unauthenticated" 
                                onClick={handleNewPost}
                            >
                                Login to Post
                            </button>
                        </div>
                    )}
                </div>
                <div className="feed-title">
                    <h1>Feed</h1>
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
                                    ? `No posts available. ${isAuthenticated ? 'Be the first to post!' : 'Login to start posting!'}` 
                                    : `No ${selectedItemType.toLowerCase().replace('waterbottle', 'water bottle')} items found. Try a different filter.`
                                }
                            </p>
                        )}
                        {filteredPosts.map((post) => (
                            <Post key={post.id} {...post} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}