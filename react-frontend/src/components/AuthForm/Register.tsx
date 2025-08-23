import './AuthForm.css';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmailVerification from './EmailVerification';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showVerification, setShowVerification] = useState(false);

    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await register({email, username, password});
            setShowVerification(true);
        } catch (error: any) {
            setError(error.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    }

    const handleBackToRegister = () => {
        setShowVerification(false);
    }

    if (showVerification) {
        return <EmailVerification email={email} onBack={handleBackToRegister} />;
    }

    return (
        <div className="register-form-container">
            <form>
                <h2>Sign Up</h2>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="user@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <button type="submit">
                    {isLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
                {error && <p className="error">{error}</p>}
                <p>Already have an account? <NavLink to="/login">Log in</NavLink></p>
            </form>
        </div>
    )
}