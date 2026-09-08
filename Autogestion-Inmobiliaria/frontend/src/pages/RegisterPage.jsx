import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { registerSchema } from '../schemas/authSchemas';
import {
  Building,
  User,
  KeyRound,
  Mail,
  Phone,
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  Home,
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'PROPIETARIO', // Por defecto PROPIETARIO
    telefono: '',
    documento_identidad: '',
    password: '',
    password_confirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Criterios de contraseña calculados en tiempo real
  const passwordCriteria = {
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    matches: formData.password && formData.password === formData.password_confirm,
  };

  const validateField = (name, value, allData) => {
    const dataToTest = { ...allData, [name]: value };
    const result = registerSchema.safeParse(dataToTest);

    if (result.success) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    } else {
      const fieldIssue = result.error.issues.find((issue) => issue.path[0] === name);
      if (fieldIssue) {
        setFormErrors((prev) => ({ ...prev, [name]: fieldIssue.message }));
      } else {
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (touchedFields[name]) {
      validateField(name, value, updated);
    }
    if (name === 'password' && touchedFields['password_confirm']) {
      validateField('password_confirm', updated.password_confirm, updated);
    }
    if (error) clearError();
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    validateField(name, value, formData);
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    if (touchedFields['role']) {
      validateField('role', selectedRole, { ...formData, role: selectedRole });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Marcar todos los campos como tocados
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouchedFields(allTouched);

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const errors = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const res = await register(formData);

    if (res.success) {
      // Si el backend retornó token de sesión directa, redirigir al dashboard según el rol
      if (res.data?.access) {
        if (formData.role === 'PROPIETARIO') {
          navigate('/dashboard/propietario');
        } else {
          navigate('/dashboard/inquilino');
        }
      } else {
        navigate('/login', {
          state: {
            message: res.mensaje || '¡Cuenta creada con éxito! Por favor inicia sesión.',
          },
        });
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="text-left">
              <span className="block text-xl font-bold tracking-tight text-white font-['Outfit']">SAIPI</span>
              <span className="block text-xs text-amber-400/80 font-medium">Autogestión Inmobiliaria</span>
            </div>
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Outfit']">
            Crea tu cuenta en SAIPI
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Únete a la plataforma líder en autogestión de propiedades y arriendos inteligentes
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" id="register-form">
            {/* 1. Selector Visual de Rol Interactivo */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                ¿Cuál es tu rol principal?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opción Propietario */}
                <button
                  type="button"
                  id="role-propietario"
                  onClick={() => handleRoleSelect('PROPIETARIO')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                    formData.role === 'PROPIETARIO'
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 text-white'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      formData.role === 'PROPIETARIO'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white">Soy Propietario</span>
                      {formData.role === 'PROPIETARIO' && (
                        <CheckCircle className="w-4 h-4 text-amber-400 ml-2" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Publico y gestiono inmuebles, contratos y cobros de arriendo.
                    </p>
                  </div>
                </button>

                {/* Opción Inquilino */}
                <button
                  type="button"
                  id="role-inquilino"
                  onClick={() => handleRoleSelect('INQUILINO')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                    formData.role === 'INQUILINO'
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 text-white'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      formData.role === 'INQUILINO'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white">Soy Inquilino</span>
                      {formData.role === 'INQUILINO' && (
                        <CheckCircle className="w-4 h-4 text-amber-400 ml-2" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Busco arriendos, realizo solicitudes y gestiono mis pagos.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Datos Personales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Nombres <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej. Carlos"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                      formErrors.first_name
                        ? 'border-rose-500 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
                </div>
                {formErrors.first_name && (
                  <p className="mt-1 text-xs text-rose-400">
                    {formErrors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Apellidos <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej. Morales"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                      formErrors.last_name
                        ? 'border-rose-500 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
                </div>
                {formErrors.last_name && (
                  <p className="mt-1 text-xs text-rose-400">
                    {formErrors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Correo Electrónico <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="tu@correo.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                    formErrors.email
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-xs text-rose-400">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Campos Específicos según rol / Información adicional */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400/90 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Información de Identificación ({formData.role === 'PROPIETARIO' ? 'Propietario' : 'Inquilino'})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Documento de Identidad (Cédula / CI)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      id="documento_identidad"
                      name="documento_identidad"
                      type="text"
                      value={formData.documento_identidad}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej. 12345678"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                        formErrors.documento_identidad
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                      }`}
                    />
                  </div>
                  {formErrors.documento_identidad && (
                    <p className="mt-1 text-xs text-rose-400">
                      {formErrors.documento_identidad}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Teléfono de Contacto
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+591 77084747"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                        formErrors.telefono
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                      }`}
                    />
                  </div>
                  {formErrors.telefono && (
                    <p className="mt-1 text-xs text-rose-400">
                      {formErrors.telefono}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Contraseña <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                      formErrors.password
                        ? 'border-rose-500 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-xs text-rose-400">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Confirmar Contraseña <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="password_confirm"
                    name="password_confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                      formErrors.password_confirm
                        ? 'border-rose-500 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password_confirm && (
                  <p className="mt-1 text-xs text-rose-400">
                    {formErrors.password_confirm}
                  </p>
                )}
              </div>
            </div>

            {/* Checklist de requerimientos en tiempo real */}
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs grid grid-cols-2 gap-2 text-slate-400">
              <div className={`flex items-center gap-1.5 ${passwordCriteria.length ? 'text-emerald-400' : ''}`}>
                <CheckCircle className={`w-3.5 h-3.5 ${passwordCriteria.length ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Mínimo 8 caracteres</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? 'text-emerald-400' : ''}`}>
                <CheckCircle className={`w-3.5 h-3.5 ${passwordCriteria.hasUpper ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Al menos una mayúscula</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-400' : ''}`}>
                <CheckCircle className={`w-3.5 h-3.5 ${passwordCriteria.hasNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Al menos un número</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordCriteria.matches ? 'text-emerald-400' : ''}`}>
                <CheckCircle className={`w-3.5 h-3.5 ${passwordCriteria.matches ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>Contraseñas coinciden</span>
              </div>
            </div>

            {/* Botón Submit */}
            <button
              id="submit-register"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Completar Registro como {formData.role === 'PROPIETARIO' ? 'Propietario' : 'Inquilino'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Enlace a Login */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-sm text-slate-400">
              ¿Ya tienes una cuenta registrada?{' '}
              <Link
                to="/login"
                className="text-amber-400 font-semibold hover:text-amber-300 hover:underline transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
