import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Percent,
  Users,
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import api from '../api/axios';
import BlockchainAuditTrail from '../components/BlockchainAuditTrail';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [config, setConfig] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [contractsList, setContractsList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Commission setting state
  const [newCommission, setNewCommission] = useState(5.0);
  const [updatingConfig, setUpdatingConfig] = useState(false);
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics', 'users', 'properties', 'blockchain'

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, configRes, usersRes, contractsRes, propsRes] =
        await Promise.all([
          api.get('/payments/metrics'),
          api.get('/payments/config'),
          api.get('/users'),
          api.get('/contracts/all'),
          api.get('/properties/search'),
        ]);

      setMetrics(metricsRes.data);
      setConfig(configRes.data);
      setNewCommission(Number(configRes.data.porcentajeComisionPlataforma));
      setUsersList(usersRes.data || []);
      setContractsList(contractsRes.data || []);
      setPropertiesList(propsRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateCommission = async (e) => {
    e.preventDefault();
    setUpdatingConfig(true);
    try {
      const res = await api.put('/payments/config', {
        porcentajeComision: Number(newCommission),
      });
      setConfig(res.data);
      alert('¡Porcentaje de comisión de la plataforma actualizado exitosamente!');
    } catch (err) {
      alert('Error al actualizar comisión: ' + err.message);
    } finally {
      setUpdatingConfig(false);
    }
  };

  const handleToggleUserActive = async (userId) => {
    try {
      await api.put(`/users/${userId}/toggle-active`);
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              Panel de Control y Auditoría Global
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SUPERADMIN
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Métricas financieras, comisiones, moderación de usuarios y monitoreo de contratos inteligentes
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refrescar Métricas
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Ingresos Totales</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            ${Number(metrics?.totalRecaudado || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-medium">
            Procesados por Stripe y Auditados en Blockchain
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Comisiones Plataforma</span>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400 mt-1">
            ${Number(metrics?.totalComisiones || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            Tasa actual: {config?.porcentajeComisionPlataforma}%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Inmuebles Activos</span>
            <Building2 className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {propertiesList.length}
          </p>
          <span className="text-[11px] text-purple-400 font-medium">
            Con 360° y validación legal
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Usuarios Registrados</span>
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {usersList.length}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            Propietarios e inquilinos directos
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'metrics'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Ajustes de Comisión & Finanzas
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Gestión de Usuarios ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'properties'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Auditoría de Inmuebles ({propertiesList.length})
        </button>
        <button
          onClick={() => setActiveTab('blockchain')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'blockchain'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-emerald-400 border border-emerald-500/30 hover:text-white'
          }`}
        >
          Explorador Blockchain
        </button>
      </div>

      {/* TAB: SETTINGS & COMMISSIONS */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commission configuration card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Configuración Global de Comisión</h3>
                <p className="text-xs text-slate-400">
                  Porcentaje retenido automáticamente sobre cada alquiler o depósito exitoso
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateCommission} className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Tasa de Comisión (%):</span>
                  <span className="text-indigo-400 font-black text-sm">{newCommission}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={newCommission}
                  onChange={(e) => setNewCommission(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                Por cada $1,000 USD cobrados, la plataforma retendrá <strong className="text-indigo-300">${(1000 * newCommission / 100).toFixed(2)} USD</strong> y transferirá el remanente de manera instantánea al propietario vía Stripe Connect.
              </div>

              <button
                type="submit"
                disabled={updatingConfig}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
              >
                {updatingConfig ? 'Guardando...' : 'Aplicar Nueva Comisión Global'}
              </button>
            </form>
          </div>

          {/* Stripe Performance Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Conversión y Pasarela Stripe</h3>
                <p className="text-xs text-slate-400">Métricas de pago en tiempo real</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Tasa de Éxito:</span>
                <span className="text-xl font-black text-emerald-400">
                  {metrics?.tasaConversionStripe || '100%'}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Transacciones Completadas:</span>
                <span className="text-xl font-black text-white">
                  {metrics?.stripeExitosas || 0}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs">
              ✓ Todos los pagos exitosos son inmediatamente certificados en el Ledger inmutable de Blockchain.
            </div>
          </div>
        </div>
      )}

      {/* TAB: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Directorio de Usuarios del Sistema</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5">Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Teléfono</th>
                  <th>C.I.</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-white">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="text-slate-300">{u.email}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                        u.rol === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="text-slate-400">{u.telefono || '—'}</td>
                    <td className="text-slate-400">{u.ci || '—'}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        u.activo ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {u.activo ? '✓ Activo' : '✕ Desactivado'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleUserActive(u.id)}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline"
                      >
                        {u.activo ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PROPERTIES AUDIT */}
      {activeTab === 'properties' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Auditoría y Moderación de Inmuebles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {propertiesList.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[280px]">
                    {p.titulo}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Propietario: {p.propietario?.nombre} {p.propietario?.apellido} • {p.direccion?.ciudad}
                  </p>
                  <span className="text-[10px] text-indigo-400 font-mono mt-1 block">
                    Hash Blockchain: {p.hashBlockchain || 'En espera'}
                  </span>
                </div>
                <button
                  onClick={() => window.open(`/inmueble/${p.id}`, '_blank')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Auditar Ficha
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: BLOCKCHAIN EXPLORER */}
      {activeTab === 'blockchain' && (
        <BlockchainAuditTrail />
      )}
    </div>
  );
}
