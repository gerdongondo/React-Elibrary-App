import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/AuthService';

// Interface correspondant à l'objet stocké dans localStorage
interface User {
    token: string;
    type: string;
    id: number;
    email: string;
    role?: string;          // ✅ 'role' (pas 'roles')
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // ✅ isAdmin : vrai si le rôle est 'ROLE_ADMIN'
    const isAdmin = user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        const token = AuthService.getToken();
        const currentUser = AuthService.getCurrentUser();
        if (token && currentUser) {
            setIsAuthenticated(true);
            setUser(currentUser as User);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await AuthService.login({ email, password });
        setIsAuthenticated(true);
        setUser({
            token: response.token,
            type: response.type,
            id: response.id,
            email: response.email,
            role: (response as any).role,   // récupère le champ 'role' de la réponse
        });
    };

    const logout = () => {
        AuthService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};