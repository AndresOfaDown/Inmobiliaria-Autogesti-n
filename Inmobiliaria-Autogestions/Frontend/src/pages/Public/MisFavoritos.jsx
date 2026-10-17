import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

import './Propiedades.css';

const MisFavoritos = () => {
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    api.get('/inmuebles/favoritos/')
      .then(res => {
        const favs = res.data.results || res.data;
        setInmuebles(favs.map(f => ({ ...f.inmueble_data, is_favorito: true })));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const toggleFavorite = async (inmId, e) => {
    e.preventDefault();
    try {
      await api.post('/inmuebles/favoritos/toggle/', { inmueble: inmId });
      setInmuebles(prev => prev.filter(inm => inm.id !== inmId));
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const estadoColors = {
    disponible: { bg: '#dcfce7', color: '#15803d' },
    ocupado: { bg: '#fee2e2', color: '#dc2626' },
    mantenimiento: { bg: '#fef3c7', color: '#d97706' },
    reservado: { bg: '#dbeafe', color: '#2563eb' },
  };

  return (
    <div className="propiedades-page" style={{ paddingTop: '20px' }}>

      <div className="propiedades-content">
        {loading ? (
          <div className="propiedades-loading">Cargando tus favoritos...</div>
        ) : (
          <div className="propiedades-grid">
            {inmuebles.map(inm => {
              const estadoStyle = estadoColors[inm.estado] || estadoColors.disponible;
              return (
                <div key={inm.id} className="propiedad-card">
                  <div className="propiedad-card__image">
                    {inm.imagen_principal ? (
                      <img src={inm.imagen_principal} alt={inm.titulo} />
                    ) : (
                      <div className="propiedad-card__placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      </div>
                    )}
                    <span className="propiedad-card__badge" style={{ background: estadoStyle.bg, color: estadoStyle.color }}>
                      {inm.estado}
                    </span>
                    <button 
                      className="propiedad-card__fav-btn propiedad-card__fav-btn--active"
                      onClick={(e) => toggleFavorite(inm.id, e)}
                    >
                      <svg width="20" height="20" fill="currentColor" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="propiedad-card__body">
                    <h3 className="propiedad-card__title">{inm.titulo}</h3>
                    <p className="propiedad-card__location">{inm.ciudad}{inm.zona ? `, ${inm.zona}` : ''}</p>
                    <div className="propiedad-card__attrs">
                      {inm.habitaciones > 0 && <span>{inm.habitaciones} hab.</span>}
                      {inm.banos > 0 && <span>{inm.banos} baños</span>}
                    </div>
                    <div className="propiedad-card__footer">
                      <span className="propiedad-card__price">Bs. {parseFloat(inm.precio).toLocaleString()}</span>
                      <Link to={`/propiedades/${inm.id}`} className="propiedad-card__cta">Ver detalles</Link>
                    </div>
                  </div>
                </div>
              );
            })}
            {inmuebles.length === 0 && (
              <div className="propiedades-empty">
                <p>Aún no tienes propiedades en tus favoritos.</p>
                <Link to="/propiedades" className="propiedad-card__cta" style={{ display: 'inline-block', marginTop: '16px' }}>Ver Propiedades</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisFavoritos;
