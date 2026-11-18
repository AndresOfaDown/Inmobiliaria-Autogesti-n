import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Download,
  ExternalLink,
  Receipt,
  AlertCircle,
  X,
  Lock,
  Building2
} from 'lucide-react';

const ModalPagarAlquiler = ({ isOpen, onClose, contratoInicial, onPagoExitoso }) => {
  const [contratos, setContratos] = useState([]);
  const [contratoId, setContratoId] = useState('');
  const [concepto, setConcepto] = useState('Alquiler mensual Noviembre 2026');
  const [monto, setMonto] = useState(0);
  const [metodo, setMetodo] = useState('qr');
  const [loading, setLoading] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Datos y método, 2: Simulación pasarela, 3: Éxito y comprobante
  const [pagoResultado, setPagoResultado] = useState(null);
  const [error, setError] = useState('');

  // Cargar contratos activos del usuario donde es inquilino
  useEffect(() => {
    if (!isOpen) {
      setPaso(1);
      setPagoResultado(null);
      setError('');
      return;
    }

    const loadContratos = async () => {
      try {
        setLoading(true);
        const res = await api.get('/inmuebles/contratos/');
        const list = res.data || [];
        // Filtramos contratos activos o aceptados
        const disponibles = list.filter(c => c.estado === 'activo' || c.estado === 'aceptado' || c.estado === 'enviado');
        setContratos(disponibles);

        if (contratoInicial && contratoInicial.id) {
          setContratoId(contratoInicial.id);
          setMonto(contratoInicial.monto || 0);
          setConcepto(`Alquiler mensual ${new Intl.DateTimeFormat('es-BO', { month: 'long', year: 'numeric' }).format(new Date())}`);
        } else if (disponibles.length > 0) {
          setContratoId(disponibles[0].id);
          setMonto(disponibles[0].monto || 0);
          setConcepto(`Alquiler mensual ${new Intl.DateTimeFormat('es-BO', { month: 'long', year: 'numeric' }).format(new Date())}`);
        }
      } catch (err) {
        console.error('Error cargando contratos para pago:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContratos();
  }, [isOpen, contratoInicial]);

  const contratoActual = contratos.find(c => c.id === Number(contratoId)) || contratoInicial;

  // Actualizar monto al cambiar de contrato
  const handleContratoChange = (id) => {
    setContratoId(id);
    const c = contratos.find(item => item.id === Number(id));
    if (c) {
      setMonto(c.monto || 0);
    }
  };

  // Cálculos de liquidación y comisión
  const montoNum = parseFloat(monto) || 0;
  const comisionPlataforma = Math.round((montoNum * 0.05) * 100) / 100;
  const montoNetoPropietario = Math.round((montoNum - comisionPlataforma) * 100) / 100;

  const handleProcederPasarela = (e) => {
    e.preventDefault();
    if (montoNum <= 0) {
      setError('El monto a pagar debe ser mayor a 0');
      return;
    }
    setError('');
    setPaso(2);
  };

  const handleConfirmarPago = async () => {
    try {
      setProcesando(true);
      setError('');

      const payload = {
        contrato_id: contratoId ? Number(contratoId) : null,
        inmueble_id: contratoActual?.inmueble_id || contratoActual?.inmueble?.id,
        propietario_id: contratoActual?.propietario_id || contratoActual?.propietario?.id,
        monto: montoNum,
        concepto: concepto,
        metodo: metodo,
        moneda: contratoActual?.moneda || 'BOB',
        tipo: 'alquiler',
      };

      const res = await api.post('/pagos/procesar/', payload);
      setPagoResultado(res.data.pago);
      setPaso(3);
      if (onPagoExitoso) onPagoExitoso(res.data.pago);
    } catch (err) {
      console.error('Error procesando pago:', err);
      setError(err.response?.data?.message || 'Error al conectar con la pasarela de pagos. Por favor intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  };

  const handleDescargarPdf = (id) => {
    const baseURL = api.defaults.baseURL || 'http://localhost:3000/api';
    const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const downloadUrl = `${cleanBase}/pagos/comprobante/${id}/pdf`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `Comprobante_Pago_REC-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Encabezado */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={24} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Pagar Alquiler Inmobiliario</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Pasarela de Pagos Digital con Smart Escrow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Indicador de pasos */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', padding: '12px 28px', fontSize: '0.8rem', fontWeight: 700 }}>
          <div style={{ flex: 1, color: paso >= 1 ? '#0284c7' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: paso >= 1 ? '#0284c7' : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
            Detalle
          </div>
          <div style={{ flex: 1, color: paso >= 2 ? '#0284c7' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: paso >= 2 ? '#0284c7' : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
            Pasarela
          </div>
          <div style={{ flex: 1, color: paso === 3 ? '#059669' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: paso === 3 ? '#059669' : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
            Comprobante
          </div>
        </div>

        <div style={{ padding: '28px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* ─── PASO 1: DETALLE DEL PAGO Y SELECCIÓN DE MÉTODO ─── */}
          {paso === 1 && (
            <form onSubmit={handleProcederPasarela} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Selección de Contrato */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Contrato de Alquiler Asociado
                </label>
                {contratos.length > 0 ? (
                  <select
                    value={contratoId}
                    onChange={(e) => handleContratoChange(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
                    required
                  >
                    {contratos.map(c => (
                      <option key={c.id} value={c.id}>
                        Contrato #{c.id} — {c.inmueble_titulo} (Bs {Number(c.monto).toLocaleString('es-BO')})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
                    {contratoActual ? `Contrato #${contratoActual.id} — ${contratoActual.inmueble_titulo}` : 'No tienes contratos registrados.'}
                  </div>
                )}
              </div>

              {/* Inmueble y Propietario info */}
              {contratoActual && (
                <div style={{ padding: '14px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0369a1', fontWeight: 700, marginBottom: '4px' }}>
                    <Building2 size={16} /> {contratoActual.inmueble_titulo}
                  </div>
                  <div style={{ color: '#0c4a6e' }}>
                    Propietario: <strong>{contratoActual.propietario_nombre || contratoActual.propietario?.first_name || 'Propietario Registrado'}</strong>
                  </div>
                </div>
              )}

              {/* Concepto del pago */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Concepto del Pago
                </label>
                <input
                  type="text"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  placeholder="Ej: Alquiler mensual Noviembre 2026"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  required
                />
              </div>

              {/* Monto del Pago */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Monto a Pagar (Bolivianos - BOB)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '12px', fontWeight: 800, color: '#64748b' }}>Bs</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}
                    required
                  />
                </div>
              </div>

              {/* Desglose de Liquidación con Comisión en Tiempo Real */}
              <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Desglose de Liquidación Automática
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginTop: '10px' }}>
                  <span>Monto Bruto a debitar:</span>
                  <strong style={{ color: '#1e293b' }}>Bs {montoNum.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#dc2626', marginTop: '6px' }}>
                  <span>(-) Comisión de Plataforma SAIPI (Admin 5%):</span>
                  <strong>- Bs {comisionPlataforma.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#166534', fontWeight: 800, marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                  <span>(=) Neto Liquidado al Propietario:</span>
                  <span>Bs {montoNetoPropietario.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                  Selecciona la Pasarela / Método de Pago
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setMetodo('qr')}
                    style={{
                      padding: '14px 8px',
                      borderRadius: '12px',
                      border: metodo === 'qr' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: metodo === 'qr' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <QrCode size={24} color={metodo === 'qr' ? '#0284c7' : '#64748b'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: metodo === 'qr' ? '#0284c7' : '#334155' }}>QR Simple</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodo('stripe')}
                    style={{
                      padding: '14px 8px',
                      borderRadius: '12px',
                      border: metodo === 'stripe' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: metodo === 'stripe' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CreditCard size={24} color={metodo === 'stripe' ? '#0284c7' : '#64748b'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: metodo === 'stripe' ? '#0284c7' : '#334155' }}>Tarjeta (Stripe)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodo('transferencia')}
                    style={{
                      padding: '14px 8px',
                      borderRadius: '12px',
                      border: metodo === 'transferencia' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: metodo === 'transferencia' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Building size={24} color={metodo === 'transferencia' ? '#0284c7' : '#64748b'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: metodo === 'transferencia' ? '#0284c7' : '#334155' }}>Transferencia</span>
                  </button>
                </div>
              </div>

              {/* Botón de acción */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                  marginTop: '10px'
                }}
              >
                Continuar al Pago <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* ─── PASO 2: SIMULACIÓN DE PASARELA (QR / STRIPE) ─── */}
          {paso === 2 && (
            <div style={{ textAlign: 'center' }}>
              {metodo === 'qr' && (
                <div>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <QrCode size={32} />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>Escanea para Pagar con QR Simple</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 20px' }}>
                    Compatible con cualquier entidad financiera de Bolivia (BCP, BNB, Banco Unión, Mercantil Santa Cruz).
                  </p>

                  {/* QR Image Box */}
                  <div style={{ background: '#ffffff', border: '2px dashed #0284c7', borderRadius: '16px', padding: '20px', display: 'inline-block', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SAIPI-PAGO-BS-${montoNum}-CONTRATO-${contratoId}`}
                      alt="QR Simple Boliviano"
                      style={{ width: '180px', height: '180px', display: 'block' }}
                    />
                    <div style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                      Bs {montoNum.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '16px' }}>
                    ⏱ Código QR válido por 04:59 minutos • Protección Criptográfica SHA-256
                  </p>
                </div>
              )}

              {metodo === 'stripe' && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Lock size={18} color="#059669" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Pasarela Segura Stripe Gateway (SSL 256-bit)</span>
                  </div>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Número de Tarjeta</label>
                      <input type="text" readOnly value="•••• •••• •••• 4242 (Visa Débito BCP)" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, fontSize: '0.9rem' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Vencimiento</label>
                        <input type="text" readOnly value="12/28" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.9rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CVC</label>
                        <input type="text" readOnly value="•••" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.9rem' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                    Total a autorizar: <strong>Bs {montoNum.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              )}

              {metodo === 'transferencia' && (
                <div style={{ textAlign: 'left', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: '0 0 10px' }}>Datos de la Cuenta Smart Escrow SAIPI</h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0' }}>• <strong>Banco:</strong> Banco Mercantil Santa Cruz (BMSC)</p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0' }}>• <strong>N° de Cuenta:</strong> 4010-892341-01</p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0' }}>• <strong>Titular:</strong> SAIPI Tecnologías Inmobiliarias S.R.L.</p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0' }}>• <strong>NIT:</strong> 3948102019</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  disabled={procesando}
                  style={{ padding: '12px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Modificar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarPago}
                  disabled={procesando}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {procesando ? (
                    <>
                      <Clock className="spin" size={18} /> Procesando y Sellando en Blockchain...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Confirmar y Liquidar Pago
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─── PASO 3: PAGO COMPLETADO Y COMPROBANTE ─── */}
          {paso === 3 && pagoResultado && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.2)' }}>
                <CheckCircle2 size={40} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>¡Pago Exitoso y Sellado en Blockchain!</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '6px 0 20px' }}>
                Se ha generado el Comprobante Fiscal Digital Inmutable con Código QR.
              </p>

              {/* Resumen del Comprobante Generado */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px', textAlign: 'left', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>N° Comprobante:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>{pagoResultado.recibo_nro}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Inmueble:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{pagoResultado.inmueble_titulo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Monto Bruto Pagado:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>Bs {pagoResultado.monto_bruto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#dc2626' }}>
                  <span>Comisión Plataforma (Admin 5%):</span>
                  <strong>- Bs {pagoResultado.comision_plataforma.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#166534', fontWeight: 800, paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                  <span>Neto Liquidado al Propietario:</span>
                  <span>Bs {pagoResultado.monto_neto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Registro Blockchain */}
              <div style={{ background: '#0f172a', borderRadius: '14px', padding: '14px', color: '#ffffff', textAlign: 'left', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    <ShieldCheck size={14} /> Auditoría en Ledger
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', marginTop: '2px' }}>
                    Bloque #{pagoResultado.bloque} • Asset {pagoResultado.blockchain_asset_id}
                  </div>
                </div>
                <a
                  href={`/verificar-pago/${pagoResultado.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textDecoration: 'none', background: 'rgba(56, 189, 248, 0.15)', padding: '6px 12px', borderRadius: '8px' }}
                >
                  <ExternalLink size={12} /> Ver en Blockchain
                </a>
              </div>

              {/* Acciones Finales */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDescargarPdf(pagoResultado.id)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Download size={18} /> Descargar Comprobante Oficial en PDF
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Finalizar y Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ModalPagarAlquiler;
