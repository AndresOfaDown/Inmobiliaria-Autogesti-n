import { useState, useEffect } from 'react';
import api from '../../services/api';
import { API_BASE_URL } from '../../config';
import { CheckCircle2, XCircle, RefreshCw, Server, Globe } from 'lucide-react';

const TestConexion = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);

  const probarConexion = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const [resStatus, resHealth] = await Promise.all([
        api.get('/'),
        api.get('/health'),
      ]);
      const end = performance.now();
      setLatency(Math.round(end - start));
      setStatus(resStatus.data);
      setHealth(resHealth.data);
    } catch (err) {
      console.error('Error al conectar con el backend:', err);
      setError(err.message || 'No se pudo conectar con el backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    probarConexion();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
              Prueba de Conexión Frontend ⇄ Backend (NestJS)
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Verificando comunicación directa entre la app de Vite y la API de NestJS.
            </p>
          </div>
          <button
            onClick={probarConexion}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background-color 0.2s',
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Probando...' : 'Reintentar'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: '600', marginBottom: '4px' }}>
              <Globe size={18} color="#2563eb" />
              <span>Frontend URL</span>
            </div>
            <code style={{ fontSize: '14px', color: '#0284c7' }}>{window.location.origin}</code>
          </div>

          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: '600', marginBottom: '4px' }}>
              <Server size={18} color="#10b981" />
              <span>Backend API (NestJS)</span>
            </div>
            <code style={{ fontSize: '14px', color: '#059669' }}>{API_BASE_URL}</code>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            <p>Conectando con el servidor NestJS...</p>
          </div>
        ) : error ? (
          <div style={{
            padding: '20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <XCircle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600' }}>Error al conectar</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#b91c1c' }}>
                Verifica que el backend de NestJS esté activo en el puerto 3000 con <code>npm run start:dev</code>.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <CheckCircle2 size={24} color="#16a34a" />
              <div>
                <strong style={{ fontSize: '16px' }}>¡Conexión exitosa!</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#15803d' }}>
                  El backend NestJS respondió correctamente en {latency}ms (CORS habilitado).
                </p>
              </div>
            </div>

            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '16px', color: '#f8fafc' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
                Respuesta recibida desde NestJS (GET /api):
              </div>
              <pre style={{ margin: 0, fontSize: '13px', overflowX: 'auto', fontFamily: 'monospace' }}>
                {JSON.stringify(status, null, 2)}
              </pre>

              {health && (
                <>
                  <div style={{ fontSize: '12px', color: '#94a3b8', margin: '16px 0 8px 0', fontWeight: '600', textTransform: 'uppercase' }}>
                    Respuesta de salud (GET /api/health):
                  </div>
                  <pre style={{ margin: 0, fontSize: '13px', overflowX: 'auto', fontFamily: 'monospace' }}>
                    {JSON.stringify(health, null, 2)}
                  </pre>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestConexion;
