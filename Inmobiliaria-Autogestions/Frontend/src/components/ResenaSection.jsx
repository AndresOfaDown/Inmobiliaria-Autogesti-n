import { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, Edit3, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../services/api';
import useAlertConfirm from '../hooks/useAlertConfirm';

const CALIFICACION_LABELS = {
  1: 'Deficiente (1 estrella)',
  2: 'Regular (2 estrellas)',
  3: 'Bueno (3 estrellas)',
  4: 'Muy Bueno (4 estrellas)',
  5: 'Excelente (5 estrellas)',
};

const StarRating = ({ rating, size = 18, interactive = false, onRate = null, hoverRating = 0, onHover = null }) => {
  return (
    <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = hoverRating ? star <= hoverRating : star <= rating;
        return (
          <span
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onHover && onHover(0)}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform 0.15s ease',
              display: 'inline-flex',
            }}
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : 'none'}
              color={isFilled ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={isFilled ? 0 : 2}
            />
          </span>
        );
      })}
    </div>
  );
};

const ResenaSection = ({ inmuebleId, isAuthenticated, userId }) => {
  const { showAlert, showConfirm, ModalComponent } = useAlertConfirm();
  const [resenas, setResenas] = useState([]);
  const [promedio, setPromedio] = useState({ promedio: 0, total: 0, desglose: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [calificacion, setCalificacion] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchResenas = useCallback(async () => {
    try {
      const res = await api.get(`/usuarios/resenas/?inmueble=${inmuebleId}`);
      setResenas(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error cargando reseñas:', err);
    } finally {
      setLoading(false);
    }
  }, [inmuebleId]);

  const fetchPromedio = useCallback(async () => {
    try {
      const res = await api.get(`/usuarios/resenas/promedio/${inmuebleId}/`);
      setPromedio(res.data);
    } catch (err) {
      console.error('Error cargando promedio:', err);
    }
  }, [inmuebleId]);

  useEffect(() => {
    fetchResenas();
    fetchPromedio();
  }, [inmuebleId, fetchResenas, fetchPromedio]);

  const miResena = resenas.find((r) => r.usuario === userId);

  const handleIniciarEdicion = (resena) => {
    setEditandoId(resena.id);
    setCalificacion(resena.calificacion);
    setComentario(resena.comentario || '');
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setCalificacion(5);
    setComentario('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return showAlert({
        title: 'Acceso Restringido',
        message: 'Debes iniciar sesión con tu cuenta para calificar este inmueble.',
        status: 'warning',
      });
    }

    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return showAlert({
        title: 'Calificación Inválida',
        message: 'Por favor, selecciona una puntuación entre 1 y 5 estrellas.',
        status: 'warning',
      });
    }

    setSubmitting(true);
    try {
      await api.post('/usuarios/resenas/', {
        inmueble: inmuebleId,
        calificacion,
        comentario,
      });

      setComentario('');
      setCalificacion(5);
      setEditandoId(null);
      await fetchResenas();
      await fetchPromedio();

      showAlert({
        title: editandoId ? 'Opinión Actualizada' : '¡Gracias por tu Opinión!',
        message: editandoId
          ? 'Tu reseña ha sido modificada con éxito.'
          : 'Tu calificación se ha registrado. El propietario ha sido notificado.',
        status: 'success',
      });
    } catch (err) {
      showAlert({
        title: 'Error de Envío',
        message: err.response?.data?.message || err.response?.data?.error || 'No se pudo guardar la reseña.',
        status: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = (resenaId) => {
    showConfirm({
      title: '¿Eliminar tu reseña?',
      message: '¿Estás seguro de que deseas eliminar tu opinión sobre este inmueble? Esta acción no se puede deshacer.',
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await api.delete(`/usuarios/resenas/${resenaId}/`);
          handleCancelarEdicion();
          await fetchResenas();
          await fetchPromedio();
          showAlert({
            title: 'Reseña Eliminada',
            message: 'Tu opinión ha sido eliminada correctamente.',
            status: 'success',
          });
        } catch (err) {
          showAlert({
            title: 'Error al Eliminar',
            message: err.response?.data?.message || 'No se pudo eliminar la reseña.',
            status: 'error',
          });
        }
      },
    });
  };

  return (
    <div style={{ marginTop: '48px', borderTop: '1px solid var(--color-border)', paddingTop: '32px' }}>
      {/* Header con Resumen General */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <MessageSquare size={22} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
              Opiniones y Reseñas de la Comunidad
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Experiencias compartidas por inquilinos y visitantes sobre este inmueble
          </p>
        </div>

        {/* Tarjeta de Score Promedio */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: '#f8fafc',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
              {promedio.promedio > 0 ? promedio.promedio : '0.0'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
              de 5 estrellas
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '16px' }}>
            <StarRating rating={Math.round(promedio.promedio)} size={18} />
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
              {promedio.total} {promedio.total === 1 ? 'opinión registrada' : 'opiniones registradas'}
            </div>
          </div>
        </div>
      </div>

      {/* Desglose de barras de satisfacción */}
      {promedio.total > 0 && promedio.desglose && (
        <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '28px', maxWidth: '540px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Distribución de Calificaciones
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = promedio.desglose[starNum] || 0;
              const pct = promedio.total > 0 ? Math.round((count / promedio.total) * 100) : 0;
              return (
                <div key={starNum} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                  <span style={{ width: '38px', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {starNum} <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  </span>
                  <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: starNum >= 4 ? '#10b981' : starNum === 3 ? '#f59e0b' : '#ef4444',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <span style={{ width: '42px', textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulario de Calificación / Edición */}
      {isAuthenticated && (!miResena || editandoId) && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '32px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={18} color="var(--color-primary)" />
              {editandoId ? 'Modificar tu reseña' : 'Comparte tu opinión sobre este inmueble'}
            </h4>
            {editandoId && (
              <button
                type="button"
                onClick={handleCancelarEdicion}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Cancelar edición
              </button>
            )}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Tu puntuación:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <StarRating
                rating={calificacion}
                size={26}
                interactive={true}
                onRate={setCalificacion}
                hoverRating={hoverRating}
                onHover={setHoverRating}
              />
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: (hoverRating || calificacion) >= 4 ? '#059669' : (hoverRating || calificacion) === 3 ? '#d97706' : '#dc2626',
                  background: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {CALIFICACION_LABELS[hoverRating || calificacion]}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Comentario u observaciones (opcional):
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos sobre las instalaciones, luminosidad, presión de agua, tranquilidad de la zona o trato con la gestión digital..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                resize: 'vertical',
                minHeight: '85px',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                background: '#ffffff',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'var(--color-primary)',
                color: '#ffffff',
                border: 'none',
                padding: '11px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {submitting ? 'Guardando...' : editandoId ? 'Guardar Cambios' : 'Publicar Reseña'}
            </button>
          </div>
        </form>
      )}

      {/* Listado de Reseñas */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '36px', fontSize: '0.95rem' }}>
          Cargando opiniones de la comunidad...
        </div>
      ) : resenas.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '36px 20px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
          }}
        >
          <MessageSquare size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
          <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#334155' }}>Aún no hay reseñas</h4>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            {isAuthenticated
              ? 'Sé el primero en compartir tu experiencia y calificar este inmueble.'
              : 'Inicia sesión para ser el primero en dejar una opinión.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {resenas.map((resena) => {
            const esMia = resena.usuario === userId;
            const fechaStr = resena.creado
              ? new Date(resena.creado).toLocaleDateString('es-BO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Reciente';

            const iniciales = (resena.usuario_nombre || 'Usuario')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            return (
              <div
                key={resena.id}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: esMia ? '#f0fdf4' : '#ffffff',
                  border: esMia ? '1px solid #86efac' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  {/* Info Usuario */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {resena.usuario_foto ? (
                      <img
                        src={resena.usuario_foto}
                        alt={resena.usuario_nombre}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: esMia ? '#15803d' : '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {iniciales}
                      </div>
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                          {resena.usuario_nombre || 'Usuario Registrado'}
                        </span>
                        {esMia && (
                          <span
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid #bbf7d0',
                            }}
                          >
                            Tú
                          </span>
                        )}
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <ShieldCheck size={12} color="#059669" /> Verificado
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>{fechaStr}</div>
                    </div>
                  </div>

                  {/* Acciones para el autor */}
                  {esMia && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleIniciarEdicion(resena)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Edit3 size={13} /> Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(resena.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '6px' }}>
                  <StarRating rating={resena.calificacion} size={16} />
                </div>

                {resena.comentario && (
                  <p style={{ marginTop: '10px', marginBottom: 0, color: '#334155', fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {resena.comentario}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {ModalComponent}
    </div>
  );
};

export default ResenaSection;
