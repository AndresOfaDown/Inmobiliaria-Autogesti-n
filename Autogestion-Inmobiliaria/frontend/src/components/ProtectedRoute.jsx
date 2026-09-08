import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, role, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium">Verificando autorización...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirigir al dashboard correspondiente si intenta acceder a un área no permitida para su rol
    if (role === 'PROPIETARIO') {
      return <Navigate to="/dashboard/propietario" replace />;
    }
    if (role === 'INQUILINO') {
      return <Navigate to="/dashboard/inquilino" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
