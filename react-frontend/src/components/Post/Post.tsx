import './Post.css';
import type { PostProps } from '../../types/post';
import { useEffect, useState } from 'react';

export default function Post(post : PostProps) {

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (post.image) {
            setIsLoading(true);
            fetch(`http://localhost:8080/api/v1/posts/${post.id}/image`)
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
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        }
    }, [post.id]);

    return (
        <div className="post">
            <div className="post-header">
                <h2>{post.author}</h2>
            </div>
            <div className="post-content">
                <p><strong>Item Type:</strong> {post.itemType}</p>
                <p>{post.content}</p>
            </div>
            {isLoading && <p>Loading image...</p>}
            {imageUrl &&
                <div className="post-image-container">
                    <img 
                        src={imageUrl}
                        alt=""
                        className="post-image"
                    />
                </div>
            }
        </div>
    ); 
}