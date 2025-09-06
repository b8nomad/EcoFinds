import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isUser: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'USER' | 'ADMIN' | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserProfile() {
            const storedToken = localStorage.getItem('token');

            if (!storedToken) {
                setLoading(false);
                return;
            }

            setToken(storedToken);

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/authenticate`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${storedToken}`
                    }
                });

                const { success, data } = await res.json();

                if (success) {
                    setUser(data);
                    setRole(data.role);
                } else {
                    // Token is invalid, clear storage
                    setUser(null);
                    setRole(null);
                    setToken(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setUser(null);
                setRole(null);
                setToken(null);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        fetchUserProfile().finally(() => setLoading(false));
    }, []);

    const login = (authToken: string, userData: User) => {
        setToken(authToken);
        setUser(userData);
        setRole(userData.role);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };


    const isAdmin = role === 'ADMIN';
    const isUser = role === 'USER';

    const isAuthenticated = !loading && !!user && !!token;

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isUser,
        loading
    };

    return (
        loading ? <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
        </div> : <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};