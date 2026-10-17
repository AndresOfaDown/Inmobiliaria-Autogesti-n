import { Navigate, Outlet } from 'react-router-dom';
import useStore from '../store/store';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const userRole = user.rol?.toLowerCase();
    const isAllowed = allowedRoles.some(r => r.toLowerCase() === userRole);
    if (!isAllowed) {
      return <Navigate to="/" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;