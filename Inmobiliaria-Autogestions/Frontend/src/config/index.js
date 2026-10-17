// Configuración centralizada de variables de entorno
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (isLocal ? 'http://localhost:3000/api' : 'https://autogestion-inmobiliaria-production.up.railway.app/api');
