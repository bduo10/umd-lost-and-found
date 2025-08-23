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

    const BASE_URL = import.meta.env.VITE_BASE_URL;
    
    const checkAuth = async () => {
        try {
            const response = await fetch(`${BASE_URL}/auth/me`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
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

            await checkAuth();
        } catch (error) {
            console.error('Login failed:', error);
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
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const verifyEmail = async (email: string, code: string) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, code }),
            });

            if (!response.ok) {
                throw new Error('Email verification failed');
            }

            await checkAuth();
        } catch (error) {
            console.error('Email verification failed:', error);
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
            console.error('Resend verification email failed:', error);
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
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    }

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
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

