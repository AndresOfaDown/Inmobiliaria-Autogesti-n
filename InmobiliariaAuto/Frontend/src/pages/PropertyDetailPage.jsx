import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Compass,
  Box,
  Maximize,
  Bed,
  Bath,
  Car,
  Star,
  CheckCircle,
  FileCheck,
  ArrowLeft,
  Share2,
  Heart,
  AlertCircle,
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import PannellumViewer from '../components/PannellumViewer';
import ModelViewer3D from '../components/ModelViewer3D';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal';
import LiveChatModal from '../components/LiveChatModal';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMediaTab, setActiveMediaTab] = useState('photos'); // 'photos', '360', '3d'
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Modals
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // New review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      const [propRes, revRes] = await Promise.all([
        api.get(`/properties/${id}`),
        api.get(`/users/reviews/inmueble/${id}`),
      ]);
      setProperty(propRes.data);
      setReviews(revRes.data || []);
      const mainPhoto =
        propRes.data.multimedia?.find((m) => m.principal)?.archivoUrl ||
        propRes.data.multimedia?.find((m) => m.tipo === 'imagen')?.archivoUrl;
      setSelectedPhoto(mainPhoto);
    } catch (err) {
      console.error('Error fetching property detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await api.post('/users/reviews', {
        inmuebleId: id,
        calificacion: newRating,
        comentario: newComment.trim(),
      });
      setNewComment('');
      const revRes = await api.get(`/users/reviews/inmueble/${id}`);
      setReviews(revRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Cargando datos y recorridos inmersivos del inmueble...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-base font-bold text-white">Inmueble no encontrado</p>
        <Link to="/" className="text-xs text-indigo-400 mt-2 inline-block">
          ← Volver al Catálogo
        </Link>
      </div>
    );
  }

  const activePub = property.publicaciones?.[0];
  const photoMedia = property.multimedia?.filter((m) => m.tipo === 'imagen') || [];
  const panorama360Media = property.multimedia?.filter((m) => m.tipo === 'panorama360') || [];

  return (
    <div className="min-h-screen pb-20">
      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>

        <div className="flex items-center gap-2">
          {property.hashBlockchain && (
            <Link
              to="/blockchain"
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certificado en Blockchain</span>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title & Price Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
                {activePub?.tipoOferta || 'Disponible'}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {property.tipo?.nombre}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {property.titulo}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>
                {property.direccion?.calle}, {property.direccion?.zona}, {property.direccion?.ciudad}
              </span>
            </p>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-left md:text-right min-w-[200px]">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
              Precio {activePub?.tipoOferta === 'alquiler' ? 'Mensual' : 'Total'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              ${Number(activePub?.precio || 0).toLocaleString()}
              <span className="text-xs font-semibold text-slate-400 ml-1">
                {activePub?.moneda || 'USD'}
              </span>
            </div>
          </div>
        </div>

        {/* Media Viewer Section with Tabs */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveMediaTab('photos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeMediaTab === 'photos'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Galería de Fotos ({photoMedia.length})</span>
            </button>

            {panorama360Media.length > 0 && (
              <button
                onClick={() => setActiveMediaTab('360')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeMediaTab === '360'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-indigo-400 border border-indigo-500/30 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4 animate-spin-slow" />
                <span>Recorrido 360° Interactivo ({panorama360Media.length})</span>
              </button>
            )}

            {property.modelo3dUrl && (
              <button
                onClick={() => setActiveMediaTab('3d')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeMediaTab === '3d'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-900 text-purple-400 border border-purple-500/30 hover:text-white'
                }`}
              >
                <Box className="w-4 h-4" />
                <span>Visualizador 3D y Realidad Aumentada (AR)</span>
              </button>
            )}
          </div>

          {/* Media Content Tab Panels */}
          {activeMediaTab === 'photos' && (
            <div className="space-y-3">
              <div className="relative h-[440px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={selectedPhoto || photoMedia[0]?.archivoUrl}
                  alt={property.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
              {photoMedia.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photoMedia.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedPhoto(m.archivoUrl)}
                      className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedPhoto === m.archivoUrl
                          ? 'border-indigo-500 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={m.archivoUrl}
                        alt="Miniatura"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMediaTab === '360' && (
            <PannellumViewer scenes={panorama360Media} height="480px" />
          )}

          {activeMediaTab === '3d' && (
            <ModelViewer3D src={property.modelo3dUrl} height="480px" />
          )}
        </div>

        {/* Property Specs and Right Action Panel */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Specs Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Maximize className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Superficie</span>
                  <span className="text-sm font-bold text-white">{property.superficie} m²</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Bed className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Dormitorios</span>
                  <span className="text-sm font-bold text-white">{property.habitaciones}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Bath className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Baños</span>
                  <span className="text-sm font-bold text-white">{property.banos}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Car className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Garaje</span>
                  <span className="text-sm font-bold text-white">{property.garaje ? 'Sí' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white">Descripción de la Propiedad</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {property.descripcion}
              </p>
            </div>

            {/* AI Legal Deed Verification Card */}
            {property.verificacionLegal && (
              <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Auditoría Legal de Título por IA
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">
                          {property.verificacionLegal.estado}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Folio Real: {property.verificacionLegal.resultadoIa?.matriculaFolio || 'MAT-701199'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                      Score Confianza
                    </span>
                    <span className="text-xl font-black text-emerald-400">
                      {property.verificacionLegal.scoreConfianza}/100
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {property.verificacionLegal.resumenPublico}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                  <span>Hash SHA-256 Titularidad:</span>
                  <span className="text-indigo-400 font-semibold truncate max-w-[280px]">
                    {property.verificacionLegal.hashCertificado || property.hashBlockchain}
                  </span>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>Reseñas de Inquilinos y Clientes ({reviews.length})</span>
                </h3>
              </div>

              {/* Add review form */}
              {isAuthenticated && (
                <form onSubmit={handleAddReview} className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300">Dejar una calificación:</h4>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className={`text-lg transition-transform hover:scale-125 ${
                          star <= newRating ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs text-slate-400 ml-2 font-semibold">
                      {newRating} de 5 estrellas
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Comparte tu experiencia respecto al inmueble o la visita presencial..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview || !newComment.trim()}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs disabled:opacity-50"
                    >
                      {submittingReview ? 'Publicando...' : 'Publicar Reseña'}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews list */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Aún no hay reseñas publicadas para este inmueble. ¡Sé el primero en calificarlo!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">
                          {rev.usuario?.nombre || 'Usuario Registrado'}
                        </span>
                        <div className="flex text-amber-400 text-xs">
                          {Array.from({ length: rev.calificacion }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rev.comentario}
                      </p>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(rev.creado).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Action Sidebar (Owner Card + Contact) */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 sticky top-24 space-y-6 shadow-xl">
              {/* Owner info */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <img
                  src={
                    property.propietario?.fotoUrl ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                  }
                  alt={property.propietario?.nombre}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {property.propietario?.nombre} {property.propietario?.apellido}
                  </h4>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Propietario Verificado
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (!isAuthenticated) navigate('/login');
                    else setChatModalOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chatear con el Propietario</span>
                </button>

                <button
                  onClick={() => {
                    if (!isAuthenticated) navigate('/login');
                    else setAppointmentModalOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Agendar Visita Presencial</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-slate-300">Garantía InmoAuto:</p>
                <p>• Trato directo sin comisiones abusivas de intermediarios.</p>
                <p>• Contratos redactados con IA y firmados digitalmente.</p>
                <p>• Pagos asegurados en cuenta de garantía (Escrow Stripe).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ScheduleAppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        inmueble={property}
      />

      <LiveChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        targetUserId={property.propietarioId}
        targetUserName={
          property.propietario
            ? `${property.propietario.nombre} ${property.propietario.apellido || ''}`
            : 'Propietario'
        }
        inmuebleId={property.id}
        inmuebleTitulo={property.titulo}
      />
    </div>
  );
}
