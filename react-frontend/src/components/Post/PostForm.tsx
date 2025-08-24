import { useState } from 'react';
import './Post.css';
import { useAuth } from '../../context/AuthContext';

interface PostFormProps {
    onClose: () => void;
    onPostCreated?: (newPost: any) => void;
}

export default function PostForm({ onClose, onPostCreated }: PostFormProps ) {
    const [itemType, setItemType] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!itemType || !content) {
            alert('All fields are required');
            return;
        }

        if (!user) {
            setError('You must be logged in to create a post');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('itemType', itemType);
            formData.append('content', content);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            const response = await fetch(`${BASE_URL}/api/v1/posts`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });


            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('You must be logged in to create a post');
                }
                throw new Error('Failed to create post');
            }

            const newPost = await response.json();
            console.log('Post created:', newPost);

            setItemType('');
            setContent('');
            setImageFile(null);

            if (onPostCreated) {
                onPostCreated(newPost);
            }

            onClose();
        } catch (error : any) {
            console.error('Error creating post:', error);
            setError(error.message || 'Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="post-form-container">
            <button className="close-button" onClick={onClose}>
                 ← Back to Feed
            </button>
            <form className="post-form" onSubmit={handleSubmit}>
                <h2>Create New Post</h2>

                {error && <p className="error">{error}</p>}

                <div className="post-form-group">
                    <label htmlFor='itemType'>Item Type:</label>
                    <br></br>
                    <select
                        id="itemType"
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                        required
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
                <div className="post-form-group">
                    <label htmlFor='content'>Content:</label>
                    <br></br>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe the item, location, date, etc."
                        required
                    />
                </div>
                <div className="post-form-group">
                    <label htmlFor="fileUpload">
                        <input
                            type="file"
                            id="fileUpload"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Posting...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
}