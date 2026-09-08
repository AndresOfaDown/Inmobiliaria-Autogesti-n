import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { registerSchema, loginSchema } from '../schemas/authSchemas';
import { Eye, EyeOff, Building, Home, CheckCircle2, AlertCircle } from 'lucide-react';
import './AuthForm.css';

function AuthForm() {
  const navigate = useNavigate();
  const { login, register, loading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState('registro'); // 'login' | 'registro' (en la captura muestra 'Crear Cuenta' activo)
  const [successMessage, setSuccessMessage] = useState(null);

  // Toggle de visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errores de validación
  const [fieldErrors, setFieldErrors] = useState({});

  // Login fields
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Registro fields
  const [registroData, setRegistroData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'PROPIETARIO', // Por defecto PROPIETARIO
    telefono: '',
    documento_identidad: '',
    password: '',
    password_confirm: '',
  });

  const clearMessages = () => {
    setSuccessMessage(null);
    setFieldErrors({});
    clearError();
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    clearMessages();
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) clearError();
  };

  const handleRegistroChange = (e) => {
    const { name, value } = e.target;
    setRegistroData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) clearError();
  };

  const handleRoleChange = (role) => {
    setRegistroData((prev) => ({ ...prev, role }));
  };

  // Criterios de contraseña calculados
  const passwordCriteria = {
    length: registroData.password.length >= 8,
    hasUpper: /[A-Z]/.test(registroData.password),
    hasNumber: /[0-9]/.test(registroData.password),
    matches: registroData.password && registroData.password === registroData.password_confirm,
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Validación Zod
    const validation = loginSchema.safeParse(loginData);
    if (!validation.success) {
      const errors = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) errors[issue.path[0]] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    const res = await login(loginData.email, loginData.password);
    if (res.success && res.user) {
      setSuccessMessage(`¡Bienvenido/a, ${res.user.first_name || 'Usuario'}!`);
      setTimeout(() => {
        if (res.user.role === 'PROPIETARIO') {
          navigate('/dashboard/propietario');
        } else {
          navigate('/dashboard/inquilino');
        }
      }, 700);
    }
  };

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Validación Zod
    const validation = registerSchema.safeParse(registroData);
    if (!validation.success) {
      const errors = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] && !errors[issue.path[0]]) {
          errors[issue.path[0]] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    const res = await register(registroData);
    if (res.success) {
      setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo a tu panel...');
      setTimeout(() => {
        if (registroData.role === 'PROPIETARIO') {
          navigate('/dashboard/propietario');
        } else {
          navigate('/dashboard/inquilino');
        }
      }, 900);
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
      {successMessage && (
        <div className="auth-message success" role="alert">
          <CheckCircle2 width="18" height="18" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="auth-message error" role="alert">
          <AlertCircle width="18" height="18" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="auth-form" id="login-form">
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
            {fieldErrors.email && <span className="field-error">• {fieldErrors.email}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Contraseña</label>
            <div className="input-with-toggle">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && <span className="field-error">• {fieldErrors.password}</span>}
          </div>

          <button
            id="btn-login"
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Iniciar Sesión'}
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
        <form onSubmit={handleRegistroSubmit} className="auth-form" id="registro-form">
          {/* Selector de Rol HU-10 */}
          <div className="role-selector-container">
            <label>Tipo de Usuario</label>
            <div className="role-selector">
              <button
                type="button"
                id="role-prop"
                className={`role-pill ${registroData.role === 'PROPIETARIO' ? 'active' : ''}`}
                onClick={() => handleRoleChange('PROPIETARIO')}
              >
                <Building size={15} />
                <span>Soy Propietario</span>
              </button>
              <button
                type="button"
                id="role-inq"
                className={`role-pill ${registroData.role === 'INQUILINO' ? 'active' : ''}`}
                onClick={() => handleRoleChange('INQUILINO')}
              >
                <Home size={15} />
                <span>Soy Inquilino</span>
              </button>
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="reg-nombre">Nombre</label>
              <input
                id="reg-nombre"
                type="text"
                name="first_name"
                placeholder="Juan"
                value={registroData.first_name}
                onChange={handleRegistroChange}
                required
              />
              {fieldErrors.first_name && <span className="field-error">• {fieldErrors.first_name}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="reg-apellido">Apellido</label>
              <input
                id="reg-apellido"
                type="text"
                name="last_name"
                placeholder="Pérez"
                value={registroData.last_name}
                onChange={handleRegistroChange}
                required
              />
              {fieldErrors.last_name && <span className="field-error">• {fieldErrors.last_name}</span>}
            </div>
          </div>

          {/* Correo Electrónico */}
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
            {fieldErrors.email && <span className="field-error">• {fieldErrors.email}</span>}
          </div>

          {/* Teléfono y Documento de Identidad */}
          <div className="input-row">
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
              {fieldErrors.telefono && <span className="field-error">• {fieldErrors.telefono}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="reg-doc">Cédula / CI</label>
              <input
                id="reg-doc"
                type="text"
                name="documento_identidad"
                placeholder="12345678"
                value={registroData.documento_identidad}
                onChange={handleRegistroChange}
              />
              {fieldErrors.documento_identidad && (
                <span className="field-error">• {fieldErrors.documento_identidad}</span>
              )}
            </div>
          </div>

          {/* Contraseña y Confirmar */}
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="reg-password">Contraseña</label>
              <div className="input-with-toggle">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  value={registroData.password}
                  onChange={handleRegistroChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">• {fieldErrors.password}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="reg-password-confirm">Confirmar</label>
              <div className="input-with-toggle">
                <input
                  id="reg-password-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirm"
                  placeholder="Repite contraseña"
                  value={registroData.password_confirm}
                  onChange={handleRegistroChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password_confirm && (
                <span className="field-error">• {fieldErrors.password_confirm}</span>
              )}
            </div>
          </div>

          {/* Checklist en tiempo real de contraseña */}
          <div className="password-checklist">
            <div className={`checklist-item ${passwordCriteria.length ? 'valid' : ''}`}>
              <span>{passwordCriteria.length ? '✓' : '•'}</span>
              <span>8+ caracteres</span>
            </div>
            <div className={`checklist-item ${passwordCriteria.hasUpper ? 'valid' : ''}`}>
              <span>{passwordCriteria.hasUpper ? '✓' : '•'}</span>
              <span>Al menos una mayúscula</span>
            </div>
            <div className={`checklist-item ${passwordCriteria.hasNumber ? 'valid' : ''}`}>
              <span>{passwordCriteria.hasNumber ? '✓' : '•'}</span>
              <span>Al menos un número</span>
            </div>
            <div className={`checklist-item ${passwordCriteria.matches ? 'valid' : ''}`}>
              <span>{passwordCriteria.matches ? '✓' : '•'}</span>
              <span>Coincidencia</span>
            </div>
          </div>

          <button
            id="btn-registro"
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Crear Cuenta'}
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
