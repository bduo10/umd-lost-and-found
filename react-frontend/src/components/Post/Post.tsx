import './Post.css';
import type { PostProps } from '../../types/post';
import { useState } from 'react';

export default function Post(
    { author, itemType, content} : Omit<PostProps, 'id'>) {

    return (
        <div className="post">
            <div className="post-header">
                <h2>{author}</h2>
            </div>
            <div className="post-content">
                <p><strong>Item Type:</strong> {itemType}</p>
                <p>{content}</p>
            </div>
        </div>
    ); 
}