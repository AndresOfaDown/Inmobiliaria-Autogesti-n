import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, AlertTriangle, Home, User, Sparkles, Send, Bot, RotateCcw, List, Ban, ShieldCheck, AlertOctagon, Zap, Wifi, Calendar, RefreshCw, AlertCircle, BookOpen, Building2, WifiOff } from 'lucide-react';

import Modal from '../../components/Modal';
import ContratoDetalle from '../../components/ContratoDetalle';
import useAuth from '../../hooks/useAuth';
import contratoService from '../../services/contratoService';
import './Propiedades.css';

const estadoConfig = {
  borrador: { color: '#94a3b8', bg: '#f1f5f9', label: 'Borrador', icon: Clock },
  enviado: { color: '#f59e0b', bg: '#fef3c7', label: 'En Revisión', icon: AlertTriangle },
  aceptado: { color: '#10b981', bg: '#d1fae5', label: 'Aceptado', icon: CheckCircle },
  rechazado: { color: '#ef4444', bg: '#fee2e2', label: 'Rechazado', icon: XCircle },
  activo: { color: '#6366f1', bg: '#e0e7ff', label: 'Activo', icon: CheckCircle },
  finalizado: { color: '#64748b', bg: '#f1f5f9', label: 'Finalizado', icon: Clock },
  cancelado: { color: '#dc2626', bg: '#fee2e2', label: 'Cancelado', icon: XCircle },
  pendiente: { color: '#f59e0b', bg: '#fef3c7', label: 'Pendiente', icon: Clock },
};

const MisContratos = () => {
  const { isAuthenticated, user } = useAuth();
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContrato, setSelectedContrato] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchContratos = useCallback(async () => {
    try {
      const data = await contratoService.getAll();
      setContratos(data);
    } catch { setContratos([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchContratos(); }, [isAuthenticated, fetchContratos]);

  const verDetalle = (contrato) => { setSelectedContrato(contrato); setShowModal(true); };

  const esOwner = (c) => c.propietario_email === user?.email;

  if (!isAuthenticated) {
    return (<div className="propiedades-page"><div className="propiedades-empty">Inicia sesión para ver tus contratos</div></div>);
  }

  return (
    <div className="propiedades-page" style={{ paddingTop: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(12px, 4vw, 24px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 700, margin: 0, color: '#1e293b' }}>Mis Contratos</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.9rem' }}>Contratos donde eres propietario o inquilino/comprador</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Cargando contratos...</div>
        ) : contratos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <FileText size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
            <p style={{ fontSize: '1.1rem' }}>No tienes contratos aún</p>
            <p style={{ fontSize: '0.85rem' }}>Los contratos se crean desde el chat con el propietario o inquilino.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {contratos.map(c => {
              const cfg = estadoConfig[c.estado] || estadoConfig.pendiente;
              const IconComp = cfg.icon;
              return (
                <div key={c.id} style={{
                  background: '#fff', borderRadius: '16px', padding: '20px 24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
                  cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onClick={() => verDetalle(c)}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <FileText size={18} color="#6366f1" />
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>Contrato #{c.id}</span>
                        <span style={{ background: cfg.bg, color: cfg.color, padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <IconComp size={12} /> {cfg.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151' }}>{c.inmueble_titulo}</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                        {c.tipo_contrato_nombre || 'Sin tipo'} · {c.inmueble_direccion || ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{ fontWeight: 700, fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: '#059669' }}>${c.monto} {c.moneda}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.inicio} → {c.fin || '∞'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {esOwner(c) ? (
                          <><Home size={14} /> Propietario</>
                        ) : (
                          <><User size={14} /> Inquilino/Comprador</>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de detalle del contrato */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Detalle del Contrato">
        {selectedContrato && (
          <ContratoDetalle 
            contrato={selectedContrato} 
            user={user} 
            onUpdate={() => { fetchContratos(); setShowModal(false); }} 
          />
        )}
      </Modal>
    </div>
  );
};

export default MisContratos;

