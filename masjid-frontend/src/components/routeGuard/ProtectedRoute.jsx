import { Navigate } from 'react-router-dom';
// import { useAuth } from '@/hooks/useAuth';
import api, { 
    AUTH_SESSION_EXPIRED_MESSAGE, 
    AUTH_SESSION_MESSAGE_KEY,
    AUTH_CHANGED_EVENT
} from '@/config/api';
import { useEffect, useState } from 'react';


const ProtectedRoute = ({ children }) => {
    const [checking, setChecking] = useState(true);
    const [valid, setValid] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setValid(false);
                setChecking(false);
                return;
            }

            try {
                await api.get('/user/me');
                setValid(true);
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.dispatchEvent(new  Event(AUTH_CHANGED_EVENT));
                sessionStorage.setItem(AUTH_SESSION_MESSAGE_KEY, AUTH_SESSION_EXPIRED_MESSAGE);
                setValid(false);
            } finally {
                setChecking(false);
            }
        };
        checkToken();
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (!valid) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
