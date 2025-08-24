import './Post.css';
import type { PostProps } from '../../types/post';
import { useEffect, useState } from 'react';

export default function Post(post: PostProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const BASE_URL = import.meta.env.VITE_BASE_URL;

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
                <h2>{post.username}</h2>
                <div className="post-meta">
                    <span className="item-type-badge" aria-label={`Item type: ${post.itemType}`}>
                        {post.itemType}
                    </span>
                </div>
            </div>
            <div className="post-content">
                <p className="post-description">{post.content}</p>
                
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
                
                {post.image && !imageUrl && !isLoading && (
                    <div className="image-error" role="alert">
                        <p>Failed to load image</p>
                    </div>
                )}
            </div>
        </div>
    );
}