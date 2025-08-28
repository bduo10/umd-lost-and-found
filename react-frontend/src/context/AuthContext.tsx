import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: number;
    email: string;
    username: string;
    emailVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    verifyEmail: (email: string, verificationCode: string) => Promise<void>;
    resendVerificationCode: (email: string) => Promise<void>;
    logout: () => void;
    clearUserState: () => void;
    checkAuth: () => Promise<void>;
}

interface RegisterData {
    email: string;
    username: string;
    password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser ] = useState<User | null>(null);
    const [isLoading, setIsLoading ] = useState<boolean>(true);

    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';
    
    const checkAuth = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/users/me`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                // Check if response has content before parsing JSON
                const text = await response.text();
                
                if (!text.trim()) {
                    setUser(null);
                    return;
                }
                
                try {
                    const userData = JSON.parse(text);
                    setUser(userData);
                } catch (jsonError) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });
            
            if (!response.ok) {
                throw new Error('Login failed');
            }

            // Add a small delay to ensure cookie is set
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await checkAuth();
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData)
            }); 

            if (!response.ok) {
                throw new Error('Registration failed');
            }
            await checkAuth();
        } catch (error) {
            throw error;
        }
    };

    const verifyEmail = async (email: string, verificationCode: string) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, verificationCode }),
            });

            if (!response.ok) {
                throw new Error('Email verification failed');
            }

            await checkAuth();
        } catch (error) {
            throw error;
        }
    };

    const resendVerificationCode = async (email: string) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/resend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Resend verification email failed');
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try { 
            await fetch(`${BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            // Ignore logout errors - still clear state
        } finally {
            setUser(null);
            // Note: No need to clear localStorage/sessionStorage since auth uses httpOnly cookies
            // The backend logout endpoint already clears the auth-token cookie
        }
    }

    const clearUserState = () => {
        setUser(null);
        setIsLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerificationCode,
        logout,
        clearUserState,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

