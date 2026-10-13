import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import {
  Building2,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  Search,
  LogOut,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  RefreshCw,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [usuarios, setUsuarios] = useState([]);
  const [metricas, setMetricas] = useState({
    total_usuarios: 0,
    usuarios_activos: 0,
    total_admins: 0,
    total_clientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchAdminData = async (query = '') => {
    setLoading(true);
    try {
      const response = await api.get('/auth/admin/users/', {
        params: query ? { q: query } : {},
      });
      setMetricas(response.data.metricas);
      setUsuarios(response.data.usuarios);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData(searchQuery);
  };

  const handleToggleStatus = async (userId) => {
    setTogglingId(userId);
    try {
      const res = await api.patch(`/auth/admin/users/${userId}/toggle-status/`);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: res.data.is_active } : u))
      );
      // Actualizar conteo
      setMetricas((prev) => ({
        ...prev,
        usuarios_activos: res.data.is_active
          ? prev.usuarios_activos + 1
          : prev.usuarios_activos - 1,
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'No fue posible cambiar el estado del usuario.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Inter']">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit']">SAIPI</h1>
              <span className="text-xs bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                ADMINISTRADOR
              </span>
            </div>
            <p className="text-xs text-slate-500">Panel de Control & Supervisión de la Plataforma</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.first_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block text-left pr-1">
              <p className="text-xs text-slate-900 font-bold leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-50/60 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                  Panel de Administración General
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                  Supervisa los usuarios registrados, controla el estado de las cuentas y monitorea la actividad general de la plataforma inmobiliaria SAIPI.
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchAdminData(searchQuery)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-xs self-start md:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Actualizar Datos</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Usuarios</p>
              <p className="text-2xl font-bold text-slate-900 font-['Outfit']">{metricas.total_usuarios}</p>
              <p className="text-[11px] text-slate-500 font-medium">Registrados en la base</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cuentas Activas</p>
              <p className="text-2xl font-bold text-slate-900 font-['Outfit']">{metricas.usuarios_activos}</p>
              <p className="text-[11px] text-emerald-600 font-medium">Habilitados para operar</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuarios Inmobiliarios</p>
              <p className="text-2xl font-bold text-slate-900 font-['Outfit']">{metricas.total_clientes}</p>
              <p className="text-[11px] text-slate-500 font-medium">Clientes (Dueños/Inquilinos)</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Administradores</p>
              <p className="text-2xl font-bold text-slate-900 font-['Outfit']">{metricas.total_admins}</p>
              <p className="text-[11px] text-slate-500 font-medium">Gestión del sistema</p>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Gestión de Usuarios Registrados
              </h3>
              <p className="text-xs text-slate-500">
                Lista oficial de usuarios en la plataforma con datos de contacto, rol y estado.
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo, CI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Cédula / CI</th>
                  <th className="py-3 px-4">Fecha Nac.</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      {loading ? 'Cargando usuarios...' : 'No se encontraron usuarios que coincidan con la búsqueda.'}
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-100">
                            {u.first_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.full_name || `${u.first_name} ${u.last_name}`}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                            <Users className="w-3 h-3" /> Usuario
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-slate-800 font-medium">{u.telefono || 'Sin teléfono'}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{u.documento_identidad || '—'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-700">{u.fecha_nacimiento || '—'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            <XCircle className="w-3 h-3" /> Inactivo
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {u.id !== user?.id && (
                          <button
                            type="button"
                            disabled={togglingId === u.id}
                            onClick={() => handleToggleStatus(u.id)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                              u.is_active
                                ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200 hover:border-rose-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {togglingId === u.id
                              ? 'Cambiando...'
                              : u.is_active
                              ? 'Desactivar'
                              : 'Activar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
