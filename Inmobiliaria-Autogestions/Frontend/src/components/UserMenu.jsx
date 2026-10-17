import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import { 
  ChevronDown, Search, Building2, Calendar, Heart, 
  FileText, CreditCard, TrendingUp, MessageSquare, Bell, User 
} from 'lucide-react';
import './UserMenu.css';

const Badge = ({ count }) => {
  if (!count) return null;
  return (
    <span style={{
      position: 'absolute', top: '50%', right: '12px',
      transform: 'translateY(-50%)',
      background: '#ef4444', color: '#fff', fontSize: '0.65rem',
      fontWeight: 700, borderRadius: '10px', padding: '1px 6px',
      minWidth: '16px', textAlign: 'center', lineHeight: '14px'
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

const UserMenu = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [badges, setBadges] = useState({ notificaciones: 0, mensajes: 0 });
  const [activeDropdown, setActiveDropdown] = useState(null); // 'propiedades' | 'finanzas' | 'alertas' | null

  // Referencias para detectar clicks externos y cerrar los dropdowns
  const propRef = useRef(null);
  const finRef = useRef(null);
  const msgRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchBadges = () => {
      api.get('/usuarios/lista/badges/')
        .then(res => setBadges(res.data))
        .catch(() => {});
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (propRef.current && !propRef.current.contains(event.target)) &&
        (finRef.current && !finRef.current.contains(event.target)) &&
        (msgRef.current && !msgRef.current.contains(event.target))
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const currentPath = location.pathname;

  const getStyle = (path) => {
    const isActive = currentPath.startsWith(path) && path !== '/' || currentPath === path;
    if (isActive) {
      return { 
        color: 'var(--color-primary)', 
        background: 'rgba(14,165,233,0.08)',
        textDecoration: 'none', 
        fontWeight: 600 
      };
    }
    return { 
      color: 'var(--color-text-secondary)', 
      textDecoration: 'none', 
      fontWeight: 500 
    };
  };

  const isGroupActive = (paths) => {
    return paths.some(path => currentPath.startsWith(path));
  };

  const toggleDropdown = (name) => {
    setActiveDropdown(prev => (prev === name ? null : name));
  };

  const closeAll = () => {
    setActiveDropdown(null);
  };

  return (
    <div className="user-menu-wrapper" id="packaged-user-menu">
      <nav className="hero-nav">
        
        {/* 1. Catálogo */}
        <Link to="/propiedades" className="hero-nav__link" style={getStyle('/propiedades')}>
          <Search size={16} />
          <span>Catálogo</span>
        </Link>

        {/* 2. Grupo: Propiedades e Interacción */}
        <div className="hero-nav__dropdown" ref={propRef}>
          <button 
            className={`hero-nav__dropdown-btn ${isGroupActive(['/mis-inmuebles', '/mi-agenda', '/favoritos']) ? 'active' : ''}`}
            onClick={() => toggleDropdown('propiedades')}
          >
            <Building2 size={16} />
            <span>Propiedades</span>
            <ChevronDown size={14} className={`arrow ${activeDropdown === 'propiedades' ? 'open' : ''}`} />
          </button>
          {activeDropdown === 'propiedades' && (
            <div className="hero-nav__dropdown-menu">
              <Link to="/mis-inmuebles" onClick={closeAll} className="dropdown-item">
                <Building2 size={15} />
                <span>Mis Inmuebles</span>
              </Link>
              <Link to="/mi-agenda" onClick={closeAll} className="dropdown-item">
                <Calendar size={15} />
                <span>Mi Agenda</span>
              </Link>
              <Link to="/favoritos" onClick={closeAll} className="dropdown-item">
                <Heart size={15} />
                <span>Favoritos</span>
              </Link>
            </div>
          )}
        </div>

        {/* 3. Grupo: Contratos y Finanzas */}
        <div className="hero-nav__dropdown" ref={finRef}>
          <button 
            className={`hero-nav__dropdown-btn ${isGroupActive(['/mis-contratos', '/mis-pagos', '/mis-finanzas']) ? 'active' : ''}`}
            onClick={() => toggleDropdown('finanzas')}
          >
            <FileText size={16} />
            <span>Trámites y Finanzas</span>
            <ChevronDown size={14} className={`arrow ${activeDropdown === 'finanzas' ? 'open' : ''}`} />
          </button>
          {activeDropdown === 'finanzas' && (
            <div className="hero-nav__dropdown-menu">
              <Link to="/mis-contratos" onClick={closeAll} className="dropdown-item">
                <FileText size={15} />
                <span>Mis Contratos</span>
              </Link>
              <Link to="/mis-pagos" onClick={closeAll} className="dropdown-item">
                <CreditCard size={15} />
                <span>Mis Pagos</span>
              </Link>
              <Link to="/mis-finanzas" onClick={closeAll} className="dropdown-item">
                <TrendingUp size={15} />
                <span>Mis Finanzas</span>
              </Link>
            </div>
          )}
        </div>

        {/* 4. Grupo: Mensajería y Alertas */}
        <div className="hero-nav__dropdown" ref={msgRef}>
          <button 
            className={`hero-nav__dropdown-btn ${isGroupActive(['/mensajes', '/notificaciones']) ? 'active' : ''}`}
            onClick={() => toggleDropdown('alertas')}
            style={{ position: 'relative' }}
          >
            <MessageSquare size={16} />
            <span>Mensajería</span>
            {(badges.notificaciones + badges.mensajes) > 0 && (
              <span className="group-badge-dot" />
            )}
            <ChevronDown size={14} className={`arrow ${activeDropdown === 'alertas' ? 'open' : ''}`} />
          </button>
          {activeDropdown === 'alertas' && (
            <div className="hero-nav__dropdown-menu">
              <Link to="/notificaciones" onClick={closeAll} className="dropdown-item" style={{ position: 'relative', paddingRight: badges.notificaciones > 0 ? '42px' : '14px' }}>
                <Bell size={15} />
                <span>Notificaciones</span>
                <Badge count={badges.notificaciones} />
              </Link>
              <Link to="/mensajes" onClick={closeAll} className="dropdown-item" style={{ position: 'relative', paddingRight: badges.mensajes > 0 ? '42px' : '14px' }}>
                <MessageSquare size={15} />
                <span>Mensajes</span>
                <Badge count={badges.mensajes} />
              </Link>
            </div>
          )}
        </div>

        {/* 5. Cuenta / Perfil */}
        <Link to="/perfil" className="hero-nav__link" style={getStyle('/perfil')}>
          <User size={16} />
          <span>Mi Perfil</span>
        </Link>

      </nav>
    </div>
  );
};

export default UserMenu;
