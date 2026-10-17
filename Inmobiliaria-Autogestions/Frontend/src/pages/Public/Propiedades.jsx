import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import inmuebleService from '../../services/inmuebleService';
import useAuth from '../../hooks/useAuth';
import { Search, SlidersHorizontal, Trash2, Filter, X } from 'lucide-react';
import './Propiedades.css';

const Propiedades = () => {
  const [inmuebles, setInmuebles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroCiudad, setFiltroCiudad] = useState('');
  const [filtroPrecioMax, setFiltroPrecioMax] = useState('');
  const [filtroHabitaciones, setFiltroHabitaciones] = useState('');
  const [filtroBanos, setFiltroBanos] = useState('');
  const [filtroGaraje, setFiltroGaraje] = useState(false);
  const [filtroTipoOferta, setFiltroTipoOferta] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const activeFiltersCount =
    (filtroCategoria ? 1 : 0) +
    (filtroCiudad ? 1 : 0) +
    (filtroPrecioMax ? 1 : 0) +
    (filtroHabitaciones ? 1 : 0) +
    (filtroBanos ? 1 : 0) +
    (filtroGaraje ? 1 : 0) +
    (filtroTipoOferta ? 1 : 0);

  const clearFilters = () => {
    setFiltroCategoria('');
    setFiltroCiudad('');
    setFiltroPrecioMax('');
    setFiltroHabitaciones('');
    setFiltroBanos('');
    setFiltroGaraje(false);
    setFiltroTipoOferta('');
    setSearchTerm('');
  };

  useEffect(() => {
    // Cargar solo los tipos la primera vez
    api.get('/inmuebles/tipos/')
      .then(res => setCategorias(res.data.results || res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filtroCategoria) filters.tipo = categorias.find(c => c.nombre === filtroCategoria)?.id || '';
      if (filtroCiudad) filters.ciudad = filtroCiudad;
      if (filtroPrecioMax) filters.precio_max = filtroPrecioMax;
      if (filtroHabitaciones) filters.habitaciones_min = filtroHabitaciones;
      if (filtroBanos) filters.banos_min = filtroBanos;
      if (filtroGaraje) filters.garaje = true;
      if (filtroTipoOferta) filters.tipo_oferta = filtroTipoOferta;

      inmuebleService.listarInmuebles(filters)
        .then(data => {
          setInmuebles(data.results || data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filtroCategoria, filtroCiudad, filtroPrecioMax, filtroHabitaciones, filtroBanos, filtroGaraje, filtroTipoOferta, categorias]);

  const toggleFavorite = async (inmId, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post('/inmuebles/favoritos/toggle/', { inmueble: inmId });
      setInmuebles(prev => prev.map(inm =>
        inm.id === inmId ? { ...inm, is_favorito: res.data.is_favorito } : inm
      ));
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const estadoColors = {
    disponible: { bg: '#10b981', color: '#ffffff', border: '1px solid #10b981' },
    ocupado: { bg: '#ef4444', color: '#ffffff', border: '1px solid #ef4444' },
    mantenimiento: { bg: '#f59e0b', color: '#ffffff', border: '1px solid #f59e0b' },
    reservado: { bg: '#3b82f6', color: '#ffffff', border: '1px solid #3b82f6' },
  };

  const offerColors = {
    alquiler: { bg: '#0284c7', color: '#ffffff', label: 'Alquiler', border: '1px solid #0284c7' },
    venta: { bg: '#6366f1', color: '#ffffff', label: 'Venta', border: '1px solid #6366f1' },
    anticretico: { bg: '#ec4899', color: '#ffffff', label: 'Anticrético', border: '1px solid #ec4899' },
  };

  return (
    <div className="propiedades-page">
      <div className="propiedades-content">

        <div className="propiedades-filters-card">
          <div className="propiedades-filters__search-row">
            <div className="propiedades-filters__search-wrapper">
              <Search className="propiedades-filters__search-icon" size={20} />
              <input
                type="text"
                placeholder="Buscar por zona, ciudad o palabras clave (Ej: Equipetrol, Sopocachi...)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="propiedades-filters__search-input"
              />
            </div>

            <div className="propiedades-filters__actions">
              <button
                type="button"
                className={`propiedades-filters__toggle-btn ${showAdvanced ? 'propiedades-filters__toggle-btn--active' : ''}`}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <SlidersHorizontal size={18} />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="propiedades-filters__badge">{activeFiltersCount}</span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  className="propiedades-filters__clear-btn"
                  onClick={clearFilters}
                  title="Limpiar todos los filtros"
                >
                  <Trash2 size={16} />
                  <span className="desktop-only">Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {/* ADVANCED COLLAPSIBLE FILTERS PANEL */}
          {showAdvanced && (
            <div className="propiedades-filters__advanced">
              <div className="propiedades-filters__grid">
                <div className="propiedades-filters__group">
                  <label className="propiedades-filters__label">Categoría</label>
                  <select
                    value={filtroCategoria}
                    onChange={e => setFiltroCategoria(e.target.value)}
                    className="propiedades-filters__select"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="propiedades-filters__group">
                  <label className="propiedades-filters__label">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej: Santa Cruz, La Paz..."
                    value={filtroCiudad}
                    onChange={e => setFiltroCiudad(e.target.value)}
                    className="propiedades-filters__input"
                  />
                </div>

                <div className="propiedades-filters__group">
                  <label className="propiedades-filters__label">Precio Máximo (Bs.)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Sin límite"
                    value={filtroPrecioMax}
                    onChange={e => {
                      const val = e.target.value.replace(/^-/, '');
                      if (val === '' || Number(val) >= 0) setFiltroPrecioMax(val);
                    }}
                    className="propiedades-filters__input"
                  />
                </div>

                <div className="propiedades-filters__group">
                  <label className="propiedades-filters__label">Habitaciones</label>
                  <select
                    value={filtroHabitaciones}
                    onChange={e => setFiltroHabitaciones(e.target.value)}
                    className="propiedades-filters__select"
                  >
                    <option value="">Cualquiera</option>
                    <option value="1">1 o más</option>
                    <option value="2">2 o más</option>
                    <option value="3">3 o más</option>
                    <option value="4">4 o más</option>
                  </select>
                </div>

                <div className="propiedades-filters__group">
                  <label className="propiedades-filters__label">Baños</label>
                  <select
                    value={filtroBanos}
                    onChange={e => setFiltroBanos(e.target.value)}
                    className="propiedades-filters__select"
                  >
                    <option value="">Cualquiera</option>
                    <option value="1">1 o más</option>
                    <option value="2">2 o más</option>
                    <option value="3">3 o más</option>
                  </select>
                </div>

                <div className="propiedades-filters__group">
                  <label className="propiedades-filters__label">Tipo de Oferta</label>
                  <select
                    value={filtroTipoOferta}
                    onChange={e => setFiltroTipoOferta(e.target.value)}
                    className="propiedades-filters__select"
                  >
                    <option value="">Cualquier oferta</option>
                    <option value="venta">Venta</option>
                    <option value="alquiler">Alquiler</option>
                    <option value="anticretico">Anticrético</option>
                  </select>
                </div>

                <div className="propiedades-filters__group propiedades-filters__group--checkbox">
                  <label className="propiedades-filters__checkbox-label">
                    <input
                      type="checkbox"
                      checked={filtroGaraje}
                      onChange={e => setFiltroGaraje(e.target.checked)}
                      className="propiedades-filters__checkbox"
                    />
                    <span>¿Requiere Garaje?</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="propiedades-filters__footer">
            <span className="propiedades-filters__count-pill">
              {inmuebles.length} {inmuebles.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
            </span>
          </div>

        </div>

        {loading ? (
          <div className="propiedades-loading">Cargando propiedades...</div>
        ) : (
          <div className="propiedades-grid">
            {inmuebles.map(inm => {
              const estadoStyle = estadoColors[inm.estado] || estadoColors.disponible;
              const offerStyle = offerColors[inm.tipo_oferta];
              const ciudad = inm.direccion?.ciudad || 'N/A';
              const zona = inm.direccion?.zona || '';
              return (
                <div key={inm.id} className="propiedad-card">
                  <div className="propiedad-card__image">
                    {inm.imagen_principal ? (
                      <img src={inm.imagen_principal} alt={inm.titulo} />
                    ) : (
                      <div className="propiedad-card__placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
                      <span className="propiedad-card__badge" style={{ background: estadoStyle.bg, color: estadoStyle.color, position: 'static' }}>
                        {inm.estado}
                      </span>
                      {inm.verificacion_estado && inm.verificacion_estado !== 'no_solicitado' && (
                        <span
                          className="propiedad-card__badge"
                          style={{
                            background: inm.verificacion_estado === 'verificado' ? '#dcfce7' :
                              inm.verificacion_estado === 'observado' ? '#fef3c7' :
                                inm.verificacion_estado === 'procesando' ? '#e0f2fe' : '#fee2e2',
                            color: inm.verificacion_estado === 'verificado' ? '#15803d' :
                              inm.verificacion_estado === 'observado' ? '#d97706' :
                                inm.verificacion_estado === 'procesando' ? '#0369a1' : '#dc2626',
                            position: 'static',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700
                          }}
                          title={
                            inm.verificacion_estado === 'verificado' ? 'Título de propiedad verificado por IA' :
                              inm.verificacion_estado === 'observado' ? 'Título observado (advertencias detectadas)' :
                                inm.verificacion_estado === 'procesando' ? 'Verificación en proceso por la IA' :
                                  'Título de propiedad inválido o no reconocido'
                          }
                        >
                          {inm.verificacion_estado === 'verificado' ? '✓ Título Ok' :
                            inm.verificacion_estado === 'observado' ? '⚠ Obs. Título' :
                              inm.verificacion_estado === 'procesando' ? '⌛ Procesando' : '✗ Inválido'}
                        </span>
                      )}
                      {offerStyle && (
                        <span className="propiedad-card__offer-badge" style={{ background: offerStyle.bg, color: offerStyle.color, border: offerStyle.border, position: 'static' }}>
                          {offerStyle.label}
                        </span>
                      )}
                    </div>
                    {inm.tipo_nombre && (
                      <span className="propiedad-card__category">{inm.tipo_nombre}</span>
                    )}
                    <button
                      className={`propiedad-card__fav-btn ${inm.is_favorito ? 'propiedad-card__fav-btn--active' : ''}`}
                      onClick={(e) => toggleFavorite(inm.id, e)}
                    >
                      <svg width="20" height="20" fill={inm.is_favorito ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  <div className="propiedad-card__body">
                    <h3 className="propiedad-card__title">{inm.titulo}</h3>
                    <p className="propiedad-card__location">{ciudad}{zona ? `, ${zona}` : ''}</p>
                    <div className="propiedad-card__attrs">
                      {inm.habitaciones > 0 && <span>{inm.habitaciones} hab.</span>}
                      {inm.banos > 0 && <span>{inm.banos} baños</span>}
                    </div>
                    <div className="propiedad-card__footer">
                      <span className="propiedad-card__price">
                        {inm.precio ? (
                          <>
                            Bs. {parseFloat(inm.precio).toLocaleString()}
                            {inm.tipo_oferta === 'alquiler' && <small style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text-muted)', marginLeft: '4px' }}>/ mes</small>}
                            {inm.tipo_oferta === 'anticretico' && <small style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text-muted)', marginLeft: '4px' }}> (Anticrético)</small>}
                          </>
                        ) : (
                          'Sin oferta activa'
                        )}
                      </span>
                      <Link to={`/propiedades/${inm.id}`} className="propiedad-card__cta">Ver detalles</Link>
                    </div>
                  </div>
                </div>
              );
            })}
            {inmuebles.length === 0 && (
              <div className="propiedades-empty">
                <p>No se encontraron propiedades con esos filtros.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Propiedades;
