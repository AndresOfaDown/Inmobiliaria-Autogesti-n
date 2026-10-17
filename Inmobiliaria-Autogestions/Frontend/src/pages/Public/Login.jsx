import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/Button';
import './Login.css';

/**
 * Página de inicio de sesión.
 */
const Login = () => {
  const { login } = useAuth();
  
  // Cambiamos 'username' por 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Nuevo estado para controlar el "ojito"
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Pasamos el email en lugar del username
      await login(email, password);
    } catch {
      setError('Credenciales incorrectas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login" id="login-page">
      <form className="login__form" onSubmit={handleSubmit}>
        {error && <div className="login__error">{error}</div>}

        <div className="login__field">
          <label htmlFor="email" className="login__label">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            className="login__input"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login__field">
          <label htmlFor="password" className="login__label">Contraseña</label>
          {/* Envolvemos el input en un div relativo para poder posicionar el ojito */}
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              /* Si showPassword es true, mostramos texto, sino, lo ocultamos */
              type={showPassword ? "text" : "password"} 
              className="login__input"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }} 
            />
            
            {/* Botón del ojito */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                padding: '0'
              }}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                // Icono de Ojo Tachado (Ocultar)
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                // Icono de Ojo Abierto (Mostrar)
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Iniciar Sesión
        </Button>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
            Regístrate aquí
          </Link>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Volver al Inicio
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;