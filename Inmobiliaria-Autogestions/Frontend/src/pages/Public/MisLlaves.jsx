import { useState, useEffect, useCallback } from 'react';
import {
  Lock, Unlock, KeyRound, Wifi, Battery, Copy, Check, RefreshCw,
  Home, ShieldCheck, Sparkles, AlertCircle, Clock, Tv, Wind, Car,
  Sliders, PlusCircle, CheckCircle2, ShieldAlert, X, Cpu, Zap
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

  // Estados para Alquiler Modular
  const [modalModularOpen, setModalModularOpen] = useState(false);
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
  const [guardandoModular, setGuardandoModular] = useState(false);

  const fetchLlaves = useCallback(async () => {
    setLoading(true);
    try {
      const data = await iotService.getMisLlaves();
      setLlaves(data || []);

      // Pre-cargar selección con los que ya están contratados
      const activos = (data || []).filter(item => !item.bloqueado_por_smart_contract).map(item => item.dispositivo_id);
      setModulosSeleccionados(activos);
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
    if (llave.bloqueado_por_smart_contract) {
      showAlert({
        title: 'Módulo Bloqueado por Smart Contract',
        message: `El artefacto "${llave.nombre}" no está incluido en tu alquiler modular. Puedes activarlo haciendo clic en "Añadir a mi Alquiler Modular".`,
        status: 'warning',
      });
      return;
    }

    const esACoTV = llave.tipo === 'aire_acondicionado' || llave.tipo === 'smart_tv';
    const accion = llave.bloqueado 
      ? (esACoTV ? 'encender' : 'desbloquear') 
      : (esACoTV ? 'apagar' : 'bloquear');

    setActionLoading(llave.id);

    try {
      const res = await iotService.ejecutarAccion(llave.id, accion, 'app');
      showAlert({
        title: llave.bloqueado ? '¡Dispositivo Activado!' : '¡Dispositivo Puesto en Reposo!',
        message: res.mensaje,
        status: 'success',
      });
      fetchLlaves();
    } catch (err) {
      showAlert({
        title: 'Acceso Denegado por Smart Contract',
        message: err.response?.data?.message || 'No se pudo operar el dispositivo IoT.',
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
        title: '¡Nuevo PIN Criptográfico!',
        message: `Tu nuevo código de acceso temporal de 24 horas es: ${res.pin}`,
        status: 'success',
      });
      fetchLlaves();
    } catch (err) {
      showAlert({
        title: 'Error de PIN',
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

  // Identificar contrato e inmueble actual para el cálculo modular
  const dispositivosAlquilados = llaves.filter(d => !d.es_propietario);
  const contratoActivo = llaves.find(d => !d.es_propietario && d.contrato_id);
  const contratoActivoId = contratoActivo?.contrato_id || llaves.find(d => d.contrato_id)?.contrato_id || 2;
  const listaModulosModal = dispositivosAlquilados.length > 0 ? dispositivosAlquilados : llaves;
  const canonBase = 3500;

  const totalModularAdicional = listaModulosModal
    .filter(d => modulosSeleccionados.includes(d.dispositivo_id) && !d.incluido_base)
    .reduce((acc, curr) => acc + (curr.costo_mensual || 0), 0);

  // Abrir modal de alquiler modular
  const handleAbrirModular = () => {
    const contratadosIds = listaModulosModal.filter(d => !d.bloqueado_por_smart_contract).map(d => d.dispositivo_id);
    setModulosSeleccionados(contratadosIds);
    setModalModularOpen(true);
  };

  const handleToggleSeleccionModulo = (devId, incluidoBase) => {
    if (incluidoBase) return; // La cerradura base obligatoria no se puede quitar

    setModulosSeleccionados(prev => {
      if (prev.includes(devId)) {
        return prev.filter(id => id !== devId);
      } else {
        return [...prev, devId];
      }
    });
  };

  const handleGuardarAlquilerModular = async () => {
    const contratoId = contratoActivoId;
    if (!contratoId) {
      showAlert({ title: 'Aviso', message: 'No se encontró un contrato activo asociado para sincronizar.', status: 'warning' });
      return;
    }

    setGuardandoModular(true);
    try {
      const res = await iotService.sincronizarModulosAlquiler(contratoId, modulosSeleccionados);
      showAlert({
        title: '¡Smart Contract Sincronizado!',
        message: `Tu alquiler modular fue actualizado en la Blockchain (Bloque #${res.blockchain_block}). Dispositivos habilitados: ${res.habilitados.length}, Bloqueados: ${res.bloqueados.length}.`,
        status: 'success',
      });
      setModalModularOpen(false);
      fetchLlaves();
    } catch (err) {
      showAlert({
        title: 'Error de sincronización',
        message: err.response?.data?.message || 'No se pudo sincronizar el alquiler modular con el Smart Contract.',
        status: 'error',
      });
    } finally {
      setGuardandoModular(false);
    }
  };

  const getDeviceIcon = (tipo, size = 20) => {
    switch (tipo) {
      case 'aire_acondicionado':
        return <Wind size={size} />;
      case 'smart_tv':
        return <Tv size={size} />;
      case 'porton':
        return <Car size={size} />;
      default:
        return <Lock size={size} />;
    }
  };

  return (
    <div className="propiedades-page" style={{ paddingTop: '20px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: 'clamp(12px, 4vw, 24px)' }}>
        
        {/* Banner Informativo de Inmuebles Inteligentes */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              <Cpu size={14} /> Inmuebles Inteligentes & Alquiler Modular
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Domótica IoT y Cerraduras Inteligentes
            </h1>
            <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.9rem', maxWidth: '620px' }}>
              El Smart Contract habilita o bloquea criptográficamente los artefactos de tu hogar según los módulos contratados en tu alquiler modular.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleAbrirModular}
              style={{
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 18px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
              }}
            >
              <Sliders size={18} /> Configurar Alquiler Modular
            </button>

            <button
              onClick={fetchLlaves}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <RefreshCw size={36} className="spin" style={{ marginBottom: '14px', color: '#0284c7' }} />
            <p style={{ fontWeight: 600 }}>Sincronizando estado de artefactos con el Smart Contract...</p>
          </div>
        ) : llaves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <Lock size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '1.2rem', color: '#1e293b', margin: '0 0 6px' }}>No tienes dispositivos IoT asignados</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 16px' }}>
              Los dispositivos inteligentes se asignan automáticamente al tener un Smart Contract de arrendamiento activo.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
            {llaves.map((dev) => {
              const isBlockedByContract = dev.bloqueado_por_smart_contract;
              const isLocked = dev.bloqueado;
              const isOnline = dev.estado_conexion === 'online';
              const esACoTV = dev.tipo === 'aire_acondicionado' || dev.tipo === 'smart_tv';

              return (
                <div key={dev.id} style={{
                  background: isBlockedByContract ? '#fafafa' : '#ffffff',
                  borderRadius: '18px',
                  padding: '24px',
                  boxShadow: isBlockedByContract ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)',
                  border: isBlockedByContract 
                    ? '1.5px dashed #cbd5e1' 
                    : (isLocked ? '1px solid #e2e8f0' : '2px solid #10b981'),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  opacity: isBlockedByContract ? 0.85 : 1,
                  transition: 'all 0.2s ease'
                }}>
                  {/* Header del Dispositivo con Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      {isBlockedByContract ? (
                        <span style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid #fecaca'
                        }}>
                          <ShieldAlert size={12} /> Bloqueado por Smart Contract
                        </span>
                      ) : (
                        <span style={{
                          background: dev.es_propietario ? '#f0f9ff' : '#ecfdf5',
                          color: dev.es_propietario ? '#0284c7' : '#059669',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: dev.es_propietario ? '1px solid #bae6fd' : '1px solid #a7f3d0'
                        }}>
                          <ShieldCheck size={12} /> Habilitado por Contrato
                        </span>
                      )}

                      {dev.smart_contract_id && (
                        <span style={{
                          background: '#f8fafc',
                          color: '#64748b',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          border: '1px solid #e2e8f0'
                        }}>
                          {dev.smart_contract_id}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: isOnline ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                        <Wifi size={13} /> {isOnline ? 'Online' : 'Offline'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: dev.bateria > 20 ? '#0284c7' : '#dc2626', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                        <Battery size={13} /> {dev.bateria}%
                      </span>
                    </div>
                  </div>

                  {/* Icono, Título y Ubicación */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: isBlockedByContract ? '#fee2e2' : (isLocked ? '#f1f5f9' : '#dcfce7'),
                      color: isBlockedByContract ? '#dc2626' : (isLocked ? '#475569' : '#16a34a'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getDeviceIcon(dev.tipo, 22)}
                    </div>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        {dev.nombre}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Home size={13} /> {dev.inmueble_titulo} · {dev.ubicacion}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {dev.marca} • Mod: {dev.modelo}
                      </div>
                    </div>
                  </div>

                  {/* Estado y Acción según Alquiler Modular */}
                  {isBlockedByContract ? (
                    <div style={{
                      background: '#fff1f2',
                      borderRadius: '14px',
                      padding: '16px',
                      border: '1px solid #ffe4e6',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9f1239', marginBottom: '6px' }}>
                        🔒 Artefacto no incluido en tu alquiler
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#be123c', margin: '0 0 12px', lineHeight: 1.4 }}>
                        Tarifa modular: <strong>+Bs {dev.costo_mensual} / mes</strong>. El Smart Contract mantiene este artefacto bloqueado por seguridad.
                      </p>
                      <button
                        onClick={handleAbrirModular}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: '#0284c7',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <PlusCircle size={15} /> Añadir a mi Alquiler Modular
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* Botón Principal de Acción (Habilitado por Smart Contract) */}
                      <button
                        onClick={() => handleToggleAccion(dev)}
                        disabled={actionLoading === dev.id}
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '14px',
                          border: 'none',
                          background: isLocked
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          cursor: actionLoading === dev.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: isLocked
                            ? '0 4px 14px rgba(16,185,129,0.3)'
                            : '0 4px 14px rgba(239,68,68,0.3)',
                          transition: 'transform 0.15s'
                        }}
                      >
                        {actionLoading === dev.id ? (
                          <div style={{ width: '20px', height: '20px', border: '3px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : isLocked ? (
                          <>
                            <Unlock size={18} />
                            <span>{esACoTV ? 'Encender Artefacto' : (dev.tipo === 'porton' ? 'Abrir Portón' : 'Desbloquear Puerta')}</span>
                          </>
                        ) : (
                          <>
                            <Lock size={18} />
                            <span>{esACoTV ? 'Apagar Artefacto' : (dev.tipo === 'porton' ? 'Cerrar Portón' : 'Bloquear Puerta')}</span>
                          </>
                        )}
                      </button>

                      <div style={{ fontSize: '0.78rem', color: isLocked ? '#64748b' : '#16a34a', marginTop: '8px', textAlign: 'center', fontWeight: 600 }}>
                        {esACoTV
                          ? (isLocked ? '💤 Modo reposo (Apagado)' : '⚡ Encendido y Operativo (Climatización/Smart)')
                          : (isLocked ? '🔒 Bloqueado / Cerrado con Cerrojo' : '🔓 Abierto / Desbloqueado')
                        }
                      </div>

                      {/* Caja de Código PIN si es cerradura / portón */}
                      {dev.pin_codigo && (
                        <div style={{
                          background: '#f8fafc',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '12px'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                              PIN Temporal Criptográfico
                            </div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', letterSpacing: '2px', fontFamily: 'monospace' }}>
                              {dev.pin_codigo}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleCopiarPin(dev.pin_codigo, dev.id)}
                              title="Copiar PIN"
                              style={{
                                background: pinCopiadoId === dev.id ? '#dcfce7' : '#fff',
                                color: pinCopiadoId === dev.id ? '#15803d' : '#475569',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '5px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {pinCopiadoId === dev.id ? <Check size={13} /> : <Copy size={13} />}
                              {pinCopiadoId === dev.id ? 'Copiado' : 'Copiar'}
                            </button>

                            <button
                              onClick={() => handleGenerarNuevoPin(dev)}
                              disabled={actionLoading === `pin-${dev.id}`}
                              title="Generar nuevo PIN"
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '5px 8px',
                                color: '#475569',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <RefreshCw size={12} className={actionLoading === `pin-${dev.id}` ? 'spin' : ''} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pie del card: módulo base vs opcional */}
                  <div style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>{dev.incluido_base ? 'Módulo Base Incluido' : `Tarifa: Bs ${dev.costo_mensual}/mes`}</span>
                    <span style={{ fontWeight: 600, color: isBlockedByContract ? '#dc2626' : '#16a34a' }}>
                      {isBlockedByContract ? 'Acceso Bloqueado' : 'Acceso Autorizado'}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ─── MODAL DE CONFIGURACIÓN DE ALQUILER MODULAR IOT ─── */}
      {modalModularOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '24px', maxWidth: '600px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            {/* Header del modal */}
            <div style={{
              padding: '24px 28px', background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              color: '#ffffff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sliders size={22} color="#38bdf8" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Configurar Alquiler Modular</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Elige qué artefactos inteligentes deseas habilitar</p>
                </div>
              </div>
              <button onClick={() => setModalModularOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '28px' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
                El Smart Contract sincroniza automáticamente tus accesos: habilitará únicamente los artefactos seleccionados y bloqueará el resto para reducir el costo de tu alquiler.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {listaModulosModal.map(item => {
                  const isChecked = modulosSeleccionados.includes(item.dispositivo_id);
                  const isBase = item.incluido_base;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSeleccionModulo(item.dispositivo_id, isBase)}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        border: isChecked ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        background: isChecked ? '#f0f9ff' : '#ffffff',
                        cursor: isBase ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: isChecked ? '#e0f2fe' : '#f1f5f9',
                          color: isChecked ? '#0284c7' : '#64748b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {getDeviceIcon(item.tipo, 18)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                            {item.nombre}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {item.ubicacion} {isBase ? '• Módulo Base Incluido' : `• +Bs ${item.costo_mensual}/mes`}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        border: isChecked ? 'none' : '2px solid #cbd5e1',
                        background: isChecked ? '#0284c7' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                      }}>
                        {isChecked && <Check size={16} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumen de Ajuste del Smart Contract */}
              <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Liquidación Modular del Smart Contract
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginTop: '8px' }}>
                  <span>Canon Base Inmueble + Cerradura:</span>
                  <strong style={{ color: '#1e293b' }}>Bs 3.500,00</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#0284c7', marginTop: '6px' }}>
                  <span>Módulos IoT Adicionales Seleccionados:</span>
                  <strong>+ Bs {totalModularAdicional.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', color: '#166534', fontWeight: 800, marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                  <span>Canon Mensual Total:</span>
                  <span>Bs {(3500 + totalModularAdicional).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalModularOpen(false)}
                  disabled={guardandoModular}
                  style={{ padding: '12px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardarAlquilerModular}
                  disabled={guardandoModular}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  {guardandoModular ? (
                    <>
                      <RefreshCw className="spin" size={18} /> Sincronizando con Blockchain...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Confirmar y Firmar en Smart Contract
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {ModalComponent}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MisLlaves;
