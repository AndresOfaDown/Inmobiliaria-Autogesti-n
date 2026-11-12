import { useState, useEffect, useCallback } from 'react';
import {
  Lock, Unlock, KeyRound, Wifi, Battery, Copy, Check, RefreshCw,
  Home, ShieldCheck, Sparkles, AlertCircle, Clock
} from 'lucide-react';
import iotService from '../../services/iotService';
import useAuth from '../../hooks/useAuth';
import useAlertConfirm from '../../hooks/useAlertConfirm';
import './Propiedades.css';

const MisLlaves = () => {
  const { isAuthenticated, user } = useAuth();
  const { showAlert, ModalComponent } = useAlertConfirm();
  const [llaves, setLlaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [pinCopiadoId, setPinCopiadoId] = useState(null);

  const fetchLlaves = useCallback(async () => {
    setLoading(true);
    try {
      const data = await iotService.getMisLlaves();
      setLlaves(data || []);
    } catch (err) {
      console.error('Error fetching digital keys:', err);
      setLlaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLlaves();
    }
  }, [isAuthenticated, fetchLlaves]);

  const handleToggleAccion = async (llave) => {
    const accion = llave.bloqueado ? 'desbloquear' : 'bloquear';
    setActionLoading(llave.id);

    try {
      const res = await iotService.ejecutarAccion(llave.id, accion, 'app');
      showAlert({
        title: accion === 'desbloquear' ? '¡Puerta Desbloqueada!' : '¡Cerradura Bloqueada!',
        message: res.mensaje,
        status: 'success',
      });
      fetchLlaves();
    } catch (err) {
      showAlert({
        title: 'Acceso Denegado',
        message: err.response?.data?.message || 'No se pudo operar la cerradura.',
        status: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerarNuevoPin = async (llave) => {
    setActionLoading(`pin-${llave.id}`);
    try {
      const res = await iotService.ejecutarAccion(llave.id, 'generar_pin', 'app');
      showAlert({
        title: '¡Nuevo PIN Generado!',
        message: `Tu nuevo código de acceso temporal es: ${res.pin}`,
        status: 'success',
      });
      fetchLlaves();
    } catch (err) {
      showAlert({
        title: 'Error',
        message: err.response?.data?.message || 'No se pudo generar nuevo PIN.',
        status: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopiarPin = (pin, id) => {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    setPinCopiadoId(id);
    setTimeout(() => setPinCopiadoId(null), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="propiedades-page">
        <div className="propiedades-empty">Inicia sesión para gestionar tus llaves digitales</div>
      </div>
    );
  }

  return (
    <div className="propiedades-page" style={{ paddingTop: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(12px, 4vw, 24px)' }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={26} color="#0284c7" />
              Mis Llaves Digitales IoT
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.9rem' }}>
              Control de acceso autónomo a cerraduras inteligentes autorizadas
            </p>
          </div>

          <button
            onClick={fetchLlaves}
            disabled={loading}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualizar Estados
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <RefreshCw size={32} className="spin" style={{ marginBottom: '12px' }} />
            <p>Conectando con el Gateway de Cerraduras Inteligentes...</p>
          </div>
        ) : llaves.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <Lock size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '1.2rem', color: '#1e293b', margin: '0 0 6px' }}>No tienes llaves digitales activas</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 16px' }}>
              Las llaves de acceso digital se asignan automáticamente al tener un <strong>Smart Contract de arrendamiento activo</strong> o al confirmar una cita de visita.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {llaves.map((llave) => {
              const isLocked = llave.bloqueado;
              const isOnline = llave.estado_conexion === 'online';

              return (
                <div key={llave.id} style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '22px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  border: isLocked ? '1px solid #e2e8f0' : '2px solid #22c55e',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}>
                  {/* Badge de Rol */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <span style={{
                        background: llave.es_propietario ? '#f0f9ff' : '#ecfdf5',
                        color: llave.es_propietario ? '#0284c7' : '#059669',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: llave.es_propietario ? '1px solid #bae6fd' : '1px solid #a7f3d0'
                      }}>
                        <ShieldCheck size={12} /> {llave.rol_acceso}
                      </span>
                      {llave.smart_contract_id && (
                        <span style={{
                          background: '#f5f3ff',
                          color: '#6d28d9',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          marginLeft: '6px',
                          border: '1px solid #ddd6fe'
                        }}>
                          {llave.smart_contract_id}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: isOnline ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                        <Wifi size={13} /> {isOnline ? 'Online' : 'Offline'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: llave.bateria > 20 ? '#0284c7' : '#dc2626', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                        <Battery size={13} /> {llave.bateria}%
                      </span>
                    </div>
                  </div>

                  {/* Nombre y Ubicación */}
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {llave.nombre}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Home size={14} /> {llave.inmueble_titulo} · {llave.ubicacion}
                    </div>
                  </div>

                  {/* BOTÓN PRINCIPAL DE APERTURA / CIERRE */}
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <button
                      onClick={() => handleToggleAccion(llave)}
                      disabled={actionLoading === llave.id}
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '14px',
                        border: 'none',
                        background: isLocked
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        cursor: actionLoading === llave.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: isLocked
                          ? '0 6px 20px rgba(16,185,129,0.35)'
                          : '0 6px 20px rgba(239,68,68,0.35)',
                        transition: 'transform 0.15s, box-shadow 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {actionLoading === llave.id ? (
                        <div style={{ width: '22px', height: '22px', border: '3px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : isLocked ? (
                        <>
                          <Unlock size={22} />
                          <span>Desbloquear Puerta</span>
                        </>
                      ) : (
                        <>
                          <Lock size={22} />
                          <span>Echar Cerrojo (Bloquear)</span>
                        </>
                      )}
                    </button>
                    <div style={{ fontSize: '0.78rem', color: isLocked ? '#64748b' : '#16a34a', marginTop: '8px', fontWeight: 600 }}>
                      Estado actual: {isLocked ? '🔒 Cerrojo echado (Cerrada)' : '🔓 Puerta abierta (Desbloqueada)'}
                    </div>
                  </div>

                  {/* CAJA DE CÓDIGO PIN TEMPORAL */}
                  {llave.pin_codigo && (
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                          PIN Teclado Físico
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', letterSpacing: '2px', fontFamily: 'monospace' }}>
                          {llave.pin_codigo}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleCopiarPin(llave.pin_codigo, llave.id)}
                          title="Copiar PIN"
                          style={{
                            background: pinCopiadoId === llave.id ? '#dcfce7' : '#fff',
                            color: pinCopiadoId === llave.id ? '#15803d' : '#475569',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {pinCopiadoId === llave.id ? <Check size={14} /> : <Copy size={14} />}
                          {pinCopiadoId === llave.id ? 'Copiado' : 'Copiar'}
                        </button>

                        <button
                          onClick={() => handleGenerarNuevoPin(llave)}
                          disabled={actionLoading === `pin-${llave.id}`}
                          title="Generar nuevo PIN"
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            color: '#475569',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <RefreshCw size={13} className={actionLoading === `pin-${llave.id}` ? 'spin' : ''} />
                          Nuevo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {ModalComponent}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MisLlaves;
