import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, Share2, MapPin, Bed, Bath, Maximize2, X, ChevronLeft,
  ChevronRight, Home, Video, MessageCircle, Check, AlertCircle, Calendar,
  ShieldCheck, ShieldAlert, Lock, Orbit
} from 'lucide-react';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import ResenaSection from '../../components/ResenaSection';
import ModalAgendarCita from '../../components/ModalAgendarCita';
import Visor360 from '../../components/Visor360';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import './Propiedades.css';

const RenderPaseBadge = ({ expiracion }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiracion) return;
    const update = () => {
      const diff = new Date(expiracion) - new Date();
      if (diff <= 0) {
        setTimeLeft('Pase Expirado');
        setExpired(true);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`Pase temporal activo: ${mins}m ${secs}s restantes`);
        setExpired(false);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiracion]);

  if (expired) return null;

  return (
    <div style={{
      background: 'rgba(16, 185, 129, 0.15)',
      color: '#059669',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.82rem',
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '12px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
    }}>
      <Orbit size={16} className="spin" />
      {timeLeft}
    </div>
  );
};

const PropiedadDetalle = () => {
  const { id } = useParams();
  const [inmueble, setInmueble] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCitaModal, setShowCitaModal] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [acceso360, setAcceso360] = useState({ tieneAcceso: false, propietario: false, fechaExpiracion: null, accesoId: null });
  const [accesoLoading, setAccesoLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState('media');

  useEffect(() => {
    api.get(`/inmuebles/lista/${id}/`)
      .then(res => setInmueble(res.data))
      .catch(err => {
        console.error(err);
        setError('No se pudo cargar la información del inmueble.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setTimeout(() => {
        setAcceso360({ tieneAcceso: false, propietario: false, fechaExpiracion: null, accesoId: null });
        setAccesoLoading(false);
      }, 0);
      return;
    }

    let intervalId = null;

    const checkAcceso = () => {
      api.get('/inmuebles/accesos-360/check/', { params: { inmueble_id: id } })
        .then(res => {
          setAcceso360({
            tieneAcceso: res.data.tiene_acceso,
            propietario: res.data.propietario,
            fechaExpiracion: res.data.fecha_expiracion,
            accesoId: res.data.acceso_id
          });
          
          if (res.data.tiene_acceso && intervalId) {
            clearInterval(intervalId);
          }
        })
        .catch(err => console.error("Error al verificar acceso 360:", err))
        .finally(() => setAccesoLoading(false));
    };

    setTimeout(() => {
      setAccesoLoading(true);
      checkAcceso();
    }, 0);

    // Polling inteligente para reactividad inmediata (cada 4 segundos)
    intervalId = setInterval(() => {
      setAcceso360(prev => {
        if (!prev.tieneAcceso) {
          checkAcceso();
        } else {
          clearInterval(intervalId);
        }
        return prev;
      });
    }, 4000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, isAuthenticated]);


  const handleContactar = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.rol === 'admin') {
      setShowConfirmModal(true);
      return;
    }

    const activePub = inmueble.publicaciones?.find(p => p.estado === 'activa');
    const pubIdQuery = activePub ? `&publicacionId=${activePub.id}` : '';
    navigate(`/mensajes?inmuebleId=${inmueble.id}&propietarioId=${inmueble.propietario}&inmuebleTitulo=${encodeURIComponent(inmueble.titulo)}${pubIdQuery}`);
  };

  const handleSolicitarAcceso360 = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.rol === 'admin') {
      setShowConfirmModal(true);
      return;
    }

    const activePub = inmueble.publicaciones?.find(p => p.estado === 'activa');
    const pubIdQuery = activePub ? `&publicacionId=${activePub.id}` : '';
    navigate(`/mensajes?inmuebleId=${inmueble.id}&propietarioId=${inmueble.propietario}&inmuebleTitulo=${encodeURIComponent(inmueble.titulo)}${pubIdQuery}&solicitar360=true`);
  };


  const confirmAdminContact = async () => {
    // Aquí el admin confirma que ya habló con el usuario
    try {
      setShowConfirmModal(false);
      const activePub = inmueble.publicaciones?.find(p => p.estado === 'activa');
      const pubIdQuery = activePub ? `&publicacionId=${activePub.id}` : '';
      navigate(`/mensajes?inmuebleId=${inmueble.id}&propietarioId=${inmueble.propietario}${pubIdQuery}`);
    } catch (err) {
      console.error(err);
    }
  };

  const _shareWhatsApp = () => {
    const activePub = inmueble.publicaciones?.find(p => p.estado === 'activa');
    const precioTexto = activePub ? `Bs. ${parseFloat(activePub.precio).toLocaleString()} (${activePub.tipo_oferta})` : 'Sin oferta';
    const text = `Mira este inmueble: ${inmueble.titulo} - ${precioTexto}. ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const estadoColors = {
    disponible: { bg: '#dcfce7', color: '#15803d' },
    ocupado: { bg: '#fee2e2', color: '#dc2626' },
    mantenimiento: { bg: '#fef3c7', color: '#d97706' },
    reservado: { bg: '#dbeafe', color: '#2563eb' },
  };

  // Separar multimedia normal de panoramas 360°
  const mediaNormal = inmueble?.multimedia?.filter(m => m.tipo !== 'panorama360' && m.tipo !== 'musica') || [];
  const panoramas360 = inmueble?.multimedia?.filter(m => m.tipo === 'panorama360') || [];
  const musicaVR = inmueble?.multimedia?.find(m => m.tipo === 'musica');

  const principalMedia = mediaNormal.find(m => m.principal) || mediaNormal[0];
  const restoMedia = mediaNormal.filter(m => m.id !== principalMedia?.id) || [];
  const allMedia = principalMedia ? [principalMedia, ...restoMedia] : restoMedia;
  const thumbMedia = restoMedia.slice(0, 3);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedMediaIndex === null) return;
      if (e.key === 'ArrowRight') {
        setSelectedMediaIndex(prev => (prev < allMedia.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setSelectedMediaIndex(prev => (prev > 0 ? prev - 1 : allMedia.length - 1));
      } else if (e.key === 'Escape') {
        setSelectedMediaIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMediaIndex, allMedia.length]);

  if (loading) {
    return (
      <div className="propiedades-page">
        <div className="propiedades-loading">Cargando detalles del inmueble...</div>
      </div>
    );
  }

  if (error || !inmueble) {
    return (
      <div className="propiedades-page">
        <div className="propiedades-empty">
          <p>{error || 'Inmueble no encontrado.'}</p>
          <Link to="/propiedades" className="propiedad-card__cta" style={{ display: 'inline-block', marginTop: '16px' }}>Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  const estadoStyle = estadoColors[inmueble.estado] || estadoColors.disponible;

  return (
    <div className="propiedades-page">
      <div className="propiedades-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Link to="/propiedades" style={{ marginBottom: '20px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={18} /> Volver al catálogo
        </Link>

        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          {(() => {
            const offerColors = {
              alquiler: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Alquiler', border: '1px solid rgba(16, 185, 129, 0.2)' },
              venta: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', label: 'Venta', border: '1px solid rgba(99, 102, 241, 0.2)' },
              anticretico: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Anticrético', border: '1px solid rgba(245, 158, 11, 0.2)' },
            };
            const activePub = inmueble.publicaciones?.find(p => p.estado === 'activa');
            const offerStyle = activePub ? offerColors[activePub.tipo_oferta] : null;

            return (
              <>
                {/* ─── Pestañas de Visualización Superior ─── */}
                <div style={{ 
                  display: 'flex', 
                  borderBottom: '1px solid var(--color-border)', 
                  background: '#f8fafc',
                  padding: '0 24px',
                  gap: '8px'
                }}>
                  <button 
                    onClick={() => setTabActiva('media')}
                    style={{
                      padding: '16px 20px',
                      background: 'none',
                      border: 'none',
                      borderBottom: tabActiva === 'media' ? '3px solid var(--color-primary)' : '3px solid transparent',
                      color: tabActiva === 'media' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.92rem'
                    }}
                    type="button"
                  >
                    Fotos y Videos
                  </button>
                  {panoramas360.length > 0 && (
                    <button 
                      onClick={() => setTabActiva('360')}
                      style={{
                        padding: '16px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: tabActiva === '360' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: tabActiva === '360' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.92rem'
                      }}
                      type="button"
                    >
                      Recorrido 3D (360°)
                    </button>
                  )}

                </div>

                {/* ─── Pestaña: Fotos y Videos ─── */}
                {tabActiva === 'media' && (
                  <div style={{ display: 'flex', gap: '12px', background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', overflow: 'hidden' }}>
                    {/* Imagen Principal */}
                    <div style={{ flex: 1, height: '400px', position: 'relative', background: '#f0f9ff' }}>
                      {principalMedia ? (
                        principalMedia.tipo === 'video' ? (
                          <video src={principalMedia.archivo} controls style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => setSelectedMediaIndex(0)} />
                        ) : (
                          <img src={principalMedia.archivo} alt={inmueble.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => setSelectedMediaIndex(0)} />
                        )
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-primary)', opacity: 0.4 }}>
                          <Home size={80} strokeWidth={1.5} />
                        </div>
                      )}
                      
                      <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2 }}>
                        <span style={{ background: estadoStyle.bg, color: estadoStyle.color, padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', width: 'fit-content' }}>
                          {inmueble.estado}
                        </span>
                        {inmueble.verificacion_estado && inmueble.verificacion_estado !== 'no_solicitado' && (
                          <span 
                            style={{ 
                              background: inmueble.verificacion_estado === 'verificado' ? '#dcfce7' : 
                                          inmueble.verificacion_estado === 'observado' ? '#fef3c7' : 
                                          inmueble.verificacion_estado === 'procesando' ? '#e0f2fe' : '#fee2e2',
                              color: inmueble.verificacion_estado === 'verificado' ? '#15803d' : 
                                     inmueble.verificacion_estado === 'observado' ? '#d97706' : 
                                     inmueble.verificacion_estado === 'procesando' ? '#0369a1' : '#dc2626',
                              padding: '6px 14px', 
                              borderRadius: '20px', 
                              fontSize: '0.8rem', 
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              width: 'fit-content'
                            }}
                          >
                            {inmueble.verificacion_estado === 'verificado' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                            {inmueble.verificacion_estado === 'verificado' ? '✓ Título Verificado con IA' : 
                             inmueble.verificacion_estado === 'observado' ? '⚠ Título Observado' : 
                             inmueble.verificacion_estado === 'procesando' ? '⌛ Procesando Verificación' : '✗ Título Inválido'}
                          </span>
                        )}
                        
                        {offerStyle && (
                          <span style={{ background: offerStyle.bg, color: offerStyle.color, border: offerStyle.border, padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', backdropFilter: 'blur(4px)', width: 'fit-content' }}>
                            {offerStyle.label}
                          </span>
                        )}
                      </div>

                      {inmueble.tipo_nombre && (
                        <span style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.9)', color: 'var(--color-text-secondary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                          {inmueble.tipo_nombre}
                        </span>
                      )}
                    </div>

                    {/* Galería de Miniaturas */}
                    {thumbMedia.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', width: '120px', minWidth: '120px', background: 'rgba(255,255,255,0.5)' }}>
                        {thumbMedia.map((media, idx) => (
                          <div
                            key={media.id}
                            onClick={() => setSelectedMediaIndex(idx + 1)}
                            style={{
                              width: '100%',
                              height: '100px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: selectedMediaIndex === idx + 1 ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.1)',
                              transition: 'all 0.2s',
                              background: '#f0f9ff'
                            }}
                          >
                            {media.tipo === 'video' ? (
                              <video src={media.archivo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <img src={media.archivo} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Pestaña: Recorrido 360° ─── */}
                {tabActiva === '360' && panoramas360.length > 0 && (
                  <div style={{ padding: '16px', background: 'var(--color-bg)' }}>
                    {accesoLoading ? (
                      <div style={{
                        padding: '24px',
                        textAlign: 'center',
                        background: 'var(--color-bg)',
                        borderRadius: '12px',
                        color: 'var(--color-text-secondary)'
                      }}>
                        Verificando permisos de acceso al recorrido 360°...
                      </div>
                    ) : acceso360.tieneAcceso ? (
                      <div>
                        {!acceso360.propietario && acceso360.fechaExpiracion && (
                          <RenderPaseBadge expiracion={acceso360.fechaExpiracion} />
                        )}
                        <Visor360 panoramas={panoramas360} tituloPropiedad={inmueble.titulo} accesoId={acceso360.accesoId} musica={musicaVR?.archivo || '/inspirar.mp3'} />
                      </div>
                    ) : (
                      <div style={{
                        position: 'relative',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        background: '#ffffff'
                      }}>
                        {panoramas360[0]?.archivo && (
                          <div style={{
                            position: 'absolute',
                            inset: '-20px',
                            backgroundImage: `url(${panoramas360[0].archivo})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(30px) brightness(1.22) saturate(1.15)',
                            zIndex: 1
                          }} />
                        )}
                        <div style={{
                          position: 'relative',
                          zIndex: 2,
                          background: 'rgba(255, 255, 255, 0.42)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          padding: '48px 24px',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '20px'
                        }}>
                          <div style={{
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1.5px dashed rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            padding: '18px',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.1)',
                          }}>
                            <Lock size={32} strokeWidth={2.2} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.03em', color: '#0f172a' }}>
                              Recorrido Virtual 360° Privado
                            </h3>
                            <p style={{ color: '#334155', fontSize: '0.92rem', fontWeight: 500, maxWidth: '460px', margin: '0 auto', lineHeight: '1.6' }}>
                              Este recorrido es exclusivo y protegido. Solicita un pase de acceso temporal interactivo en tiempo real al propietario para explorar el inmueble de manera inmersiva.
                            </p>
                          </div>
                          <button
                            onClick={handleSolicitarAcceso360}
                            style={{
                              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                              color: '#fff',
                              border: 'none',
                              padding: '14px 32px',
                              borderRadius: '30px',
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              cursor: 'pointer',
                              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <MessageCircle size={18} /> Solicitar Acceso Temporal 360°
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}




                <div style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>{inmueble.titulo}</h1>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
                        <MapPin size={18} /> {inmueble.direccion?.calle} - {inmueble.direccion?.zona && `${inmueble.direccion.zona}, `}{inmueble.direccion?.ciudad}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {activePub ? (
                          <>
                            Bs. {parseFloat(activePub.precio).toLocaleString()}
                            {activePub.tipo_oferta === 'alquiler' && <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)', marginLeft: '6px' }}>/ mes</span>}
                            {activePub.tipo_oferta === 'anticretico' && <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)', marginLeft: '6px' }}> (Anticrético)</span>}
                          </>
                        ) : (
                          'Sin oferta activa'
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px', background: 'var(--color-bg)', padding: '24px', borderRadius: '12px' }}>
                    {inmueble.habitaciones > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', color: 'var(--color-primary)' }}><Bed size={20} /></div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '2px' }}>Habitaciones</strong>
                          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>{inmueble.habitaciones}</span>
                        </div>
                      </div>
                    )}
                    {inmueble.banos > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', color: 'var(--color-primary)' }}><Bath size={20} /></div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '2px' }}>Baños</strong>
                          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>{inmueble.banos}</span>
                        </div>
                      </div>
                    )}
                    {inmueble.superficie > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', color: 'var(--color-primary)' }}><Maximize2 size={20} /></div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '2px' }}>Superficie</strong>
                          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>{inmueble.superficie} m²</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* El recorrido 360° y AR se muestran arriba en las pestañas principales */}


                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Descripción</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{inmueble.descripcion}</p>
                  </div>

                  {inmueble.publicaciones && inmueble.publicaciones.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Historial de Ofertas Comerciales</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {inmueble.publicaciones.map(pub => {
                          const pubStyle = offerColors[pub.tipo_oferta] || { label: pub.tipo_oferta, color: '#333', bg: '#eee' };
                          const isActiva = pub.estado === 'activa';
                          return (
                            <div key={pub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: isActiva ? 'rgba(16, 185, 129, 0.03)' : '#f8fafc', borderRadius: '12px', border: isActiva ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: pubStyle.bg, color: pubStyle.color, border: pubStyle.border }}>
                                  {pubStyle.label}
                                </span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                  Creada el {new Date(pub.creado).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                                  Bs. {parseFloat(pub.precio).toLocaleString()} {pub.tipo_oferta === 'alquiler' ? '/ mes' : pub.tipo_oferta === 'anticretico' ? '(Anticrético)' : ''}
                                </span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isActiva ? '#10b981' : '#64748b', textTransform: 'capitalize' }}>
                                  {pub.estado}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

            {inmueble.verificacion_estado && inmueble.verificacion_estado !== 'no_solicitado' && (
              <div style={{ 
                marginBottom: '32px',
                background: inmueble.verificacion_estado === 'verificado' ? '#f0fdf4' : 
                            inmueble.verificacion_estado === 'observado' ? '#fffbeb' : '#fef2f2',
                border: '1px solid ' + (
                            inmueble.verificacion_estado === 'verificado' ? '#bbf7d0' : 
                            inmueble.verificacion_estado === 'observado' ? '#fef08a' : '#fecaca'
                         ),
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '1.15rem', 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: inmueble.verificacion_estado === 'verificado' ? '#166534' : 
                         inmueble.verificacion_estado === 'observado' ? '#92400e' : '#991b1b'
                }}>
                  {inmueble.verificacion_estado === 'verificado' ? (
                    <>
                      <ShieldCheck size={24} style={{ color: '#16a34a' }} />
                      Título Verificado por IA (Garantía de Autenticidad)
                    </>
                  ) : inmueble.verificacion_estado === 'observado' ? (
                    <>
                      <ShieldAlert size={24} style={{ color: '#d97706' }} />
                      Título con Observaciones
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={24} style={{ color: '#dc2626' }} />
                      Documentación de Propiedad con Advertencias
                    </>
                  )}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.95rem', 
                  lineHeight: '1.6', 
                  color: inmueble.verificacion_estado === 'verificado' ? '#1e4620' : 
                         inmueble.verificacion_estado === 'observado' ? '#78350f' : '#7f1d1d'
                }}>
                  {inmueble.verificacion_resumen || 'La documentación legal de propiedad fue analizada automáticamente por nuestra Inteligencia Artificial.'}
                </p>
                {inmueble.verificacion_estado === 'verificado' && inmueble.verificacion_score && (
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: '#16a34a', 
                      color: '#fff', 
                      padding: '3px 8px', 
                      borderRadius: '12px', 
                      fontWeight: 700 
                    }}>
                      Confianza de Análisis: {inmueble.verificacion_score}/100
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 500 }}>
                      ✓ Datos de DDRR e identidad validados exitosamente.
                    </span>
                  </div>
                )}
              </div>
            )}

            {inmueble.gps && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Ubicación</h2>
                <div style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  {(() => {
                    const parts = inmueble.gps.split(',');
                    const lat = parseFloat(parts[0]);
                    const lng = parseFloat(parts[1]);
                    if (isNaN(lat) || isNaN(lng)) return <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>Ubicación inválida</div>;

                    return (
                      <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[lat, lng]} />
                      </MapContainer>
                    );
                  })()}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '24px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  if (!isAuthenticated) { navigate('/login'); return; }
                  setShowCitaModal(true);
                }}
                style={{
                  background: '#10b981', color: '#fff', border: 'none',
                  padding: '12px 32px', borderRadius: '10px', fontSize: '1rem',
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <Calendar size={18} /> Agendar Visita
              </button>
              <button onClick={handleContactar}
                style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={18} /> Contactar Dueño
              </button>
            </div>

            <ResenaSection inmuebleId={id} isAuthenticated={isAuthenticated} userId={user?.id} />
          </div>
        </>
      );
    })()}
  </div>
</div>

      {/* Modal de Confirmación para Admin */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>Confirmación de contacto</h3>
            <p style={{ color: '#64748b', marginBottom: '28px', lineHeight: '1.5' }}>¿Ya habló con el usuario sobre este inmueble?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmAdminContact}
                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', background: '#0ea5e9', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Check size={18} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMediaIndex !== null && (
        <div
          onClick={() => setSelectedMediaIndex(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.92)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px', cursor: 'zoom-out', backdropFilter: 'blur(5px)'
          }}
        >
          {allMedia.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedMediaIndex(prev => (prev > 0 ? prev - 1 : allMedia.length - 1)); }}
              style={{ position: 'absolute', left: '24px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', padding: '16px', borderRadius: '50%', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {allMedia[selectedMediaIndex]?.tipo === 'video' ? (
            <video
              src={allMedia[selectedMediaIndex].archivo} controls autoPlay
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={allMedia[selectedMediaIndex]?.archivo}
              alt="Fullscreen media"
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {allMedia.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedMediaIndex(prev => (prev < allMedia.length - 1 ? prev + 1 : 0)); }}
              style={{ position: 'absolute', right: '24px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', padding: '16px', borderRadius: '50%', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}
            >
              <ChevronRight size={32} />
            </button>
          )}

          <button
            onClick={() => setSelectedMediaIndex(null)}
            style={{ position: 'absolute', top: '24px', right: '32px', background: 'none', border: 'none', color: '#fff', fontSize: '3rem', cursor: 'pointer' }}
          ><X size={48} /></button>
        </div>
      )}
      {inmueble && (
        <ModalAgendarCita
          isOpen={showCitaModal}
          onClose={() => setShowCitaModal(false)}
          inmueble={inmueble}
          propietarioId={inmueble.propietario}
          onCitaAgendada={() => { }}
        />
      )}
    </div>
  );
};

export default PropiedadDetalle;
