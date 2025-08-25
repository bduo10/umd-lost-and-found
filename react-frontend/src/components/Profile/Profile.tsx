import './Profile.css'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

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
    const { user: currentUser } = useAuth();
    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
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

                const userData = await response.json();
                setProfileUser(userData);
            } catch (err) {
                console.error('Error fetching user profile:', err);
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
                    <button 
                        className="create-post-btn"
                        onClick={handleCreatePost}
                    >
                        Create New Post
                    </button>
                )}
                
                {!isCurrentUser && (
                    <div className="profile-info">
                        <p>Viewing profile of {profileUser.username}</p>
                    </div>
                )}
            </div>
        </div>
    );
}