import './Profile.css'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCreatePost = () => {
        navigate('/feed');
    };

    const getInitial = () => {
        return user?.username ? user.username.charAt(0).toUpperCase() : 'U';
    };

    return (
        <div className="profile">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {getInitial()}
                    </div>
                    <div className="profile-details">
                        <h2 className="profile-username">{user?.username || 'N/A'}</h2>
                        <p className="profile-email">{user?.email || 'N/A'}</p>
                    </div>
                </div>
                <button 
                    className="create-post-btn"
                    onClick={handleCreatePost}
                >
                    Create New Post
                </button>
            </div>
        </div>
    );
}