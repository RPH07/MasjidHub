import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';    

const AuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
        return;
      }

      if (session) {
        // Set local storage
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('userRole', session.user.user_metadata.role || 'user');
        
        // Redirect based on role
        const userRole = session.user.user_metadata.role;
        navigate(userRole === 'admin' ? '/admin' : '/dashboard');
      } else {
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  );
};

export default AuthCallback;