import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.rol === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      // Error handled by store
    }
  };

  const handleQuickLogin = async (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    try {
      const loggedUser = await login(quickEmail, quickPass);
      if (loggedUser.rol === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {}
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 mx-auto shadow-xl shadow-indigo-600/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Iniciar Sesión en InmoAuto
          </h2>
          <p className="text-xs text-slate-400">
            Accede a tus contratos, visitas agendadas, pagos y chats directos
          </p>
        </div>

        {/* 1-Click Demo Accounts Bar */}
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2 text-center">
          <span className="text-[11px] font-bold text-indigo-300 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Acceso Rápido de Prueba (1 Clic)
          </span>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@inmobiliaria.com', 'admin123')}
              className="py-1.5 px-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-[10px] font-bold text-purple-200 transition-all"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('carlos.propietario@gmail.com', 'user123')}
              className="py-1.5 px-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-[10px] font-bold text-blue-200 transition-all"
            >
              🏡 Propietario
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('lucia.inquilino@gmail.com', 'user123')}
              className="py-1.5 px-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 text-[10px] font-bold text-emerald-200 transition-all"
            >
              🔑 Inquilino
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-60"
            >
              <span>{loading ? 'Iniciando sesión...' : 'Entrar a mi Cuenta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
              Regístrate gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
