import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Building2,
  Compass,
  Box,
  ShieldCheck,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Heart,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal';
import LiveChatModal from '../components/LiveChatModal';

export default function CatalogPage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedOffer, setSelectedOffer] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');

  // Modals state
  const [activeAppointmentProp, setActiveAppointmentProp] = useState(null);
  const [activeChatProp, setActiveChatProp] = useState(null);

  // Load property types and properties
  const loadData = async () => {
    setLoading(true);
    try {
      const [propsRes, typesRes] = await Promise.all([
        api.get('/properties/search', {
          params: {
            search: searchTerm || undefined,
            tipoId: selectedType || undefined,
            tipoOferta: selectedOffer || undefined,
            ciudad: selectedCity || undefined,
            precioMax: priceMax || undefined,
            habitaciones: minBedrooms || undefined,
          },
        }),
        api.get('/properties/tipos'),
      ]);
      setProperties(propsRes.data || []);
      setTypes(typesRes.data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType, selectedOffer, selectedCity, priceMax, minBedrooms]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleFavorite = async (e, propId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/properties/${propId}/favorite`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const openAppointment = (e, prop) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActiveAppointmentProp(prop);
  };

  const openChat = (e, prop) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActiveChatProp(prop);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autogestión Inmobiliaria Sin Intermediarios Abusivos</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Encuentra tu próximo hogar con{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Recorridos 360°, AR 3D
            </span>{' '}
            y Contratos Inteligentes
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Plataforma directa entre propietarios e inquilinos. Títulos de propiedad auditados con IA y acuerdos certificados de manera inalterable en Blockchain.
          </p>

          {/* Search bar inside Hero */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2 bg-slate-900/90 p-2 rounded-2xl border border-indigo-500/30 shadow-2xl backdrop-blur-md"
          >
            <div className="flex-1 relative flex items-center">
              <Search className="w-5 h-5 absolute left-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por zona, ciudad, edificio o características..."
                className="w-full pl-11 pr-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Buscar Inmuebles</span>
            </button>
          </form>

          {/* Quick Offer Filter Badges */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setSelectedOffer('')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedOffer === ''
                  ? 'bg-white text-slate-900 shadow-md scale-105'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Todos los Inmuebles
            </button>
            <button
              onClick={() => setSelectedOffer('alquiler')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedOffer === 'alquiler'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Alquiler
            </button>
            <button
              onClick={() => setSelectedOffer('venta')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedOffer === 'venta'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Venta
            </button>
            <button
              onClick={() => setSelectedOffer('anticretico')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedOffer === 'anticretico'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Anticrético
            </button>
          </div>
        </div>
      </section>

      {/* Main Content & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  Filtros Avanzados
                </span>
                <button
                  onClick={() => {
                    setSelectedType('');
                    setSelectedOffer('');
                    setSelectedCity('');
                    setPriceMax('');
                    setMinBedrooms('');
                    setSearchTerm('');
                  }}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Limpiar
                </button>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Tipo de Inmueble
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Todos los Tipos</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Ciudad
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Todas las Ciudades</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                  <option value="La Paz">La Paz</option>
                  <option value="Cochabamba">Cochabamba</option>
                </select>
              </div>

              {/* Max Price */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-300">
                    Precio Máximo (USD)
                  </label>
                  <span className="text-indigo-400 font-bold">
                    {priceMax ? `$${Number(priceMax).toLocaleString()}` : 'Sin Límite'}
                  </span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="350000"
                  step="500"
                  value={priceMax || 350000}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Dormitorios Mínimos
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['', '1', '2', '3+'].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMinBedrooms(n === '3+' ? '3' : n)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        (n === '' && minBedrooms === '') ||
                        (n === '3+' && minBedrooms === '3') ||
                        minBedrooms === n
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {n === '' ? 'Todos' : n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technologies Highlight */}
              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span>Visor 360° Activo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-purple-400" />
                  <span>Compatibilidad AR 3D (.glb)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Certificación Blockchain</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Properties Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                Inmuebles Disponibles ({properties.length})
              </h2>
              <span className="text-xs text-slate-400">
                Transacciones directas verificadas por IA
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-96 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
                  />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">
                  No se encontraron inmuebles
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Prueba cambiando los filtros de búsqueda o restableciendo los criterios de precio.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((prop) => {
                  const mainImage =
                    prop.multimedia?.find((m) => m.principal)?.archivoUrl ||
                    prop.multimedia?.find((m) => m.tipo === 'imagen')?.archivoUrl ||
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';

                  const has360 = prop.multimedia?.some(
                    (m) => m.tipo === 'panorama360',
                  );
                  const has3d = !!prop.modelo3dUrl;
                  const activePub = prop.publicaciones?.[0];

                  return (
                    <div
                      key={prop.id}
                      onClick={() => navigate(`/inmueble/${prop.id}`)}
                      className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative h-56 overflow-hidden bg-slate-950">
                        <img
                          src={mainImage}
                          alt={prop.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Pills */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          {activePub && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-md">
                              {activePub.tipoOferta}
                            </span>
                          )}
                          {has360 && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shadow-md">
                              <Compass className="w-3 h-3 text-indigo-400" />
                              360° Tour
                            </span>
                          )}
                          {has3d && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md text-purple-300 border border-purple-500/30 flex items-center gap-1 shadow-md">
                              <Box className="w-3 h-3 text-purple-400" />
                              AR 3D
                            </span>
                          )}
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={(e) => handleToggleFavorite(e, prop.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/60 backdrop-blur-md text-white hover:text-rose-400 hover:bg-slate-900 transition-colors z-10"
                        >
                          <Heart className="w-4 h-4" />
                        </button>

                        {/* Price Banner Overlay */}
                        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                          <span className="text-base font-extrabold text-white">
                            ${Number(activePub?.precio || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-300 ml-1 font-semibold uppercase">
                            {activePub?.moneda || 'USD'}{' '}
                            {activePub?.tipoOferta === 'alquiler' ? '/mes' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Content Card Details */}
                      <div className="p-5 space-y-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            {prop.tipo?.nombre || 'Inmueble'}
                          </span>
                          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {prop.titulo}
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span className="truncate">
                              {prop.direccion?.zona}, {prop.direccion?.ciudad}
                            </span>
                          </p>
                        </div>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-slate-300 text-xs text-center">
                          <div className="flex flex-col items-center">
                            <Maximize className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                            <span className="text-[11px] font-semibold">{prop.superficie} m²</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Bed className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                            <span className="text-[11px] font-semibold">{prop.habitaciones} Dorm</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Bath className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                            <span className="text-[11px] font-semibold">{prop.banos} Baños</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Car className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                            <span className="text-[11px] font-semibold">{prop.garaje ? 'Sí' : 'No'}</span>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={(e) => openChat(e, prop)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Chatear</span>
                          </button>
                          <button
                            onClick={(e) => openAppointment(e, prop)}
                            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Agendar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals for Appointments and Chat */}
      {activeAppointmentProp && (
        <ScheduleAppointmentModal
          isOpen={!!activeAppointmentProp}
          onClose={() => setActiveAppointmentProp(null)}
          inmueble={activeAppointmentProp}
        />
      )}

      {activeChatProp && (
        <LiveChatModal
          isOpen={!!activeChatProp}
          onClose={() => setActiveChatProp(null)}
          targetUserId={activeChatProp.propietarioId}
          targetUserName={
            activeChatProp.propietario
              ? `${activeChatProp.propietario.nombre} ${activeChatProp.propietario.apellido || ''}`
              : 'Propietario'
          }
          inmuebleId={activeChatProp.id}
          inmuebleTitulo={activeChatProp.titulo}
        />
      )}
    </div>
  );
}
