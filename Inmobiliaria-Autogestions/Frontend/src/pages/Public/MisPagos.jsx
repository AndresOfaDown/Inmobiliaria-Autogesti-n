import { useState, useEffect } from 'react';
import api from '../../services/api';
import BlockchainAuditTrail from '../../components/BlockchainAuditTrail';
import ModalPagarAlquiler from '../../components/ModalPagarAlquiler';
import { 
  CreditCard, 
  Search, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Download,
  Building2,
  Receipt,
  ExternalLink,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import './MisPagos.css';

const MisPagos = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showPagarModal, setShowPagarModal] = useState(false);

  const handleDownloadComprobante = (id) => {
    try {
      setDownloadingPdf(true);
      const baseURL = api.defaults.baseURL || 'http://localhost:3000/api';
      const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
      const downloadUrl = `${cleanBase}/pagos/comprobante/${id}/pdf`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Comprobante_Pago_REC-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al descargar comprobante PDF:', err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 1500);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      const res = await api.get('/pagos/lista/?personal=true');
      setPagos(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching pagos:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPagos = pagos.filter(p => 
    p.inmueble_titulo?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.referencia?.toLowerCase().includes(filtro.toLowerCase())
  );

  const getStatusStyle = (estado) => {
    switch (estado) {
      case 'completado': return { bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircle2 size={14} /> };
      case 'pendiente': return { bg: '#fffbeb', color: '#d97706', icon: <Clock size={14} /> };
      case 'fallido': return { bg: '#fef2f2', color: '#dc2626', icon: <ArrowRight size={14} /> };
      default: return { bg: '#f8fafc', color: '#64748b', icon: <FileText size={14} /> };
    }
  };

  return (
    <div style={{ paddingTop: '20px' }}>
      
      <div className="mispagos-container">
        <header className="mispagos-header">
          <div>
            <h1 className="mispagos-title">
              Mis Pagos
            </h1>
            <p className="mispagos-subtitle">Historial detallado de tus transacciones inmobiliarias</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowPagarModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                whiteSpace: 'nowrap'
              }}
            >
              <CreditCard size={18} /> Pagar Mensualidad
            </button>

            <div className="mispagos-search-container" style={{ margin: 0 }}>
              <Search className="mispagos-search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por propiedad o referencia..." 
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="mispagos-search-input"
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Clock className="spin" size={48} color="#cbd5e1" />
            <p style={{ color: '#94a3b8', marginTop: '16px' }}>Cargando historial de pagos...</p>
          </div>
        ) : filteredPagos.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '80px 40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CreditCard size={40} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>No hay registros de pagos</h3>
            <p style={{ color: '#64748b', maxWidth: '300px', margin: '8px auto 0' }}>
              Tus transacciones aparecerán aquí una vez que se procesen.
            </p>
          </div>
        ) : (
          <div className="mispagos-list">
            {filteredPagos.map((pago) => {
              const status = getStatusStyle(pago.estado);
              return (
                <div key={pago.id} className="mispagos-card">
                  <div className="mispagos-card-icon">
                    <Building2 size={26} color="#64748b" />
                  </div>

                  <div className="mispagos-card-info">
                    <h4>{pago.inmueble_titulo || 'Propiedad'}</h4>
                    <div className="mispagos-card-details">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={14} /> {new Date(pago.fecha).toLocaleDateString()}
                      </span>
                      <span style={{ color: '#cbd5e1' }}>|</span>
                      <span>Ref: {pago.referencia?.split(':')[0] || 'Manual'}</span>
                    </div>
                  </div>

                  <div className="mispagos-card-amount">
                    <div className="mispagos-amount-val">
                      Bs {parseFloat(pago.monto).toLocaleString('es-BO')}
                    </div>
                    <div 
                      className="mispagos-status-badge"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {status.icon} {pago.estado}
                    </div>
                  </div>

                  <div>
                    <button 
                      onClick={() => setPagoSeleccionado(pago)}
                      className="mispagos-btn-comprobante"
                    >
                      <Receipt size={18} /> Comprobante
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal de Comprobante Expandido ─────────────────────── */}
      {pagoSeleccionado && (
        <div className="mispagos-modal-overlay">
          <div className="mispagos-modal-box">
            <div className="mispagos-modal-header">
              <button 
                onClick={() => setPagoSeleccionado(null)}
                className="mispagos-modal-close"
              >
                ✕
              </button>
              <div className="mispagos-modal-icon-wrapper">
                <CheckCircle2 size={42} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Comprobante de Pago</h2>
              <p style={{ color: '#64748b', margin: '8px 0 0', fontWeight: 500, fontSize: '1.1rem' }}>Autogestión Inmobiliaria - Bolivia</p>
            </div>

            <div className="mispagos-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div className="mispagos-modal-grid-2 mispagos-modal-border-bottom">
                  <div>
                    <label className="mispagos-modal-label">Fecha de Emisión</label>
                    <span className="mispagos-modal-val">{new Date(pagoSeleccionado.creado).toLocaleString('es-BO')}</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label className="mispagos-modal-label">ID de Transacción</label>
                    <span className="mispagos-modal-txhash">
                      {pagoSeleccionado.referencia?.toUpperCase() || 'MANUAL-REC'}
                    </span>
                  </div>
                </div>

                <div className="mispagos-modal-grid-2">
                  <div className="mispagos-modal-parties">
                    <label className="mispagos-modal-label" style={{ marginBottom: '12px' }}>Información de Partes</label>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Propietario:</div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{pagoSeleccionado.usuario_nombre}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Cliente:</div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>Usuario Registrado</div>
                    </div>
                  </div>

                  <div className="mispagos-modal-concept">
                    <label className="mispagos-modal-label">Propiedad y Concepto</label>
                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.2rem', lineHeight: '1.2' }}>{pagoSeleccionado.inmueble_titulo}</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>Pago de canon/venta según Contrato #{pagoSeleccionado.contrato}</div>
                  </div>
                </div>
                
                {/* Desglose Financiero con Comisión de Plataforma */}
                <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 18px', background: '#1e293b', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                    <span>Liquidación Financiera Oficial</span>
                    <span style={{ color: '#38bdf8' }}>Moneda: Bolivianos (BOB)</span>
                  </div>
                  <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569' }}>
                      <span>Monto Bruto Depositado (Inquilino):</span>
                      <strong style={{ color: '#1e293b' }}>Bs {parseFloat(pagoSeleccionado.monto || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#dc2626' }}>
                      <span>(-) Retención Comisión Plataforma SAIPI (Admin):</span>
                      <strong>- Bs {parseFloat(pagoSeleccionado.comision_plataforma || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', color: '#166534', borderTop: '1px solid #cbd5e1', paddingTop: '10px', marginTop: '2px', fontWeight: 800 }}>
                      <span>(=) Monto Neto Liquidado al Propietario:</span>
                      <span style={{ fontSize: '1.2rem' }}>Bs {parseFloat(pagoSeleccionado.monto_neto || pagoSeleccionado.monto || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trazabilidad inmutable en Blockchain */}
              <div style={{ marginTop: '24px', borderTop: '1px dashed #cbd5e1', paddingTop: '20px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '0.9rem' }}>
                    <ShieldCheck size={18} />
                    <span>Registro Inmutable con Código QR y SHA-256</span>
                  </div>
                  <a
                    href={`/verificar-pago/${pagoSeleccionado.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textDecoration: 'none', background: '#e0f2fe', padding: '4px 10px', borderRadius: '8px' }}
                  >
                    <QrCode size={14} /> Verificar QR en Línea <ExternalLink size={12} />
                  </a>
                </div>
                <BlockchainAuditTrail assetId={`PAG-${pagoSeleccionado.id}`} />
              </div>

              <div className="mispagos-modal-actions">
                <button 
                  onClick={() => handleDownloadComprobante(pagoSeleccionado.id)}
                  disabled={downloadingPdf}
                  className="mispagos-modal-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Download size={20} /> {downloadingPdf ? 'Generando PDF...' : 'Descargar en PDF'}
                </button>
                <button 
                  onClick={() => setPagoSeleccionado(null)}
                  className="mispagos-modal-btn-primary"
                >
                  Entendido
                </button>
              </div>
              
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '32px', lineHeight: '1.5' }}>
                Este documento es un comprobante digital de pago generado automáticamente.<br/>
                Para consultas legales, por favor refiera el ID de Transacción mencionado arriba.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Realizar Pago de Alquiler */}
      <ModalPagarAlquiler
        isOpen={showPagarModal}
        onClose={() => setShowPagarModal(false)}
        onPagoExitoso={() => {
          fetchPagos();
        }}
      />

      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MisPagos;
