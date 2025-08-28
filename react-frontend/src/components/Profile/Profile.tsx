import './Profile.css'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserFeed from '../Feed/UserFeed';

interface ProfileProps {
    username: string; 
}

interface UserProfile {
    id: number;
    username: string;
    email: string;
    emailVerified?: boolean;
}

export default function Profile({ username }: ProfileProps) {
    const navigate = useNavigate();
    const { user: currentUser, clearUserState } = useAuth();
    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const BASE_URL = import.meta.env.VITE_BASE_URL;
    
    // Check if viewing current user's profile - this works regardless of navigation path
    const isCurrentUser = currentUser?.username === username;

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!username) {
                setError('No username provided');
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${BASE_URL}/api/v1/users/${username}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('User not found');
                    }
                    throw new Error('Failed to fetch user profile');
                }

                // Safe JSON parsing
                const text = await response.text();
                
                if (!text.trim()) {
                    throw new Error('Empty response from server');
                }

                const userData = JSON.parse(text);
                setProfileUser(userData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [username, BASE_URL]);

    const handleCreatePost = () => {
        navigate('/feed');
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your posts and messages.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`${BASE_URL}/api/v1/users/me`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            // Account deleted successfully - clear auth state directly without calling logout endpoint
            // since the user no longer exists on the backend
            clearUserState();
            
            // Navigate to home page immediately
            navigate('/', { replace: true });
            
        } catch (error) {
            alert('Failed to delete account. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    }

    const getInitial = () => {
        return profileUser?.username ? profileUser.username.charAt(0).toUpperCase() : 'U';
    };

    if (isLoading) {
        return (
            <div className="profile">
                <div className="profile-card">
                    <div className="loading">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile">
                <div className="profile-card">
                    <div className="error">Error: {error}</div>
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="profile">
                <div className="profile-card">
                    <div className="error">Profile not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {getInitial()}
                    </div>
                    <div className="profile-details">
                        <h2 className="profile-username">{profileUser.username}</h2>
                        <p className="profile-email">{profileUser.email}</p>
                    </div>
                </div>
                
                {isCurrentUser && (
                    <div className="profile-actions">
                        <button
                            className="delete-account-btn"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </button>
                        <button 
                            className="create-post-btn"
                            onClick={handleCreatePost}
                        >
                            Create New Post
                        </button>
                    </div>
                )}
                
                {!isCurrentUser && (
                    <div className="profile-info">
                        <p>Viewing profile of {profileUser.username}</p>
                    </div>
                )}
            </div>
            
            {/* User's posts feed */}
            <UserFeed username={username} isCurrentUser={isCurrentUser} />
        </div>
    );
}