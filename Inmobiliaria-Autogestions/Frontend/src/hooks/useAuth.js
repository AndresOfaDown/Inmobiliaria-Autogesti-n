import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';

/**
 * Hook personalizado de autenticación
 */
const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout: storeLogout, fetchUser, updateUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  const handleLogin = async (username, password) => {
    const user = await login(username, password);
    const role = user?.rol?.toLowerCase() || '';
    
    if (role === 'admin') {
      navigate('/panel/dashboard');
    } else {
      navigate('/propiedades');
    }
    return user;
  };

  const handleLogout = () => {
    storeLogout();
    navigate('/propiedades');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
  };
};

export default useAuth;
