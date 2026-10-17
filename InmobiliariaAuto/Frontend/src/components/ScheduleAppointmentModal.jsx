import React, { useState } from 'react';
import { Calendar, Clock, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export default function ScheduleAppointmentModal({ isOpen, onClose, inmueble, onScheduled }) {
  const { user } = useAuthStore();
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('15:00');
  const [horaFin, setHoraFin] = useState('16:00');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !inmueble) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fecha) {
      setError('Por favor selecciona una fecha válida');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/properties/citas', {
        inmuebleId: inmueble.id,
        fecha: new Date(fecha),
        horaInicio,
        horaFin,
        notas,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onScheduled) onScheduled();
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agendar la visita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Agendar Visita Presencial</h3>
            <p className="text-xs text-slate-400 truncate max-w-[280px]">
              {inmueble.titulo}
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mb-3 animate-bounce" />
            <h4 className="text-sm font-bold text-white">¡Visita Solicitada con Éxito!</h4>
            <p className="text-xs text-slate-400 mt-1">
              El propietario ha recibido la notificación y confirmará la cita a la brevedad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha de la Visita
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hora Fin Estimada
                </label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notas o Consultas para el Propietario (Opcional)
              </label>
              <textarea
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Me interesa ver el área de lavandería y las cocheras..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>{loading ? 'Agendando...' : 'Confirmar Cita'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
