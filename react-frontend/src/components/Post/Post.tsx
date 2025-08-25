import './Post.css';
import type { PostProps } from '../../types/post';
import { useEffect, useState } from 'react';

export default function Post(post: PostProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    console.log('Full post object:', post); // Debug log

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const getUserInitial = () => {
        // Handle both formats: direct username or user.username
        const username = post.username || post.user?.username;
        console.log('Username:', username); // Debug log
        return username ? username.charAt(0).toUpperCase() : 'U';
    };

    const getUsername = () => {
        return post.username || post.user?.username || 'Unknown User';
    };

    const handleUserClick = () => {
        // TODO: Navigate to user profile
        const username = getUsername();
        console.log(`Navigate to profile of ${username}`);
    };

    useEffect(() => {
        if (post.image) {
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
        
    }, [post.id, BASE_URL, post.image]);

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
                    <h3 className="post-username">{getUsername()}</h3>
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
                        alt={`${post.itemType} posted by ${getUsername()}`}
                        className="post-image"
                        loading="lazy"
                    />
                </div>
            )}
            
            {post.image && !imageUrl && !isLoading && (
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
            </div>
        </div>
    );
}