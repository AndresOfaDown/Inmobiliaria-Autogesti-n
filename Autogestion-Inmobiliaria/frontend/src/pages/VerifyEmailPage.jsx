import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Building2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuthStore();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se proporcionó un token de verificación válido en la URL.');
      return;
    }

    let isMounted = true;

    const performVerification = async () => {
      const res = await verifyEmail(token);
      if (!isMounted) return;

      if (res.success) {
        setStatus('success');
        setMessage(res.mensaje || '¡Tu correo electrónico ha sido verificado con éxito!');
      } else {
        setStatus('error');
        setMessage(res.error || 'El enlace de verificación no es válido o ha expirado.');
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="text-left">
              <span className="block text-xl font-bold tracking-tight text-white font-['Outfit']">SAIPI</span>
              <span className="block text-xs text-amber-400/80 font-medium">Autogestión Inmobiliaria</span>
            </div>
          </Link>
        </div>

        {/* Tarjeta de Estado */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-black/60 text-center">
          {status === 'verifying' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Verificando correo electrónico...</h2>
              <p className="text-sm text-slate-400">
                Estamos procesando tu solicitud de verificación de cuenta en SAIPI. Por favor espera un momento.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">¡Verificación Exitosa!</h2>
              <p className="text-sm text-slate-300">{message}</p>
              <div className="pt-4">
                <Link
                  to="/login"
                  state={{ message: 'Correo confirmado correctamente. Ya puedes iniciar sesión.' }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <XCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Error de Verificación</h2>
              <p className="text-sm text-slate-300">{message}</p>
              <div className="pt-4 space-y-3">
                <Link
                  to="/login"
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <span>Ir al Inicio de Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/registro"
                  className="block text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  ¿Deseas registrar una nueva cuenta?
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
