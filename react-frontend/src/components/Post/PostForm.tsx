import { useState } from 'react';
import './Post.css';

export default function PostForm({ onClose }: { onClose: () => void }) {
    const [itemType, setItemType] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!itemType || !content || !author) {
            alert('All fields are required');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('itemType', itemType);
            formData.append('content', content);
            formData.append('author', author);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            const response = await fetch('http://localhost:8080/api/v1/posts', {
                method: 'POST',
                body: formData,
            });


            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Post created:', data);
            setItemType('');
            setContent('');
            setAuthor('');
            setImageFile(null);
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
                    <select
                        id="itemType"
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                    >
                        <option value="">Select an item type</option>
                        <option value="BOOK">BOOK</option>
                        <option value="CLOTHING">CLOTHING</option>
                        <option value="ELECTRONICS">ELECTRONICS</option>
                        <option value="KEYS">KEYS</option>
                        <option value="WALLET">WALLET</option>
                        <option value="ID">ID</option>
                        <option value="WATERBOTTLE">WATER BOTTLE</option>
                        <option value="ACCESSORIES">ACCESSORIES</option>
                        <option value="BAGS">BAGS</option>
                        <option value="OTHER">OTHER</option>
                    </select>
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
                <div className="form-group">
                    <label htmlFor="fileUpload">
                        <input
                            type="file"
                            id="fileUpload"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}