import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, FileText, Home, Loader2, AlertTriangle } from 'lucide-react';
import pagoService from '../../services/pagoService';
import './Propiedades.css';

const PagoExitoso = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [transaccion, setTransaccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No se encontró la sesión de pago');
      setLoading(false);
      return;
    }

    const confirmar = async () => {
      try {
        const data = await pagoService.confirmarPago(sessionId);
        setTransaccion(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error confirmando el pago');
      } finally {
        setLoading(false);
      }
    };

    confirmar();
  }, [sessionId]);

  return (
    <div className="propiedades-page">
      <div
        style={{
          maxWidth: '600px',
          margin: '60px auto',
          padding: '40px',
          background: 'var(--color-bg-card)',
          color: 'var(--color-text)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px' }}>
            <Loader2 size={48} style={{ color: '#0ea5e9', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Confirmando tu pago...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <AlertTriangle size={40} color="#dc2626" />
            </div>
            <h2 style={{ color: '#dc2626', marginBottom: '12px' }}>Error</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          </div>
        ) : (
          <>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
              }}
            >
              <CheckCircle size={48} color="#fff" />
            </div>
            <h1 style={{ color: '#059669', fontSize: '1.8rem', marginBottom: '8px' }}>¡Pago Exitoso!</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', marginBottom: '28px' }}>
              Tu pago ha sido procesado correctamente.
            </p>

            {transaccion && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '28px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Monto:</span>
                    <span style={{ fontWeight: 700, color: '#059669', fontSize: '1.1rem' }}>
                      ${transaccion.monto} {transaccion.moneda?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Estado:</span>
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#16a34a',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {transaccion.estado}
                    </span>
                  </div>
                  {transaccion.inmueble_titulo && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Propiedad:</span>
                      <span style={{ fontWeight: 600 }}>{transaccion.inmueble_titulo}</span>
                    </div>
                  )}
                  {transaccion.tipo_operacion && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Tipo:</span>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{transaccion.tipo_operacion}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Transacción:</span>
                    <span style={{ fontWeight: 600 }}>#{transaccion.id}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {transaccion?.comprobante_url && (
                <a
                  href={transaccion.comprobante_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    transition: 'transform 0.15s',
                  }}
                >
                  <FileText size={18} /> Ver Comprobante
                </a>
              )}
              <Link
                to="/mensajes"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                Volver al Chat
              </Link>
              <Link
                to="/propiedades"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                <Home size={18} /> Inicio
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PagoExitoso;
