import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { loginSchema } from '../schemas/authSchemas';
import { Eye, EyeOff, Lock, Mail, Building2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, role, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const successNotice = location.state?.message;

  useEffect(() => {
    if (isAuthenticated && role) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/dashboard/admin', { replace: true });
      } else {
        navigate('/dashboard/usuario', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const errors = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const res = await login(formData.email, formData.password);
    if (res.success && res.user) {
      if (res.user.role === 'ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/usuario');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md z-10">
        {/* Encabezado con Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-xl bg-blue-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-xl font-bold tracking-tight text-slate-900 font-['Outfit']">SAIPI</span>
              <span className="block text-xs text-blue-600 font-semibold">Autogestión Inmobiliaria</span>
            </div>
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Outfit']">
            Bienvenido de nuevo
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Ingresa tus credenciales para acceder a tu panel de control
          </p>
        </div>

        {/* Tarjeta de Inicio de Sesión */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 relative">
          {successNotice && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>{successNotice}</div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            {/* Input Correo */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${
                    formErrors.email
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/15'
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <span>•</span> {formErrors.email}
                </p>
              )}
            </div>

            {/* Input Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${
                    formErrors.password
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/15'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <span>•</span> {formErrors.password}
                </p>
              )}
            </div>

            {/* Botón Submit */}
            <button
              id="submit-login"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a mi cuenta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Enlace de Registro */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              ¿Aún no tienes una cuenta?{' '}
              <Link
                to="/"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
