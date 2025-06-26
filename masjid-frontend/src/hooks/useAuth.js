import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ambil data user dari localStorage
        const getUserFromLocalStorage = () => {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('userData');
                const userRole = localStorage.getItem('userRole');

                if (token && userData) {
                    const parsedUserData = JSON.parse(userData);
                    
                    // Set user dengan data dari localStorage
                    setUser({
                        ...parsedUserData,
                        role: userRole || parsedUserData.role
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getUserFromLocalStorage();

        // Listen for localStorage changes (jika login dari tab lain)
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

    // Function untuk logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        setUser(null);
    };

    return { 
        user, 
        loading,
        logout 
    };
};