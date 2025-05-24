// AuthContext.tsx
import React, {createContext, useContext, useState, useEffect} from 'react';

// import {User, LogOut, Settings, Shield} from 'lucide-react';

interface UserData {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    is_active: boolean;
    date_joined: string;
    last_login?: string;
}

interface AuthContextType {
    user: UserData | null;
    token: string | null;
    loading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    console.log(token)

    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('userData');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await response.json();

            setToken(data.token);
            setUser(data.user);

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));

            return {success: true};
        } catch (error) {
            return {success: false, error: error instanceof Error ? error.message : 'Error desconocido'};
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await fetch('http://localhost:8000/api/auth/logout/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        }
    };

    const refreshUserData = async () => {
        if (!token) return;

        try {
            const response = await fetch('http://localhost:8000/api/auth/user/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem('userData', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Error al actualizar datos del usuario:', error);
        }
    };

    const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
        const config = {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        const response = await fetch(url, config);

        if (response.status === 401) {
            logout();
            throw new Error('Sesión expirada');
        }

        return response;
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        refreshUserData,
        authenticatedFetch,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isModerator: user?.role === 'moderator' || user?.role === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};