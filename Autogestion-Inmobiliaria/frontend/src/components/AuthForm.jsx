import { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';

const API_URL = 'http://localhost:8000/api/auth';

function AuthForm() {
  const [mode, setMode] = useState('login'); // 'login' | 'registro'
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // Login fields
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Registro fields
  const [registroData, setRegistroData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    password_confirm: '',
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegistroChange = (e) => {
    setRegistroData({ ...registroData, [e.target.name]: e.target.value });
  };

  const clearMessages = () => {
    setMensaje(null);
    setError(null);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    clearMessages();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login/`, loginData, {
        withCredentials: true,
      });
      setMensaje(`¡Bienvenido/a, ${res.data.usuario.nombre}!`);
    } catch (err) {
      const data = err.response?.data;
      if (data?.non_field_errors) {
        setError(data.non_field_errors[0]);
      } else if (typeof data === 'object') {
        setError(Object.values(data).flat().join(' '));
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    clearMessages();

    if (registroData.password !== registroData.password_confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/registro/`, registroData, {
        withCredentials: true,
      });
      setMensaje(`¡Cuenta creada! Bienvenido/a, ${res.data.usuario.nombre}.`);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        const messages = [];
        for (const [key, value] of Object.entries(data)) {
          const fieldMessages = Array.isArray(value) ? value : [value];
          messages.push(...fieldMessages);
        }
        setError(messages.join(' '));
      } else {
        setError('Error al crear la cuenta. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {/* Tabs */}
      <div className="auth-tabs">
        <button
          id="tab-login"
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => switchMode('login')}
          type="button"
        >
          Iniciar Sesión
        </button>
        <button
          id="tab-registro"
          className={`auth-tab ${mode === 'registro' ? 'active' : ''}`}
          onClick={() => switchMode('registro')}
          type="button"
        >
          Crear Cuenta
        </button>
        <div className={`auth-tab-indicator ${mode === 'registro' ? 'right' : ''}`} />
      </div>

      {/* Messages */}
      {mensaje && (
        <div className="auth-message success" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {mensaje}
        </div>
      )}
      {error && (
        <div className="auth-message error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {/* Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="auth-form" id="login-form">
          <div className="input-group">
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="tu@correo.com"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="btn-login"
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <p className="auth-switch">
            ¿No tienes cuenta?{' '}
            <button type="button" onClick={() => switchMode('registro')}>
              Crear una
            </button>
          </p>
        </form>
      )}

      {/* Registro Form */}
      {mode === 'registro' && (
        <form onSubmit={handleRegistro} className="auth-form" id="registro-form">
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="reg-nombre">Nombre</label>
              <input
                id="reg-nombre"
                type="text"
                name="nombre"
                placeholder="Juan"
                value={registroData.nombre}
                onChange={handleRegistroChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="reg-apellido">Apellido</label>
              <input
                id="reg-apellido"
                type="text"
                name="apellido"
                placeholder="Pérez"
                value={registroData.apellido}
                onChange={handleRegistroChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">Correo electrónico</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="tu@correo.com"
              value={registroData.email}
              onChange={handleRegistroChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="reg-telefono">Teléfono (opcional)</label>
            <input
              id="reg-telefono"
              type="tel"
              name="telefono"
              placeholder="+54 11 1234 5678"
              value={registroData.telefono}
              onChange={handleRegistroChange}
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="reg-password">Contraseña</label>
              <input
                id="reg-password"
                type="password"
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={registroData.password}
                onChange={handleRegistroChange}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="input-group">
              <label htmlFor="reg-password-confirm">Confirmar</label>
              <input
                id="reg-password-confirm"
                type="password"
                name="password_confirm"
                placeholder="Repite contraseña"
                value={registroData.password_confirm}
                onChange={handleRegistroChange}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            id="btn-registro"
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              'Crear Cuenta'
            )}
          </button>

          <p className="auth-switch">
            ¿Ya tienes cuenta?{' '}
            <button type="button" onClick={() => switchMode('login')}>
              Inicia sesión
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

export default AuthForm;
