import { useState, useEffect, useCallback } from 'react';
import {
  Cpu, Lock, Unlock, Battery, Wifi, WifiOff, Plus, Trash2, History,
  ShieldCheck, RefreshCw, Key, AlertTriangle, CheckCircle2, X
} from 'lucide-react';
import iotService from '../services/iotService';
import useAlertConfirm from '../hooks/useAlertConfirm';

const ModalGestionIoT = ({ inmueble, onClose }) => {
  const { showAlert, showConfirm, ModalComponent } = useAlertConfirm();
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHistorialDev, setSelectedHistorialDev] = useState(null);
  const [historialLogs, setHistorialLogs] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Formulario nuevo dispositivo
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'cerradura',
    serial_id: '',
    marca: 'Yale SmartLock',
    modelo: 'Assure Lock 2',
    ubicacion: 'Puerta Principal',
    codigo_maestro: '123456',
  });

  const fetchDispositivos = useCallback(async () => {
    if (!inmueble?.id) return;
    setLoading(true);
    try {
      const data = await iotService.getDispositivosPorInmueble(inmueble.id);
      setDispositivos(data || []);
    } catch (err) {
      console.error('Error fetching IoT devices:', err);
    } finally {
      setLoading(false);
    }
  }, [inmueble?.id]);

  useEffect(() => {
    fetchDispositivos();
  }, [fetchDispositivos]);

  // Manejar acción de apertura/cierre
  const handleToggleBloqueo = async (dev) => {
    const nuevaAccion = dev.bloqueado ? 'desbloquear' : 'bloquear';
    setActionLoading(dev.id);
    try {
      const res = await iotService.ejecutarAccion(dev.id, nuevaAccion, 'app');
      showAlert({
        title: nuevaAccion === 'desbloquear' ? '¡Puerta Desbloqueada!' : '¡Cerradura Bloqueada!',
        message: res.mensaje,
        status: 'success',
      });
      fetchDispositivos();
    } catch (err) {
      showAlert({
        title: 'Error de Control',
        message: err.response?.data?.message || 'No se pudo comunicar con el dispositivo.',
        status: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Ver historial de accesos
  const handleVerHistorial = async (dev) => {
    setSelectedHistorialDev(dev);
    setLoadingHistorial(true);
    try {
      const data = await iotService.getHistorial(dev.id);
      setHistorialLogs(data || []);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Crear nuevo dispositivo
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.serial_id.trim()) {
      showAlert({ title: 'Campos requeridos', message: 'Ingresa el nombre y el número de serie.', status: 'warning' });
      return;
    }

    try {
      await iotService.crearDispositivo({
        ...formData,
        inmueble_id: inmueble.id,
      });
      showAlert({ title: '¡Dispositivo Registrado!', message: 'La cerradura ha sido dada de alta en el sistema.', status: 'success' });
      setShowAddForm(false);
      setFormData({
        nombre: '',
        tipo: 'cerradura',
        serial_id: '',
        marca: 'Yale SmartLock',
        modelo: 'Assure Lock 2',
        ubicacion: 'Puerta Principal',
        codigo_maestro: '123456',
      });
      fetchDispositivos();
    } catch (err) {
      showAlert({
        title: 'Error al registrar',
        message: err.response?.data?.message || 'No se pudo registrar el dispositivo.',
        status: 'error',
      });
    }
  };

  // Eliminar dispositivo
  const handleDelete = (dev) => {
    showConfirm({
      title: '¿Eliminar Dispositivo IoT?',
      message: `¿Estás seguro de que deseas desvincular "${dev.nombre}"? Se revocarán todos los accesos automáticos asociados.`,
      status: 'warning',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await iotService.eliminarDispositivo(dev.id);
          showAlert({ title: 'Eliminado', message: 'Dispositivo desvinculado con éxito.', status: 'info' });
          fetchDispositivos();
        } catch (err) {
          showAlert({ title: 'Error', message: 'No se pudo eliminar el dispositivo.', status: 'error' });
        }
      },
    });
  };

  return (
    <div style={{ maxHeight: '82vh', display: 'flex', flexDirection: 'column', gap: '14px', padding: '4px' }}>
      {/* Header Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #f0fdf4, #e0f2fe)',
        borderRadius: '12px',
        border: '1px solid #bae6fd',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              Gestión de Dispositivos y Cerraduras IoT
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
              Inmueble: <strong>{inmueble.titulo}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setShowAddForm(!showAddForm); setSelectedHistorialDev(null); }}
          style={{
            background: showAddForm ? '#64748b' : 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(2,132,199,0.25)'
          }}
        >
          {showAddForm ? <X size={15} /> : <Plus size={15} />}
          {showAddForm ? 'Cancelar' : 'Agregar Dispositivo'}
        </button>
      </div>

      {/* Formulario Agregar Dispositivo */}
      {showAddForm && (
        <form onSubmit={handleCreateSubmit} style={{
          background: '#fff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>
            Registrar Nueva Cerradura o Sensor
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Nombre del Dispositivo *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Cerradura Puerta Principal"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Tipo de Dispositivo</label>
              <select
                value={formData.tipo}
                onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="cerradura">Cerradura Inteligente (Smart Lock)</option>
                <option value="sensor_apertura">Sensor de Puerta / Ventana</option>
                <option value="sensor_movimiento">Sensor de Presencia</option>
                <option value="sensor_ambiental">Sensor Ambiental / Alarma</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Número de Serie / MAC *</label>
              <input
                type="text"
                value={formData.serial_id}
                onChange={e => setFormData({ ...formData, serial_id: e.target.value })}
                placeholder="Ej. LOCK-401-MAIN"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Ubicación Física</label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                placeholder="Ej. Entrada Principal - Piso 1"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Marca / Fabricante</label>
              <input
                type="text"
                value={formData.marca}
                onChange={e => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Yale, Schlage, August..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>PIN Maestro de Emergencia</label>
              <input
                type="text"
                value={formData.codigo_maestro}
                onChange={e => setFormData({ ...formData, codigo_maestro: e.target.value })}
                placeholder="Ej. 123456"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Guardar Dispositivo
            </button>
          </div>
        </form>
      )}

      {/* Vista de Historial de Accesos */}
      {selectedHistorialDev && (
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '14px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
              <History size={16} color="#6366f1" />
              Historial de Accesos: {selectedHistorialDev.nombre}
            </div>
            <button
              onClick={() => setSelectedHistorialDev(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={16} />
            </button>
          </div>

          {loadingHistorial ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.85rem' }}>
              Cargando registros de auditoría...
            </div>
          ) : historialLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.85rem' }}>
              No se registran aperturas aún en este dispositivo.
            </div>
          ) : (
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {historialLogs.map((log) => (
                <div key={log.id} style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {log.accion.toUpperCase()} ({log.metodo})
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem' }}>
                      {log.usuario ? `${log.usuario.first_name} ${log.usuario.last_name}` : 'Acceso Automático'} · {log.detalles}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: log.resultado === 'exitoso' ? '#dcfce7' : '#fee2e2',
                      color: log.resultado === 'exitoso' ? '#15803d' : '#b91c1c'
                    }}>
                      {log.resultado}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                      {new Date(log.createdAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de Dispositivos */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <RefreshCw className="spin" size={24} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.85rem' }}>Cargando telemetría de dispositivos...</p>
          </div>
        ) : dispositivos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '2px dashed #cbd5e1'
          }}>
            <Lock size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>
              No tienes dispositivos IoT registrados en este inmueble
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '400px', margin: '6px auto 14px' }}>
              Registra una cerradura inteligente o sensor para habilitar la autogestión de accesos y visitas autónomas.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              + Agregar Primera Cerradura
            </button>
          </div>
        ) : (
          dispositivos.map((dev) => {
            const isLock = dev.tipo === 'cerradura';
            const isOnline = dev.estado_conexion === 'online';

            return (
              <div key={dev.id} style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '14px',
                flexWrap: 'wrap'
              }}>
                {/* Info Izquierda */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: dev.bloqueado ? '#fee2e2' : '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {dev.bloqueado ? <Lock size={20} color="#dc2626" /> : <Unlock size={20} color="#16a34a" />}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                      {dev.nombre}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      {dev.marca} · {dev.ubicacion} · S/N: <code>{dev.serial_id}</code>
                    </div>

                    {/* Badges de Telemetría */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        color: isOnline ? '#16a34a' : '#94a3b8',
                        fontWeight: 600
                      }}>
                        {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                        {isOnline ? 'En línea' : 'Sin conexión'}
                      </span>

                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        color: dev.bateria > 20 ? '#0284c7' : '#dc2626',
                        fontWeight: 600
                      }}>
                        <Battery size={13} /> {dev.bateria}%
                      </span>

                      {isLock && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: dev.bloqueado ? '#fee2e2' : '#dcfce7',
                          color: dev.bloqueado ? '#b91c1c' : '#15803d'
                        }}>
                          {dev.bloqueado ? 'Cerrado con Cerrojo' : 'Desbloqueado (Abierto)'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones Derecha */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {isLock && (
                    <button
                      onClick={() => handleToggleBloqueo(dev)}
                      disabled={actionLoading === dev.id}
                      style={{
                        background: dev.bloqueado
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: actionLoading === dev.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: dev.bloqueado
                          ? '0 2px 8px rgba(16,185,129,0.3)'
                          : '0 2px 8px rgba(239,68,68,0.3)'
                      }}
                    >
                      {actionLoading === dev.id ? (
                        <div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : dev.bloqueado ? (
                        <Unlock size={14} />
                      ) : (
                        <Lock size={14} />
                      )}
                      {dev.bloqueado ? 'Abrir Puerta' : 'Echar Cerrojo'}
                    </button>
                  )}

                  <button
                    onClick={() => handleVerHistorial(dev)}
                    title="Ver bitácora de accesos"
                    style={{
                      background: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <History size={14} /> Historial
                  </button>

                  <button
                    onClick={() => handleDelete(dev)}
                    title="Eliminar dispositivo"
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {ModalComponent}
    </div>
  );
};

export default ModalGestionIoT;
