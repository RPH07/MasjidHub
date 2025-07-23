import { useState, useEffect } from 'react';
import authService from '../services/authService'; 

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserFromLocalStorage = () => {
            try {
                const currentUser = authService.getCurrentUser();
                const token = authService.getToken();

                if (token && currentUser) {
                    setUser(currentUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error getting user data:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getUserFromLocalStorage();

        // Listen for localStorage changes
        const handleStorageChange = (e) => {
            if (e.key === 'userData' || e.key === 'token') {
                getUserFromLocalStorage();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    //  Function logout pakai authService
    const logout = async () => {
        await authService.logout(); 
        setUser(null);
    };

    return { 
        user, 
        loading,
        logout,
        isAuthenticated: authService.isAuthenticated(),
        isAdmin: authService.isAdmin()
    };
};