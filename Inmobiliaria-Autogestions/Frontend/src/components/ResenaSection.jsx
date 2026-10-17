import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import api from '../services/api';
import useAlertConfirm from '../hooks/useAlertConfirm';

const StarRating = ({ rating, size = "1rem", interactive = false, onRate = null }) => {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star} 
          onClick={() => interactive && onRate && onRate(star)}
          style={{ 
            cursor: interactive ? 'pointer' : 'default',
            transition: 'transform 0.1s'
          }}
          onMouseEnter={e => interactive && (e.currentTarget.style.transform = 'scale(1.2)')}
          onMouseLeave={e => interactive && (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Star
            size={parseInt(size, 10) * 16 || 16}
            fill={star <= rating ? '#fbbf24' : 'none'}
            color={star <= rating ? '#fbbf24' : '#e2e8f0'}
          />
        </span>
      ))}
    </div>
  );
};

const ResenaSection = ({ inmuebleId, isAuthenticated, userId }) => {
  const { showAlert, ModalComponent } = useAlertConfirm();
  const [resenas, setResenas] = useState([]);
  const [promedio, setPromedio] = useState({ promedio: 0, total: 0 });
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResenas = useCallback(async () => {
    try {
      const res = await api.get(`/usuarios/resenas/?inmueble=${inmuebleId}`);
      setResenas(res.data.results || res.data);
    } catch (err) {
      console.error('Error cargando reseñas', err);
    }
    setLoading(false);
  }, [inmuebleId]);

  const fetchPromedio = useCallback(async () => {
    try {
      const res = await api.get(`/usuarios/resenas/promedio/${inmuebleId}/`);
      setPromedio(res.data);
    } catch (err) {
      console.error('Error cargando promedio', err);
    }
  }, [inmuebleId]);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    fetchResenas();
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    fetchPromedio();
  }, [inmuebleId, fetchResenas, fetchPromedio]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return showAlert({
        title: 'Acceso Restringido',
        message: 'Debes iniciar sesión para poder calificar este inmueble.',
        status: 'warning'
      });
    }
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return showAlert({
        title: 'Calificación Inválida',
        message: 'Por favor, ingresa una calificación válida entre 1 y 5 estrellas.',
        status: 'warning'
      });
    }
    
    try {
      await api.post('/usuarios/resenas/', {
        inmueble: inmuebleId,
        calificacion,
        comentario
      });
      setComentario('');
      setCalificacion(5);
      fetchResenas();
      fetchPromedio();
      showAlert({
        title: 'Opinión Guardada',
        message: '¡Gracias por compartir tu opinión sobre este inmueble!',
        status: 'success'
      });
    } catch (err) {
      showAlert({
        title: 'Error de Envío',
        message: err.response?.data?.error || 'Ya calificaste este inmueble o hubo un error al enviar tu reseña.',
        status: 'error'
      });
    }
  };

  return (
    <div style={{ marginTop: '40px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Opiniones de Usuarios</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <StarRating rating={Math.round(promedio.promedio)} size="1.2rem" />
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{promedio.promedio}/5</span>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>({promedio.total} reseñas)</span>
        </div>
      </div>

      {isAuthenticated && !resenas.find(r => r.usuario === userId) && (
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--color-border)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Deja tu calificación</h4>
          <div style={{ marginBottom: '12px' }}>
            <StarRating rating={calificacion} interactive={true} onRate={setCalificacion} size="1.5rem" />
          </div>
          <textarea 
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="¿Qué te pareció este inmueble? (Opcional)"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', minHeight: '80px', marginBottom: '12px', fontFamily: 'inherit' }}
          />
          <button type="submit" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Enviar Opinión
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Cargando reseñas...</div>
      ) : resenas.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>Aún no hay reseñas para este inmueble.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {resenas.map(resena => (
            <div key={resena.id} style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 600 }}>{resena.usuario_nombre || resena.usuario_username}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  {new Date(resena.creado).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <StarRating rating={resena.calificacion} />
              {resena.comentario && (
                <p style={{ marginTop: '12px', marginBottom: 0, color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {resena.comentario}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {ModalComponent}
    </div>
  );
};

export default ResenaSection;
