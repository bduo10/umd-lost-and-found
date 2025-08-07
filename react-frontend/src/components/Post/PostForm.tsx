import { useState } from 'react';
import './Post.css';

export default function PostForm({ onClose }: { onClose: () => void }) {
    const [itemType, setItemType] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');

    const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!itemType || !content || !author) {
            alert('All fields are required');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/v1/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    itemType, 
                    content, 
                    author 
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Post created:', data);
            // Reset form fields
            setItemType('');
            setContent('');
            setAuthor('');
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <div className="post-form-container">
            <form className="post-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor='itemType'>Item Type:</label>
                    <br></br>
                    <input
                        type="text"
                        id="itemType"
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor='content'>Content:</label>
                    <br></br>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor='author'>Author:</label>
                    <br></br>
                    <input
                        type="text"
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}