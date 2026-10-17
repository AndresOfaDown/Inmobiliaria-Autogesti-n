import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import router from './router';
import useStore from './store/store';

/**
 * Componente raíz de la aplicación.
 * Provee el router y carga el usuario autenticado al iniciar.
 */
const App = () => {
  const fetchUser = useStore((state) => state.fetchUser);
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applyTheme = (e) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        root.style.backgroundColor = e.matches ? '#0f172a' : '#f8fafc';
      };
      applyTheme(mediaQuery);
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    } else {
      root.setAttribute('data-theme', theme);
      root.style.backgroundColor = theme === 'dark' ? '#0f172a' : '#f8fafc';
    }
  }, [theme]);

  return <RouterProvider router={router} />;
};

export default App;
