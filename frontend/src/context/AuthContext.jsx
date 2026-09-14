import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('agros_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('agros_token');
            const savedUser = localStorage.getItem('agros_user');
            
            if (savedToken && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    setToken(savedToken);
                } catch (e) {
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        const data = await api.auth.login({ username, password });
        const userInfo = {
            username: data.username,
            role: data.role,
            full_name: data.full_name || data.username
        };
        localStorage.setItem('agros_token', data.token);
        localStorage.setItem('agros_user', JSON.stringify(userInfo));
        setToken(data.token);
        setUser(userInfo);
        return userInfo;
    };

    const quickLogin = async (roleType) => {
        if (roleType === 'admin') {
            return await login('admin', 'password123');
        } else {
            return await login('cashier', 'cashier123');
        }
    };

    const logout = () => {
        localStorage.removeItem('agros_token');
        localStorage.removeItem('agros_user');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, quickLogin, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
