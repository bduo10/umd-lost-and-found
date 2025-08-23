import './AuthForm.css';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';    
import { NavLink, useNavigate } from 'react-router-dom';

interface EmailVerificationProps {
    email: string;
    onBack: () => void;
}

export default function EmailVerification({ email, onBack }: EmailVerificationProps) {  
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const navigate = useNavigate();
    const { verifyEmail, resendVerificationCode } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await verifyEmail(email, verificationCode);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error: any) {
            setError(error.message || 'Email verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await resendVerificationCode(email);
            alert('Verification code resent! Please check your email.');
        } catch (err: any) {
            setError(err.message || 'Failed to resend verification code');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="login-form-container">
            <form onSubmit={handleSubmit}>
                <h2>Email Verification</h2>
                <p>A verification code has been sent to <strong>{email}</strong></p>

                <div className="form-group">
                    <label htmlFor="verificationCode">Verification Code:</label>
                    <input
                        type="text"
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        required
                        disabled={isLoading}
                    />

                    <button type="submit" disabled={isLoading || !verificationCode}>
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </button>

                    {error && <p className="error">{error}</p>}
                    
                    <div className="verification-actions">
                        <button 
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="resend-button"
                        >
                            {isResending ? 'Resending...' : 'Resend Code'}
                        </button>
                        <button 
                            type="button"
                            onClick={onBack}
                            className="back-button"
                        >
                            Back to Sign Up
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}