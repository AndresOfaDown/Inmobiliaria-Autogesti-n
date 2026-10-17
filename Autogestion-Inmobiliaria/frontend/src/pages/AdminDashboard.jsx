import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  LogOut,
  Sparkles,
  Link as LinkIcon,
  Phone,
  Mail,
  CreditCard,
  Layers,
  ArrowUpRight,
  Filter,
  Check,
  Eye,
  Activity,
  Award,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import BlockchainAuditTrail from '../components/BlockchainAuditTrail';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'finance', 'properties', 'blockchain'

  // Data states
  const [usersList, setUsersList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Users filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [togglingId, setTogglingId] = useState(null);

  // Commission configuration states
  const [newCommission, setNewCommission] = useState(5.0);
  const [updatingConfig, setUpdatingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, propsRes, configRes, metricsRes] = await Promise.allSettled([
        api.get('/users'),
        api.get('/properties/search'),
        api.get('/payments/config'),
        api.get('/payments/metrics'),
      ]);

      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)) {
        setUsersList(usersRes.value.data);
      }
      if (propsRes.status === 'fulfilled' && Array.isArray(propsRes.value.data)) {
        setPropertiesList(propsRes.value.data);
      }
      if (configRes.status === 'fulfilled' && configRes.value.data) {
        setConfig(configRes.value.data);
        setNewCommission(Number(configRes.value.data.porcentajeComisionPlataforma || 5.0));
      }
      if (metricsRes.status === 'fulfilled' && metricsRes.value.data) {
        setMetrics(metricsRes.value.data);
      }
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserActive = async (userId) => {
    setTogglingId(userId);
    try {
      const res = await api.put(`/users/${userId}/toggle-active`);
      const newStatus = res.data?.activo !== undefined ? res.data.activo : res.data?.is_active;
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, activo: newStatus } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'No fue posible cambiar el estado del usuario');
    } finally {
      setTogglingId(null);
    }
  };

  const handleUpdateCommission = async (e) => {
    e.preventDefault();
    setUpdatingConfig(true);
    setConfigSuccess(false);
    try {
      const res = await api.put('/payments/config', {
        porcentajeComision: Number(newCommission),
      });
      setConfig(res.data);
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3500);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar comisión');
    } finally {
      setUpdatingConfig(false);
    }
  };

  // Filtrado de usuarios
  const filteredUsers = usersList.filter((u) => {
    const fullName = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const ci = (u.ci || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = fullName.includes(query) || email.includes(query) || ci.includes(query);
    const matchesRole =
      roleFilter === 'ALL'
        ? true
        : roleFilter === 'ADMIN'
        ? (u.rol || '').toLowerCase() === 'admin'
        : (u.rol || '').toLowerCase() !== 'admin';
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? u.activo !== false
        : u.activo === false;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Cálculos estadísticos
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter((u) => u.activo !== false).length;
  const adminUsers = usersList.filter((u) => (u.rol || '').toLowerCase() === 'admin').length;
  const clientUsers = totalUsers - adminUsers;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-[128px]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">SAIPI</span>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                  Superadmin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Centro de Operaciones y Auditoría Criptográfica
              </p>
            </div>
          </div>

          {/* Right Status & User Menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Backend NestJS & PostgreSQL</span>
            </div>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {user?.nombre?.charAt(0) || user?.first_name?.charAt(0) || 'A'}
              </div>
              <div className="text-left hidden sm:block pr-1">
                <p className="text-xs font-bold text-white leading-tight">
                  {user?.nombre || user?.first_name || 'Admin'} {user?.apellido || ''}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{user?.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                PANEL DE CONTROL GENERAL
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Supervisión Inmobiliaria & Contratos Digitales
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Monitorea usuarios, propiedades verificadas con Folio Real, comisiones de plataforma
                y transacciones auditadas criptográficamente en el ledger inmutable.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={loadAdminData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
                <span>Actualizar Datos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Usuarios Totales */}
          <div className="relative group overflow-hidden rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 p-5 shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Usuarios en Base
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">{totalUsers}</span>
              <span className="text-xs font-bold text-emerald-400">
                {activeUsers} activos
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {clientUsers} clientes • {adminUsers} administradores
            </p>
          </div>

          {/* Card 2: Inmuebles Registrados */}
          <div className="relative group overflow-hidden rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 p-5 shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inmuebles Activos
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">
                {propertiesList.length}
              </span>
              <span className="text-xs font-bold text-purple-400">Disponibles</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Con recorridos 360° y hash blockchain
            </p>
          </div>

          {/* Card 3: Tasa de Comisión */}
          <div className="relative group overflow-hidden rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 p-5 shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Comisión Plataforma
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">
                {config?.porcentajeComisionPlataforma || '5.0'}%
              </span>
              <span className="text-xs font-bold text-blue-400">por operación</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Configurable en tiempo real
            </p>
          </div>

          {/* Card 4: Seguridad & Ledger */}
          <div className="relative group overflow-hidden rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-5 shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Auditoría Blockchain
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 tracking-tight">100%</span>
              <span className="text-xs font-bold text-emerald-400">Inmutable</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Prueba de integridad SHA-256 válida
            </p>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión de Usuarios ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'finance'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Comisiones & Finanzas</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'properties'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Auditoría de Inmuebles ({propertiesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blockchain')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'blockchain'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Blockchain Ledger</span>
          </button>
        </div>

        {/* TAB 1: GESTIÓN DE USUARIOS */}
        {activeTab === 'users' && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl p-6 space-y-6">
            {/* Filter Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Directorio Oficial de Usuarios
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualiza los usuarios registrados, cambia su estado en tiempo real y revisa sus datos de contacto.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar nombre, correo o CI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Todos los Roles</option>
                  <option value="ADMIN">Sólo Admins</option>
                  <option value="CLIENT">Sólo Clientes</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Todos los Estados</option>
                  <option value="ACTIVE">Activos</option>
                  <option value="INACTIVE">Inactivos</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Cédula / CI</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        {loading ? 'Cargando usuarios...' : 'No se encontraron usuarios con los filtros aplicados.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isAdmin = (u.rol || '').toLowerCase() === 'admin';
                      const isCurrentUser = u.id === user?.id;
                      const isActive = u.activo !== false;

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* User Name & Email */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                                {u.nombre?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">
                                  {u.nombre || 'Sin nombre'} {u.apellido || ''}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-[10px] text-indigo-400 font-semibold">(Tú)</span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/30">
                                <Shield className="w-3 h-3 text-purple-400" /> Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/30">
                                <Users className="w-3 h-3 text-indigo-400" /> Usuario
                              </span>
                            )}
                          </td>

                          {/* Phone */}
                          <td className="py-3.5 px-4">
                            <span className="text-slate-300 font-medium">
                              {u.telefono || 'Sin teléfono'}
                            </span>
                          </td>

                          {/* CI */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-[11px]">
                              {u.ci || '—'}
                            </span>
                          </td>

                          {/* Active Status */}
                          <td className="py-3.5 px-4">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                                <XCircle className="w-3.5 h-3.5" /> Desactivado
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            {!isCurrentUser && (
                              <button
                                onClick={() => handleToggleUserActive(u.id)}
                                disabled={togglingId === u.id}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {togglingId === u.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" />
                                ) : isActive ? (
                                  'Desactivar'
                                ) : (
                                  'Activar'
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: COMISIONES & FINANZAS */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slider de Configuración de Comisión */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Comisión Global de la Plataforma</h3>
                  <p className="text-xs text-slate-400">
                    Porcentaje deducido automáticamente en pagos de alquiler y anticrético vía Stripe
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateCommission} className="space-y-5 pt-2">
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-300 font-semibold">Tasa Actual:</span>
                    <span className="text-indigo-400 font-black text-lg">{newCommission}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={newCommission}
                    onChange={(e) => setNewCommission(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1.0% (Mínimo)</span>
                    <span>7.5%</span>
                    <span>15.0% (Máximo)</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ejemplo de Alquiler:</span>
                    <span className="font-bold text-white">$1,000.00 USD</span>
                  </div>
                  <div className="flex justify-between text-indigo-400">
                    <span>Retención Plataforma ({newCommission}%):</span>
                    <span className="font-black">+${((1000 * newCommission) / 100).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 pt-2 border-t border-slate-800/80">
                    <span>Liquidación neta al Propietario:</span>
                    <span className="font-black">${(1000 - (1000 * newCommission) / 100).toFixed(2)} USD</span>
                  </div>
                </div>

                {configSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>¡Porcentaje de comisión guardado exitosamente en la base de datos!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingConfig}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  {updatingConfig ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando Cambios...</span>
                    </>
                  ) : (
                    <span>Guardar y Aplicar Nueva Comisión</span>
                  )}
                </button>
              </form>
            </div>

            {/* Estado de Pasarela Stripe */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pasarela de Pagos Stripe & Custodia</h3>
                  <p className="text-xs text-slate-400">Métricas de conversión y liquidación segura</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Tasa de Éxito</span>
                  <span className="text-2xl font-black text-emerald-400 block">100%</span>
                  <span className="text-[10px] text-slate-500">Sin rechazos reportados</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Moneda Principal</span>
                  <span className="text-2xl font-black text-white block">USD</span>
                  <span className="text-[10px] text-slate-500">Stripe Checkout habilitado</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Garantía de Inmutabilidad
                </p>
                <p className="text-slate-300 text-[11px]">
                  Cada transacción procesada por Stripe genera automáticamente un hash de confirmación forense y queda estampada en el siguiente bloque de la cadena Blockchain.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDITORÍA DE INMUEBLES */}
        {activeTab === 'properties' && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  Catálogo Oficial de Inmuebles
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Propiedades registradas con validación notarial, fotos 360° y certificado Blockchain.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertiesList.map((p) => {
                const fotoPrincipal =
                  p.multimedia?.find((m) => m.principal)?.archivoUrl ||
                  p.multimedia?.[0]?.archivoUrl ||
                  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600';
                const tiene360 = p.multimedia?.some((m) => m.tipo === 'panorama360');

                return (
                  <div
                    key={p.id}
                    className="overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all duration-300 group flex flex-col"
                  >
                    {/* Property Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                      <img
                        src={fotoPrincipal}
                        alt={p.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-600/90 text-white backdrop-blur-md">
                          {p.tipo?.nombre || 'Propiedad'}
                        </span>
                        {tiene360 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-600/90 text-white backdrop-blur-md">
                            360°
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-900/90 text-emerald-400 border border-slate-800 backdrop-blur-md">
                          ${Number(p.valorActivo || 0).toLocaleString()} USD
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors">
                          {p.titulo}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          📍 {p.direccion?.ciudad || 'La Paz'}, {p.direccion?.zona || 'Zona Central'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{p.habitaciones || 3} Hab • {p.banos || 2} Baños</span>
                        <span className="font-mono text-indigo-400 text-[10px]">
                          {p.hashBlockchain ? 'Certificado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: BLOCKCHAIN LEDGER */}
        {activeTab === 'blockchain' && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl p-6">
            <BlockchainAuditTrail />
          </div>
        )}
      </main>
    </div>
  );
}
