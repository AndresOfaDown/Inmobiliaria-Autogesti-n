import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Building2,
  Home,
  LogOut,
  User,
  Shield,
  CheckCircle,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  Phone,
  Mail,
  CreditCard,
  ChevronRight,
  UploadCloud,
  Search,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function InquilinoDashboard() {
  const { user, logout } = useAuthStore();

  const currentLease = {
    propertyTitle: 'Condominio Las Palmas - Casa 14B',
    address: 'Av. Las Palmeras #320, Zona Norte',
    propietario: 'Carlos Morales',
    phone: '+591 77084747',
    monthlyRent: '$850 / mes',
    dueDate: '5 de cada mes',
    nextPayment: '15 Sep 2026',
    status: 'Al día',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Inter']">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit']">SAIPI</h1>
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                INQUILINOS
              </span>
            </div>
            <p className="text-xs text-slate-500">Portal de Arrendatario</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.first_name?.charAt(0).toUpperCase() || 'I'}
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
                <Home className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                    ¡Bienvenido/a, {user?.first_name || 'Inquilino'}!
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> Arrendatario Activo
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                  Portal del inquilino. Consulta el estado de tu contrato de arriendo, registra pagos mensuales y reporta solicitudes de mantenimiento.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Registrar Pago</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4 text-blue-600" />
                <span>Explorar Inmuebles</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mi Arriendo</p>
              <p className="text-xl font-bold text-slate-900 font-['Outfit'] truncate max-w-[150px]">Casa 14B</p>
              <p className="text-[11px] text-emerald-600 font-medium">Contrato Vigente</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Canon Mensual</p>
              <p className="text-2xl font-bold text-slate-900 font-['Outfit']">$850</p>
              <p className="text-[11px] text-slate-500 font-medium">Vence el día 5</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Próximo Pago</p>
              <p className="text-xl font-bold text-slate-900 font-['Outfit']">15 Sep 2026</p>
              <p className="text-[11px] text-emerald-600 font-medium">Sin deudas pendientes</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recibos</p>
              <p className="text-2xl font-bold text-slate-900 font-['Outfit']">6</p>
              <p className="text-[11px] text-slate-500 font-medium">Comprobantes listos</p>
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Perfil del Inquilino */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Perfil del Inquilino
                </h3>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  ID: #{user?.id || '02'}
                </span>
              </div>

              {/* Avatar + Name badge */}
              <div className="flex items-center gap-3.5 pb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {user?.first_name?.charAt(0).toUpperCase() || 'I'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {user?.first_name} {user?.last_name}
                  </h4>
                  <p className="text-xs text-slate-500">Inquilino Registrado en SAIPI</p>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Correo:
                  </span>
                  <span className="text-slate-900 font-semibold truncate max-w-[170px]" title={user?.email}>
                    {user?.email}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Cédula / CI:
                  </span>
                  <span className="text-slate-900 font-semibold">
                    {user?.documento_identidad || '87654321'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Teléfono:
                  </span>
                  <span className="text-slate-900 font-semibold">
                    {user?.telefono || '70012345'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Registro:
                  </span>
                  <span className="text-slate-900 font-semibold">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Septiembre 2026'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500">Estado de cuenta:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Activa
                  </span>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Shield className="w-4 h-4 text-blue-600" />
                Seguridad & Roles SAIPI
              </div>
              <p className="leading-relaxed">
                Tu cuenta opera con autenticación cifrada <strong className="text-slate-800">SimpleJWT</strong> con permisos específicos de arrendatario bajo el rol <strong className="text-blue-600">INQUILINO</strong>.
              </p>
            </div>
          </div>

          {/* Right Column: Contrato Activo */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                    Detalles de mi Arriendo Actual
                  </h3>
                  <p className="text-xs text-slate-500">Información del contrato de alquiler y datos de contacto</p>
                </div>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Contrato Activo
                </span>
              </div>

              {/* Lease Detail Card */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                    Casa en Condominio
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">{currentLease.propertyTitle}</h4>
                  <p className="text-xs text-slate-500">{currentLease.address}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Propietario / Arrendador</span>
                    <span className="font-bold text-slate-900 text-sm">{currentLease.propietario}</span>
                    <span className="text-slate-500 block text-[11px]">{currentLease.phone}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Canon Mensual</span>
                    <span className="font-bold text-slate-900 text-sm">{currentLease.monthlyRent}</span>
                    <span className="text-slate-500 block text-[11px]">Vence: {currentLease.dueDate}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Estado de Pagos</span>
                    <span className="font-bold text-emerald-600 text-sm block">Al Día</span>
                    <span className="text-slate-500 block text-[11px]">Próximo: {currentLease.nextPayment}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Subir Comprobante de Pago</span>
                  </button>

                  <button
                    type="button"
                    className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ver Contrato Digital</span>
                  </button>
                </div>
              </div>

              {/* Tips Footer */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block font-bold mb-0.5">Asistencia para Inquilinos</strong>
                  Puedes gestionar tus pagos sin intermediarios, solicitar reparaciones o consultar tus comprobantes históricos directamente desde tu cuenta SAIPI.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
