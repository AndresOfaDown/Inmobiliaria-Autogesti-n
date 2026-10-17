import { useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, CheckCheck, CircleAlert, CircleCheck, Info } from 'lucide-react';

import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import './Propiedades.css';
import useAlertConfirm from '../../hooks/useAlertConfirm';

const MisNotificaciones = () => {
  const { isAuthenticated } = useAuth();
  const { showAlert, ModalComponent } = useAlertConfirm();
  const [tab, setTab] = useState('sistema');
  const [sistema, setSistema] = useState([]);
  const [usuarioNotif, setUsuarioNotif] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const [resSistema, resUsuario] = await Promise.all([
        api.get('/usuarios/notificaciones/sistema/?personal=true'),
        api.get('/usuarios/notificaciones/usuario/?personal=true'),
      ]);
      setSistema(resSistema.data.results || resSistema.data || []);
      setUsuarioNotif(resUsuario.data.results || resUsuario.data || []);
    } catch {
      setSistema([]);
      setUsuarioNotif([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    cargarNotificaciones();
  }, [isAuthenticated]);

  const dataActiva = useMemo(() => (tab === 'sistema' ? sistema : usuarioNotif), [tab, sistema, usuarioNotif]);

  const marcarLeidas = async () => {
    try {
      await api.post('/usuarios/notificaciones/marcar-leidas/?personal=true', { origen: tab });
      cargarNotificaciones();
      showAlert({ title: 'Notificaciones Leídas', message: 'Se marcaron todas las notificaciones de esta pestaña como leídas con éxito.', status: 'success' });
    } catch {
      showAlert({ title: 'Error', message: 'No se pudo marcar las notificaciones como leídas.', status: 'error' });
    }
  };

  const iconoTipo = (tipo) => {
    if (tipo === 'alerta') return <CircleAlert size={16} color="#b45309" />;
    if (tipo === 'confirmacion') return <CircleCheck size={16} color="#0f766e" />;
    return <Info size={16} color="#2563eb" />;
  };

  return (
    <div className="propiedades-page" style={{ paddingTop: '20px' }}>
      <div className="propiedades-content" style={{ maxWidth: '960px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: '14px',
            background: '#fff',
            overflow: 'hidden',
            boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
          }}
        >
          <div
            style={{
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setTab('sistema')}
                style={{
                  border: '1px solid var(--color-border)',
                  background: tab === 'sistema' ? '#ecfeff' : '#fff',
                  color: '#0f172a',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                <BellRing size={16} /> Sistema ({sistema.filter((n) => !n.leida).length})
              </button>
              <button
                onClick={() => setTab('usuario')}
                style={{
                  border: '1px solid var(--color-border)',
                  background: tab === 'usuario' ? '#eff6ff' : '#fff',
                  color: '#0f172a',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                <Bell size={16} /> Usuario ({usuarioNotif.filter((n) => !n.leida).length})
              </button>
            </div>

            <button
              onClick={marcarLeidas}
              style={{
                border: '1px solid var(--color-border)',
                background: '#fff',
                color: '#0f172a',
                borderRadius: '8px',
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCheck size={16} /> Marcar leídas
            </button>
          </div>

          <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '24px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Cargando notificaciones...</div>
            ) : null}

            {!loading && dataActiva.length === 0 ? (
              <div style={{ padding: '80px 24px', color: '#94a3b8', textAlign: 'center' }}>
                <BellRing size={48} style={{ color: '#cbd5e1', marginBottom: '16px', opacity: 0.5 }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b' }}>Sin notificaciones</div>
                <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                  No hay alertas de {tab} por el momento.
                </p>
              </div>
            ) : null}

            {!loading &&
              dataActiva.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    background: n.leida ? '#fff' : tab === 'sistema' ? '#f0fdfa' : '#eff6ff',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ marginTop: '2px' }}>{iconoTipo(n.tipo)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#0f172a' }}>{n.titulo}</strong>
                      <small style={{ color: '#64748b' }}>
                        {new Date(n.creada).toLocaleString('es-BO', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </div>
                    <p style={{ margin: '6px 0 0', color: '#334155' }}>{n.mensaje}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {ModalComponent}
    </div>
  );
};

export default MisNotificaciones;
