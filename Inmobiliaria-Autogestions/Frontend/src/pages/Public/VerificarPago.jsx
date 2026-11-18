import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  Building2,
  User,
  Calendar,
  Copy,
  Check,
  ArrowLeft,
  Lock,
  Database,
  Receipt,
  Clock,
  AlertCircle
} from 'lucide-react';

const VerificarPago = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchVerification = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/pagos/verificar/${id}`);
        setData(res.data);
      } catch (err) {
        console.error('Error al verificar comprobante:', err);
        setError('El comprobante de pago no fue encontrado o no tiene un sello válido en la red.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVerification();
    }
  }, [id]);

  const handleCopyHash = () => {
    if (data?.blockchain?.hash_sha256) {
      navigator.clipboard.writeText(data.blockchain.hash_sha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
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
      console.error('Error al descargar PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Clock className="spin" size={48} color="#0284c7" />
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Verificando validez criptográfica del comprobante...</p>
        <style>{`
          .spin { animation: spin 2s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', padding: '40px', background: '#fff', borderRadius: '24px', border: '1px solid #fee2e2', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <AlertCircle size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Comprobante No Válido</h2>
        <p style={{ color: '#64748b', marginTop: '8px', lineHeight: 1.6 }}>{error || 'No se pudo comprobar la autenticidad de esta transacción.'}</p>
        <Link to="/propiedades" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '24px', padding: '12px 24px', background: '#0284c7', color: '#fff', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
          <ArrowLeft size={18} /> Volver a Propiedades
        </Link>
      </div>
    );
  }

  const porcentajeComision = ((data.comision_plataforma / (data.monto_bruto || 1)) * 100).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        
        {/* Navegación de retorno */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/propiedades" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Volver a Propiedades
          </Link>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>SAIPI Trust & Safety</span>
        </div>

        {/* Tarjeta Principal de Verificación */}
        <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', overflow: 'hidden' }}>
          
          {/* Header con Escudo de Verificación */}
          <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)', padding: '36px 32px', color: '#ffffff', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                <ShieldCheck size={36} color="#ffffff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <CheckCircle2 size={13} /> Certificado Oficial Inmutable
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Comprobante de Pago Válido</h1>
                <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.95rem' }}>Registro verificado criptográficamente en el ledger de SAIPI (Bolivia)</p>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            
            {/* Meta Datos Rápidos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>N° Comprobante</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>{data.recibo_nro}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Fecha de Liquidación</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                  {new Date(data.fecha_pago).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Estado de Transacción</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 800, fontSize: '0.95rem', marginTop: '2px' }}>
                  <CheckCircle2 size={16} /> Confirmado & Inmutable
                </div>
              </div>
            </div>

            {/* Partes Intervinientes */}
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#0284c7" /> Partes Intervinientes
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div style={{ padding: '18px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Beneficiario (Receptor)</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: '4px 0 2px' }}>{data.propietario.nombre}</h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>C.I.: <strong>{data.propietario.ci}</strong></div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{data.propietario.email}</div>
              </div>

              <div style={{ padding: '18px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Pagador (Emisor)</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: '4px 0 2px' }}>{data.inquilino.nombre}</h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>C.I.: <strong>{data.inquilino.ci}</strong></div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{data.inquilino.email}</div>
              </div>
            </div>

            {/* Propiedad y Concepto */}
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#0284c7" /> Inmueble y Operación
            </h3>
            <div style={{ padding: '20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{data.inmueble.titulo}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>{data.inmueble.direccion}</p>
                </div>
                <span style={{ padding: '4px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {data.tipo}
                </span>
              </div>
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed #e2e8f0', fontSize: '0.9rem', color: '#334155' }}>
                <strong>Concepto:</strong> {data.concepto} • <strong>Método:</strong> {data.metodo.toUpperCase()} • <strong>Transacción:</strong> {data.transaccion_id}
              </div>
            </div>

            {/* Desglose Financiero con Comisión */}
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={18} color="#0284c7" /> Liquidación Financiera
            </h3>
            <div style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '28px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#ffffff' }}>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>Concepto de Liquidación</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700, textAlign: 'center' }}>Tasa</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700, textAlign: 'right' }}>Monto ({data.moneda})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>
                      Monto Bruto Pagado (Total Depositado)
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center', color: '#64748b' }}>100.0%</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                      Bs {data.monto_bruto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ background: '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#dc2626' }}>
                      (-) Comisión de Servicio Plataforma SAIPI (Admin / Escrow)
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>
                      {porcentajeComision}%
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                      - Bs {data.comision_plataforma.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ background: '#f0fdf4' }}>
                    <td style={{ padding: '16px 18px', fontWeight: 800, color: '#166534', fontSize: '1rem' }}>
                      (=) TOTAL NETO LIQUIDADO AL PROPIETARIO
                    </td>
                    <td style={{ padding: '16px 18px', textAlign: 'center', fontWeight: 800, color: '#166534' }}>
                      Neto Efectivo
                    </td>
                    <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 800, color: '#166534', fontSize: '1.2rem' }}>
                      Bs {data.monto_neto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sello Criptográfico Blockchain */}
            <div style={{ padding: '24px', background: '#0f172a', borderRadius: '18px', color: '#ffffff', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Database size={20} color="#38bdf8" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                  Auditoría Criptográfica en Blockchain
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Asset ID</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{data.blockchain.asset_id}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Bloque Ledger</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>#{data.blockchain.bloque}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Red / Consenso</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{data.blockchain.consenso}</div>
                </div>
              </div>

              <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>SHA-256 Hash Inmutable</span>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#a5f3fc', wordBreak: 'break-all', marginTop: '2px' }}>
                    {data.blockchain.hash_sha256}
                  </div>
                </div>
                <button
                  onClick={handleCopyHash}
                  style={{ background: '#334155', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}
                >
                  {copied ? <Check size={14} color="#86efac" /> : <Copy size={14} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <p style={{ margin: '14px 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Certificado emitido bajo la Ley N° 164 del Estado Plurinacional de Bolivia. Toda alteración de este registro invalida su validez jurídica.
              </p>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                style={{ flex: 1, minWidth: '220px', padding: '14px 24px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}
              >
                <Download size={18} /> {downloading ? 'Descargando...' : 'Descargar Comprobante PDF Oficial'}
              </button>
              
              <Link
                to="/propiedades"
                style={{ padding: '14px 24px', background: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Cerrar
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default VerificarPago;
