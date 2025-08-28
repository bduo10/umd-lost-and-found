import './Post.css';
import type { PostProps } from '../../types/post';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChatWindow } from '../Chat/ChatWindow';

interface PostEditFormProps {
    initialContent: string;
    initialItemType: string;
    onSave: (content: string, itemType: string) => void;
    onCancel: () => void;
}

function PostEditForm({ initialContent, initialItemType, onSave, onCancel }: PostEditFormProps) {
    const [content, setContent] = useState(initialContent);
    const [itemType, setItemType] = useState(initialItemType);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSave(content.trim(), itemType);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="post-edit-form">
            <div className="form-group">
                <label htmlFor="itemType">Item Type:</label>
                <select 
                    id="itemType"
                    value={itemType} 
                    onChange={(e) => setItemType(e.target.value)}
                    required
                >
                    <option value="BOOK">Book</option>
                    <option value="CLOTHING">Clothing</option>
                    <option value="ELECTRONICS">Electronics</option>
                    <option value="KEYS">Keys</option>
                    <option value="WALLET">Wallet</option>
                    <option value="ID">ID Card</option>
                    <option value="WATERBOTTLE">Water Bottle</option>
                    <option value="ACCESSORIES">Accessories</option>
                    <option value="BAGS">Bags</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="content">Description:</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe the item..."
                />
            </div>
            <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

export default function Post(post: PostProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [showChat, setShowChat] = useState<boolean>(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const handleUserClick = () => {
        navigate(`/profile/${post.username}`);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`${BASE_URL}/api/v1/posts/${post.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            if (post.onPostDeleted) {
                post.onPostDeleted(post.id);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = () => {
        setShowEditForm(true);
    };

    const handleEditCancel = () => {
        setShowEditForm(false);
    };

    const handleEditSave = async (updatedContent: string, updatedItemType: string) => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/posts/${post.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: updatedContent,
                    itemType: updatedItemType,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update post');
            }

            const updatedPost = await response.json();
            if (post.onPostUpdated) {
                post.onPostUpdated(updatedPost);
            }
            setShowEditForm(false);
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post. Please try again.');
        }
    };

    const getUserInitial = () => {
        return post.username ? post.username.charAt(0).toUpperCase() : 'U';
    };

    useEffect(() => {
        if (post.hasImage) {
            setIsLoading(true);
            fetch(`${BASE_URL}/api/v1/posts/${post.id}/image`, {
                credentials: 'include',
            })
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    setImageUrl(url);
                })
                .catch(err => {
                    console.error('Error fetching image:', err);
                    setImageUrl(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }

    }, [post.id, BASE_URL, post.hasImage]);

    useEffect(() => {
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    })

    return (
        <div className="post" role="article">
            <div className="post-header">
                <div className="post-user-info" onClick={handleUserClick}>
                    <div className="post-user-avatar">
                        {getUserInitial()}
                    </div>
                    <h3 className="post-username">{post.username}</h3>
                </div>
            </div>

            {isLoading && (
                <div className="image-loading" aria-live="polite">
                    <p>Loading image...</p>
                </div>
            )}
            
            {imageUrl && (
                <div className="post-image-container">
                    <img 
                        src={imageUrl}
                        alt={`${post.itemType} posted by ${post.username}`}
                        className="post-image"
                        loading="lazy"
                    />
                </div>
            )}
            
            {post.hasImage && !imageUrl && !isLoading && (
                <div className="image-error" role="alert">
                    <p>Failed to load image</p>
                </div>
            )}

            <div className="post-content">
                <div className="post-meta">
                    <span className="item-type-label">ITEM TYPE: </span>
                    <span className="item-type-badge" aria-label={`Item type: ${post.itemType}`}>
                        {post.itemType}
                    </span>
                </div>
                <p className="post-description">{post.content}</p>
                
                {/* Contact Owner button - show only if user is logged in and not viewing their own post */}
                {user && user.id !== post.userId && (
                    <div className="post-contact">
                        <button 
                            className="contact-owner-button" 
                            onClick={() => setShowChat(true)}
                        >
                            Contact Owner
                        </button>
                    </div>
                )}
                
                {post.showEditDelete && (
                    <div className="post-actions">
                        <button 
                            className="edit-btn" 
                            onClick={handleEdit}
                            disabled={isDeleting}
                        >
                            Edit
                        </button>
                        <button 
                            className="delete-btn" 
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                )}
            </div>

            {showEditForm && (
                <div className="edit-form">
                    <PostEditForm 
                        initialContent={post.content}
                        initialItemType={post.itemType}
                        onSave={handleEditSave}
                        onCancel={handleEditCancel}
                    />
                </div>
            )}

            {showChat && post.userId && post.username && (
                <div className="chat-overlay">
                    <ChatWindow
                        receiverId={post.userId}
                        receiverName={post.username}
                        postId={post.id.toString()}
                        onClose={() => setShowChat(false)}
                    />
                </div>
            )}
        </div>
    );
}