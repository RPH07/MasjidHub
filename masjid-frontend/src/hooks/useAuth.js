import { AUTH_CHANGED_EVENT } from '@/config/api';
import { useState, useEffect } from 'react';


export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = () => {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            setUser(null);
            setLoading(false);
            return; 
        }
        try {
            setUser(JSON.parse(storedUser));
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();

        // Listen for localStorage changes (jika login dari tab lain)
        const handleAuthChange = () => {
            loadUser();
        };

        window.addEventListener('storage', handleAuthChange);
        window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);

        return () => {
            window.removeEventListener('storage', handleAuthChange);
            window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
        };
    }, []);

    // Function untuk logout
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
        setUser(null);
    };

    return { 
        user, 
        loading,
        logout 
    };
};