import { Link } from 'react-router-dom';
import { XCircle, Home, MessageSquare } from 'lucide-react';
import './Propiedades.css';

const PagoCancelado = () => {
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
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 4px 20px rgba(249,115,22,0.3)',
          }}
        >
          <XCircle size={48} color="#fff" />
        </div>
        <h1 style={{ color: '#ea580c', fontSize: '1.8rem', marginBottom: '8px' }}>Pago Cancelado</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', marginBottom: '28px' }}>
          El proceso de pago ha sido cancelado. No se ha realizado ningún cargo.
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
          Puedes volver al chat para solicitar un nuevo enlace de pago al propietario.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/mensajes"
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
            }}
          >
            <MessageSquare size={18} /> Volver al Chat
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
      </div>
    </div>
  );
};

export default PagoCancelado;
