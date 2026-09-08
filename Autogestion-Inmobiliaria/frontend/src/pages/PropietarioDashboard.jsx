import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Building2,
  Building,
  LogOut,
  User,
  Shield,
  CheckCircle,
  PlusCircle,
  FileText,
  DollarSign,
  Users,
  Clock,
  Home,
  ChevronRight,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function PropietarioDashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('propiedades');

  // Datos de muestra para visualización profesional de la plataforma
  const sampleProperties = [
    {
      id: 1,
      title: 'Condominio Las Palmas - Casa 14B',
      type: 'Casa en Condominio',
      address: 'Av. Las Palmeras #320, Zona Norte',
      price: '$850 / mes',
      status: 'Arrendado',
      inquilino: 'Mariana Gómez',
      nextPayment: '15 Sep 2026',
    },
    {
      id: 2,
      title: 'Departamento Suite 402 - Edif. Titanium',
      type: 'Departamento',
      address: 'Calle Los Pinos #115, Equipetrol',
      price: '$550 / mes',
      status: 'Disponible',
      inquilino: 'Sin asignar',
      nextPayment: 'En publicación',
    },
  ];

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
                PROPIETARIOS
              </span>
            </div>
            <p className="text-xs text-slate-500">Plataforma de Autogestión Inmobiliaria</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.first_name?.charAt(0).toUpperCase() || 'P'}
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
                <Building className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                    ¡Bienvenido/a, {user?.first_name || 'Propietario'}!
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> Verificado
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                  Panel de control de propietario. Administra tus inmuebles en alquiler, supervisa contratos digitales y lleva un control automatizado de tus pagos.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Inmueble</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Nuevo Contrato</span>
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inmuebles</p>
              <p className="text-2xl font-bold text-slate-900 font-['Outfit']">2</p>
              <p className="text-[11px] text-emerald-600 font-medium">1 Arrendado • 1 Libre</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inquilinos</p>
              <p className="text-2xl font-bold text-slate-900 font-['Outfit']">1</p>
              <p className="text-[11px] text-slate-500 font-medium">Contrato vigente</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cobros del Mes</p>
              <p className="text-2xl font-bold text-slate-900 font-['Outfit']">$850</p>
              <p className="text-[11px] text-emerald-600 font-medium">Al día • Sin retrasos</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Solicitudes</p>
              <p className="text-2xl font-bold text-slate-900 font-['Outfit']">0</p>
              <p className="text-[11px] text-slate-500 font-medium">Todas atendidas</p>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Perfil & Gestión */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Perfil del Propietario */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Perfil del Propietario
                </h3>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  ID: #{user?.id || '01'}
                </span>
              </div>

              {/* Avatar + Name badge */}
              <div className="flex items-center gap-3.5 pb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {user?.first_name?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {user?.first_name} {user?.last_name}
                  </h4>
                  <p className="text-xs text-slate-500">Propietario Registrado en SAIPI</p>
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
                    {user?.documento_identidad || '14004972'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Teléfono:
                  </span>
                  <span className="text-slate-900 font-semibold">
                    {user?.telefono || '77893672'}
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
                Tu sesión cuenta con autenticación segura <strong className="text-slate-800">SimpleJWT</strong> y permisos exclusivos para gestión de propiedades bajo el rol <strong className="text-blue-600">PROPIETARIO</strong>.
              </p>
            </div>
          </div>

          {/* Right Column: Gestión Inmobiliaria SAIPI */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                    Mis Inmuebles Registrados
                  </h3>
                  <p className="text-xs text-slate-500">Administra y consulta el estado de tus propiedades en arriendo</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Filtrar:</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    Todos (2)
                  </span>
                </div>
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="border border-slate-200 hover:border-blue-300 rounded-xl p-4 transition-all hover:shadow-sm bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {prop.type}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            prop.status === 'Arrendado'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 leading-snug">{prop.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{prop.address}</p>

                      <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Canon Mensual</span>
                          <span className="font-bold text-slate-900 text-sm">{prop.price}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Inquilino</span>
                          <span className="font-semibold text-slate-800 truncate block">{prop.inquilino}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2">
                      <button
                        type="button"
                        className="w-full py-1.5 px-3 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Gestionar Inmueble</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Module Info Footer */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block font-bold mb-0.5">Gestión Inmobiliaria Activa</strong>
                  Como propietario, puedes publicar nuevos inmuebles, descargar contratos de arriendo y registrar el pago mensual de tus inquilinos de manera automática.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
