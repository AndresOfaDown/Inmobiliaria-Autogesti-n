import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Home, FileText, Banknote, Archive, Calendar, Bell,
  LineChart
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import './DashboardAdmin.css';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    usuarios: 0, inmuebles: 0, contratos: 0, pagos: 0,
    categorias: 0, notificaciones: 0, agenda: 0, ingresos: 0
  });
  const [recentInmuebles, setRecentInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuarios, inmuebles, contratos, pagos, categorias, notificaciones, agenda, reportes] = await Promise.all([
          api.get('/usuarios/lista/').then(r => r.data).catch(() => []),
          api.get('/inmuebles/lista/').then(r => r.data).catch(() => []),
          api.get('/inmuebles/contratos/').then(r => r.data).catch(() => []),
          api.get('/pagos/lista/').then(r => r.data).catch(() => []),
          api.get('/inmuebles/tipos/').then(r => r.data).catch(() => []),
          api.get('/usuarios/notificaciones/').then(r => r.data).catch(() => []),
          api.get('/usuarios/agenda/').then(r => r.data).catch(() => []),
          api.get('/pagos/reportes/').then(r => r.data).catch(() => ({})),
        ]);

        setStats({
          usuarios: Array.isArray(usuarios) ? usuarios.length : usuarios?.count || 0,
          inmuebles: Array.isArray(inmuebles) ? inmuebles.length : inmuebles?.count || 0,
          contratos: Array.isArray(contratos) ? contratos.length : contratos?.count || 0,
          pagos: Array.isArray(pagos) ? pagos.length : pagos?.count || 0,
          categorias: Array.isArray(categorias) ? categorias.length : categorias?.count || 0,
          notificaciones: Array.isArray(notificaciones) ? notificaciones.length : notificaciones?.count || 0,
          agenda: Array.isArray(agenda) ? agenda.length : agenda?.count || 0,
          ingresos: reportes?.kpis?.total_ingreso_comisiones || 0,
        });

        setRecentInmuebles(Array.isArray(inmuebles) ? inmuebles.slice(0, 5) : []);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cards = [
    { icon: <Users size={24} />, label: 'Usuarios', value: stats.usuarios, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)', link: '/panel/usuarios' },
    { icon: <Home size={24} />, label: 'Inmuebles', value: stats.inmuebles, color: '#0284c7', bg: 'rgba(2, 132, 199, 0.1)', link: '/panel/inmuebles' },
    { icon: <FileText size={24} />, label: 'Contratos', value: stats.contratos, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)', link: '/panel/contratos' },
    { icon: <Banknote size={24} />, label: 'Pagos', value: stats.pagos, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', link: '/panel/pagos' },
    { icon: <LineChart size={24} />, label: 'Finanzas', value: `Bs. ${stats.ingresos.toLocaleString()}`, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', link: '/panel/finanzas' },
    { icon: <Archive size={24} />, label: 'Categorías', value: stats.categorias, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', link: '/panel/categorias' },
    { icon: <Calendar size={24} />, label: 'Agenda', value: stats.agenda, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', link: '/panel/agenda' },
    { icon: <Bell size={24} />, label: 'Notificaciones', value: stats.notificaciones, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', link: '/panel/notificaciones' },
  ];

  const getEstadoClass = (estado) => {
    if (estado === 'disponible') return 'tag tag-success';
    if (estado === 'ocupado') return 'tag tag-danger';
    return 'tag tag-warning';
  };

  if (loading) return <p className="text-muted" style={{ textAlign: 'center', padding: '60px' }}>Cargando dashboard...</p>;

  return (
    <div className="dashboard-admin">
      <h1 className="dashboard-greeting">Hola, {user?.first_name} {user?.last_name}</h1>
      <p className="dashboard-subtitle">
        Rol: <strong>{user?.rol_nombre || 'Administrador'}</strong> — Resumen de tu panel de gestión.
      </p>

      {/* Tarjetas de estadísticas */}
      <div className="dashboard-grid">
        {cards.map(card => (
          <Link
            key={card.label}
            to={card.link}
            className="dashboard-card"
            style={{
              '--card-bg': card.bg,
              '--card-color': card.color
            }}
          >
            <div className="dashboard-card-icon">{card.icon}</div>
            <p className="dashboard-card-label">{card.label}</p>
            <p className="dashboard-card-value">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Inmuebles recientes */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Últimos Inmuebles Registrados</h2>
        {recentInmuebles.length > 0 ? (
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Ciudad</th>
                  <th>Precio</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentInmuebles.map(inm => (
                  <tr key={inm.id}>
                    <td style={{ fontWeight: 600 }}>{inm.titulo}</td>
                    <td>
                      <span className="tag tag-success">{inm.tipo_nombre}</span>
                    </td>
                    <td>{inm.ciudad}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      Bs. {parseFloat(inm.precio).toLocaleString()}
                    </td>
                    <td>
                      <span className={getEstadoClass(inm.estado)}>{inm.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>Sin inmuebles recientes.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;
