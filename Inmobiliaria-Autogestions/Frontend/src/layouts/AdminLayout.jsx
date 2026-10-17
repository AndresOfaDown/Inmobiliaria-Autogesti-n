import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Home, Archive, FileText, Banknote,
  CreditCard, History, Calendar, Bell, Heart, ChevronRight, ChevronLeft, LineChart, ShieldCheck,
  Sun, Moon, Monitor
} from 'lucide-react';
import Navbar from '../components/Navbar';
import useStore from '../store/store';
import './AdminLayout.css';

/**
 * Layout del Panel Administrativo.
 * SOLO accesible por administradores. Los usuarios nunca llegan aquí.
 */
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  const handleThemeCycle = () => {
    let nextTheme = 'light';
    if (theme === 'system') nextTheme = 'light';
    else if (theme === 'light') nextTheme = 'dark';
    else if (theme === 'dark') nextTheme = 'system';
    setTheme(nextTheme);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Ejecutar al cargar
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuGroups = [
    {
      title: 'General',
      items: [
        { to: '/panel/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { to: '/panel/blockchain', label: 'Blockchain', icon: <ShieldCheck size={20} /> }
      ]
    },
    {
      title: 'Usuarios',
      items: [
        { to: '/panel/usuarios', label: 'Usuarios', icon: <Users size={20} /> },
        { to: '/panel/notificaciones', label: 'Notificaciones', icon: <Bell size={20} /> },
        { to: '/panel/favoritos', label: 'Favoritos', icon: <Heart size={20} /> }
      ]
    },
    {
      title: 'Inmuebles',
      items: [
        { to: '/panel/inmuebles', label: 'Inmuebles', icon: <Home size={20} /> },
        { to: '/panel/categorias', label: 'Categorías', icon: <Archive size={20} /> },
        { to: '/panel/agenda', label: 'Agenda de Visitas', icon: <Calendar size={20} /> }
      ]
    },
    {
      title: 'Contratos',
      items: [
        { to: '/panel/contratos', label: 'Contratos', icon: <FileText size={20} /> },
        { to: '/panel/tipo-contrato', label: 'Tipos de Contrato', icon: <CreditCard size={20} /> }
      ]
    },
    {
      title: 'Finanzas',
      items: [
        { to: '/panel/finanzas', label: 'Finanzas', icon: <LineChart size={20} /> },
        { to: '/panel/pagos', label: 'Control de Pagos', icon: <Banknote size={20} /> },
        { to: '/panel/tipo-pagos', label: 'Tipos de Pago', icon: <CreditCard size={20} /> },
        { to: '/panel/historial-pagos', label: 'Historial', icon: <History size={20} /> }
      ]
    }
  ];

  return (
    <div className={`admin-layout ${collapsed ? 'admin-layout--collapsed' : ''}`}>
      {/* Overlay para móvil */}
      {mobileSidebarOpen && (
        <div
          className="admin-layout__mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <aside className={`admin-layout__sidebar ${mobileSidebarOpen ? 'admin-layout__sidebar--mobile-open' : ''}`}>
        <div className="admin-layout__sidebar-header">
          <div className="admin-layout__brand">
            <Home className="admin-layout__brand-icon" size={collapsed ? 24 : 20} />
            {!collapsed && <h3>Panel Admin</h3>}
          </div>
          <button
            className="admin-layout__toggle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="admin-layout__nav">
          {menuGroups.map((group, groupIdx) => (
            <div key={group.title} className="admin-layout__group">
              {groupIdx > 0 && <div className="admin-layout__group-divider" />}
              {!collapsed && (
                <div className="admin-layout__group-title">
                  {group.title}
                </div>
              )}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) => `admin-layout__link ${isActive ? 'active' : ''}`}
                  title={item.label}
                >
                  <span className="admin-layout__link-icon">{item.icon}</span>
                  {(!collapsed || mobileSidebarOpen) && <span className="admin-layout__link-text">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        
        <div className="admin-layout__sidebar-footer">
          <button
            className="admin-layout__theme-btn"
            onClick={handleThemeCycle}
            title={`Tema: ${theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Oscuro'}`}
          >
            {theme === 'system' && <Monitor size={18} />}
            {theme === 'light' && <Sun size={18} />}
            {theme === 'dark' && <Moon size={18} />}
            {(!collapsed || mobileSidebarOpen) && (
              <span>
                Tema: {theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Oscuro'}
              </span>
            )}
          </button>
        </div>
      </aside>
      <div className="admin-layout__main">
        <Navbar
          isSidebarOpen={mobileSidebarOpen}
          onSidebarToggle={() => setMobileSidebarOpen(prev => !prev)}
        />
        <div className="admin-layout__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;