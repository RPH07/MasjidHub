import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AdminRoute = ({ children }) => {
  const {user, loading} = useAuth();
  if(loading) return <div>Loading....</div>;

  if (!user || !['admin', 'dkm'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
