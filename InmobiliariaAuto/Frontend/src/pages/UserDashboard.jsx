import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileText,
  DollarSign,
  Calendar,
  MessageSquare,
  Plus,
  ShieldCheck,
  CheckCircle,
  Clock,
  ExternalLink,
  PenTool,
  Sparkles,
  CreditCard,
  Trash2,
  Eye,
  Compass,
  Box,
  MapPin,
  Lock,
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import ContractSignModal from '../components/ContractSignModal';
import LiveChatModal from '../components/LiveChatModal';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('properties'); // 'properties', 'contracts', 'payments', 'citas', 'chat'

  // Data states
  const [myProperties, setMyProperties] = useState([]);
  const [myContracts, setMyContracts] = useState([]);
  const [myPayments, setMyPayments] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [newPropModalOpen, setNewPropModalOpen] = useState(false);
  const [newContractModalOpen, setNewContractModalOpen] = useState(false);
  const [signContractModalOpen, setSignContractModalOpen] = useState(false);
  const [selectedContractToSign, setSelectedContractToSign] = useState(null);
  const [verifyTitleModalOpen, setVerifyTitleModalOpen] = useState(false);
  const [selectedPropToVerify, setSelectedPropToVerify] = useState(null);
  const [stripePaymentModalOpen, setStripePaymentModalOpen] = useState(false);
  const [selectedContractToPay, setSelectedContractToPay] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  // Form states for new Property
  const [newPropData, setNewPropData] = useState({
    titulo: '',
    descripcion: '',
    tipoId: '',
    superficie: 90,
    largo: 10,
    ancho: 9,
    habitaciones: 2,
    banos: 2,
    garaje: true,
    modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb',
    direccion: {
      ciudad: 'Santa Cruz',
      zona: 'Equipetrol',
      calle: 'Av. San Martín #200',
      referencia: 'Edificio Las Palmas',
    },
    publicacion: {
      tipoOferta: 'alquiler',
      precio: 850,
      moneda: 'USD',
    },
    fotoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    panorama360Url: 'https://pannellum.org/images/alma.jpg',
  });

  // Form states for new AI Contract
  const [contractForm, setContractForm] = useState({
    inmuebleId: '',
    tipoContratoId: '',
    inquilinoEmail: 'lucia.inquilino@gmail.com',
    monto: 850,
    moneda: 'USD',
    deposito: 850,
    diaPago: 5,
    inicio: '2026-04-01',
    fin: '2027-03-31',
    incluyeServicios: 'Agua potable y expensas de condominio',
    restricciones: 'Prohibido subarrendar, no actividades ruidosas',
    generatingAi: false,
    generatedClauses: '',
  });

  // Form for Title Verification
  const [deedOcrText, setDeedOcrText] = useState(
    'FOLIO REAL MATRICULA 7.01.1.99.0098765. TITULARIDAD: DERECHO PROPIETARIO INSCRITO EN DERECHOS REALES. ASIENTO B-1: SIN GRAVAMENES, LIBRE DE HIPOTECAS O EMBARGOS.',
  );
  const [verifyingTitle, setVerifyingTitle] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Load user data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [propsRes, contractsRes, paymentsRes, citasRes, chatsRes, typesRes] =
        await Promise.all([
          api.get('/properties/owner/my-properties'),
          api.get('/contracts/my-contracts'),
          api.get('/payments/my-payments'),
          api.get('/properties/citas/my-appointments'),
          api.get('/chat/my-chats'),
          api.get('/properties/tipos'),
        ]);

      setMyProperties(propsRes.data || []);
      setMyContracts(contractsRes.data || []);
      setMyPayments(paymentsRes.data || []);
      setMyAppointments(citasRes.data || []);
      setMyChats(chatsRes.data || []);
      setPropertyTypes(typesRes.data || []);
      if (typesRes.data?.length > 0 && !newPropData.tipoId) {
        setNewPropData((prev) => ({ ...prev, tipoId: typesRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Property Create
  const handleCreateProperty = async (e) => {
    e.preventDefault();
    try {
      await api.post('/properties', {
        tipoId: newPropData.tipoId,
        titulo: newPropData.titulo,
        descripcion: newPropData.descripcion,
        superficie: Number(newPropData.superficie),
        largo: Number(newPropData.largo),
        ancho: Number(newPropData.ancho),
        habitaciones: Number(newPropData.habitaciones),
        banos: Number(newPropData.banos),
        garaje: newPropData.garaje,
        modelo3dUrl: newPropData.modelo3dUrl,
        direccion: newPropData.direccion,
        publicacion: newPropData.publicacion,
        multimedia: [
          {
            tipo: 'imagen',
            archivoUrl: newPropData.fotoUrl,
            descripcion: 'Foto Principal',
            principal: true,
            orden: 0,
          },
          {
            tipo: 'panorama360',
            archivoUrl: newPropData.panorama360Url,
            descripcion: 'Recorrido Panorámico 360°',
            principal: false,
            orden: 1,
          },
        ],
      });
      setNewPropModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear inmueble');
    }
  };

  // Handle AI Contract Generation & Save
  const handleGenerateContractWithAi = async () => {
    setContractForm((prev) => ({ ...prev, generatingAi: true }));
    try {
      const selectedProp = myProperties.find((p) => p.id === contractForm.inmuebleId) || myProperties[0];
      const res = await api.post('/ia/generar-contrato', {
        tipoContrato: 'alquiler',
        inmuebleTitulo: selectedProp?.titulo || 'Inmueble Residencial',
        direccion: `${selectedProp?.direccion?.calle || 'Zona Central'}, ${selectedProp?.direccion?.ciudad || 'Santa Cruz'}`,
        superficie: selectedProp?.superficie || 100,
        propietarioNombre: `${user?.nombre} ${user?.apellido || ''}`,
        propietarioCi: user?.ci || '5849201 SC',
        inquilinoNombre: 'Inquilino Certificado',
        inquilinoCi: '8392014 CB',
        monto: Number(contractForm.monto),
        moneda: contractForm.moneda,
        deposito: Number(contractForm.deposito),
        diaPago: Number(contractForm.diaPago),
        inicio: contractForm.inicio,
        fin: contractForm.fin,
        incluyeServicios: contractForm.incluyeServicios,
        restricciones: contractForm.restricciones,
      });

      setContractForm((prev) => ({
        ...prev,
        generatingAi: false,
        generatedClauses: res.data.clausulas,
      }));
    } catch (err) {
      setContractForm((prev) => ({ ...prev, generatingAi: false }));
      alert('Error al generar contrato con IA: ' + err.message);
    }
  };

  const handleSaveContract = async (e) => {
    e.preventDefault();
    try {
      const allUsers = await api.get('/users/profile'); // current user
      // Find tenant id by email or use demo tenant
      const targetInquilinoId =
        user?.id === '88400d84-b51a-4f39-82c4-e4626b921997'
          ? 'c7793d25-9611-4f05-89f4-0b1a030ef899' // Lucia Flores
          : '88400d84-b51a-4f39-82c4-e4626b921997';

      const tiposContrato = await api.get('/contracts/tipos');
      const tipoAlquiler = tiposContrato.data.find((t) => t.nombre === 'Alquiler') || tiposContrato.data[0];

      await api.post('/contracts', {
        inmuebleId: contractForm.inmuebleId || myProperties[0]?.id,
        tipoContratoId: tipoAlquiler.id,
        inquilinoId: targetInquilinoId,
        inicio: new Date(contractForm.inicio),
        fin: new Date(contractForm.fin),
        monto: Number(contractForm.monto),
        moneda: contractForm.moneda,
        deposito: Number(contractForm.deposito),
        diaPago: Number(contractForm.diaPago),
        formaPago: 'Stripe',
        clausulas: contractForm.generatedClauses || 'Cláusulas estándar acordadas entre partes...',
        condicionesUso: 'Uso residencial exclusivo',
        penalidades: '1% diario por mora tras 5 días.',
      });

      setNewContractModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al emitir contrato');
    }
  };

  // Handle Title Verification Request
  const handleVerifyTitle = async () => {
    if (!selectedPropToVerify) return;
    setVerifyingTitle(true);
    try {
      const res = await api.post(`/properties/${selectedPropToVerify.id}/verificar-titulo`, {
        archivoTituloUrl: 'https://example.com/folio-real-uploaded.pdf',
        textoOcr: deedOcrText,
      });
      setVerificationResult(res.data);
      loadDashboardData();
    } catch (err) {
      alert('Error en verificación legal: ' + err.message);
    } finally {
      setVerifyingTitle(false);
    }
  };

  // Handle Stripe Payment
  const handlePayRentStripe = async () => {
    if (!selectedContractToPay) return;
    try {
      // 1. Create checkout session
      const res = await api.post('/payments/create-checkout-session', {
        contratoId: selectedContractToPay.id,
        tipoOperacion: 'alquiler',
        monto: Number(selectedContractToPay.monto),
        moneda: selectedContractToPay.moneda || 'USD',
      });

      // 2. Automatically confirm / complete payment simulation
      await api.post('/payments/confirm-session', {
        sessionId: res.data.sessionId,
      });

      alert(`¡Pago de $${selectedContractToPay.monto} procesado exitosamente vía Stripe y certificado en Blockchain!`);
      setStripePaymentModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert('Error procesando pago Stripe: ' + err.message);
    }
  };

  // Handle Appointment Status Change
  const handleUpdateCitaStatus = async (citaId, estado) => {
    try {
      await api.put(`/properties/citas/${citaId}/status`, { estado });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-600/30">
            {user?.nombre?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">
              ¡Hola, {user?.nombre}! 👋
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Panel unificado de autogestión • Rol: <span className="text-indigo-400 capitalize font-bold">{user?.rol}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewPropModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Inmueble</span>
          </button>
          <button
            onClick={() => {
              if (myProperties.length > 0) {
                setContractForm((prev) => ({ ...prev, inmuebleId: myProperties[0].id }));
              }
              setNewContractModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Redactar Contrato con IA</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'properties'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Mis Inmuebles ({myProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'contracts'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Contratos Digitales ({myContracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Pagos & Stripe ({myPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('citas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'citas'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Visitas & Citas ({myAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Mensajes ({myChats.length})</span>
        </button>
      </div>

      {/* TAB 1: MIS INMUEBLES */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Propiedades que administro
            </h2>
            <button
              onClick={() => setNewPropModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md"
            >
              <Plus className="w-4 h-4" /> Publicar Inmueble
            </button>
          </div>

          {myProperties.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No tienes inmuebles registrados</p>
              <p className="text-xs text-slate-400 mt-1">
                Haz clic en "Publicar Inmueble" para agregar fotos, recorridos 360° y verificar tu título con IA.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map((prop) => {
                const photo =
                  prop.multimedia?.find((m) => m.tipo === 'imagen')?.archivoUrl ||
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';
                const has360 = prop.multimedia?.some((m) => m.tipo === 'panorama360');

                return (
                  <div
                    key={prop.id}
                    className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-3 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950 mb-3">
                        <img src={photo} alt={prop.titulo} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 flex gap-1">
                          {has360 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Compass className="w-3 h-3 text-indigo-400" /> 360°
                            </span>
                          )}
                          {prop.modelo3dUrl && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                              <Box className="w-3 h-3 text-purple-400" /> 3D AR
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white truncate">{prop.titulo}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{prop.direccion?.zona}, {prop.direccion?.ciudad}</span>
                      </p>

                      <div className="flex items-center justify-between text-xs font-bold text-white mt-3 pt-2 border-t border-slate-800">
                        <span>{prop.superficie} m² • {prop.habitaciones} Dorm</span>
                        <span className="text-indigo-400">
                          ${prop.publicaciones?.[0]?.precio || 0} {prop.publicaciones?.[0]?.moneda || 'USD'}
                        </span>
                      </div>
                    </div>

                    {/* Actions & Verification */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPropToVerify(prop);
                          setVerifyTitleModalOpen(true);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verificar Título IA</span>
                      </button>
                      <button
                        onClick={() => window.open(`/inmueble/${prop.id}`, '_blank')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Ver Ficha Pública"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MIS CONTRATOS */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Contratos Digitales & Smart Legal</h2>
            <button
              onClick={() => setNewContractModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md"
            >
              <Sparkles className="w-4 h-4" /> Redactar con IA
            </button>
          </div>

          {myContracts.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No tienes contratos activos ni borradores</p>
              <p className="text-xs text-slate-400 mt-1">
                Puedes redactar un contrato formal con terminología notarial asistido por IA.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myContracts.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Contrato de {c.tipoContrato?.nombre || 'Alquiler'} — {c.inmueble?.titulo}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Partes: Arrendador: <strong className="text-slate-300">{c.inmueble?.propietario?.nombre}</strong> | Inquilino: <strong className="text-slate-300">{c.inquilino?.nombre}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.estado === 'activo'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : c.estado === 'borrador'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        Estado: {c.estado}
                      </span>
                    </div>
                  </div>

                  {/* Financial & Blockchain Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block">Canon Mensual:</span>
                      <strong className="text-sm text-white">${c.monto} {c.moneda}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Vigencia:</span>
                      <strong className="text-sm text-slate-200">
                        {new Date(c.inicio).toLocaleDateString()} al {new Date(c.fin).toLocaleDateString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Auditoría Blockchain:</span>
                      {c.blockchainTxId ? (
                        <span className="text-emerald-400 font-mono text-[11px] font-bold block truncate">
                          Bloque #{c.blockchainBlockNumber} • {c.blockchainTxId}
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs">Pendiente de ambas firmas</span>
                      )}
                    </div>
                  </div>

                  {/* Signatures status & Action button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-4 text-xs">
                      <span className={c.firmaPropietario ? 'text-emerald-400' : 'text-slate-500'}>
                        {c.firmaPropietario ? '✓ Firma Propietario Lista' : '○ Firma Propietario Pendiente'}
                      </span>
                      <span className={c.firmaInquilino ? 'text-emerald-400' : 'text-slate-500'}>
                        {c.firmaInquilino ? '✓ Firma Inquilino Lista' : '○ Firma Inquilino Pendiente'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedContractToSign(c);
                          setSignContractModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-transform active:scale-95"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Firmar / Ver Cláusulas</span>
                      </button>

                      {c.estado === 'activo' && (
                        <button
                          onClick={() => {
                            setSelectedContractToPay(c);
                            setStripePaymentModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-transform active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pagar con Stripe</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MIS PAGOS & STRIPE */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Historial de Pagos & Auditoría Blockchain</h2>
          </div>

          {myPayments.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <DollarSign className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No hay pagos registrados</p>
              <p className="text-xs text-slate-400 mt-1">
                Los pagos de alquileres y depósitos procesados vía Stripe aparecerán aquí con certificación criptográfica.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          ${p.monto} {p.contrato?.moneda || 'USD'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {p.estado}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Inmueble: <strong className="text-slate-300">{p.contrato?.inmueble?.titulo}</strong> • {new Date(p.fecha).toLocaleDateString()}
                      </p>
                      {p.blockchainTxId && (
                        <p className="text-[11px] text-indigo-400 font-mono mt-1">
                          Ledger TxID: {p.blockchainTxId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-500 block">Método: Stripe Checkout</span>
                    <span className="text-emerald-400 font-semibold">Comisión Plataforma (5%) Retenida</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CITAS Y AGENDA */}
      {activeTab === 'citas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Visitas Presenciales Agendadas</h2>
          </div>

          {myAppointments.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No tienes citas agendadas</p>
              <p className="text-xs text-slate-400 mt-1">
                Cuando los clientes agenden visitas a tus inmuebles, podrás confirmarlas aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myAppointments.map((cita) => (
                <div
                  key={cita.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          Visita para: {cita.inmueble?.titulo}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            cita.estado === 'confirmada'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : cita.estado === 'cancelada'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {cita.estado}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Fecha: <strong>{new Date(cita.fecha).toLocaleDateString()}</strong> • Horario: <strong>{cita.horaInicio} - {cita.horaFin}</strong>
                      </p>
                      {cita.notas && (
                        <p className="text-xs text-slate-400 italic mt-1">"{cita.notas}"</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {cita.estado === 'pendiente' && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleUpdateCitaStatus(cita.id, 'confirmada')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                      >
                        Confirmar Cita
                      </button>
                      <button
                        onClick={() => handleUpdateCitaStatus(cita.id, 'cancelada')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CHAT DIRECTO */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Conversaciones Directas</h2>
          {myChats.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No tienes chats iniciados</p>
              <p className="text-xs text-slate-400 mt-1">
                Puedes iniciar conversaciones directas desde cualquier publicación del catálogo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myChats.map((c) => {
                const partner =
                  c.participante1Id === user?.id ? c.participante2 : c.participante1;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveChat(c)}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                        {partner?.nombre?.[0] || 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {partner?.nombre} {partner?.apellido}
                        </h4>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">
                          {c.inmueble ? `Ref: ${c.inmueble.titulo}` : 'Chat Directo'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-400 font-medium">Abrir Chat →</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: PUBLICAR NUEVO INMUEBLE */}
      {newPropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Publicar Nuevo Inmueble con 360° y AR 3D
              </h3>
              <button onClick={() => setNewPropModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProperty} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Publicación</label>
                <input
                  type="text"
                  required
                  value={newPropData.titulo}
                  onChange={(e) => setNewPropData({ ...newPropData, titulo: e.target.value })}
                  placeholder="Ej. Departamento Moderno en Equipetrol con Terraza"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Inmueble</label>
                  <select
                    value={newPropData.tipoId}
                    onChange={(e) => setNewPropData({ ...newPropData, tipoId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {propertyTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Oferta</label>
                  <select
                    value={newPropData.publicacion.tipoOferta}
                    onChange={(e) =>
                      setNewPropData({
                        ...newPropData,
                        publicacion: { ...newPropData.publicacion, tipoOferta: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="alquiler">Alquiler</option>
                    <option value="venta">Venta</option>
                    <option value="anticretico">Anticrético</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio (USD)</label>
                  <input
                    type="number"
                    value={newPropData.publicacion.precio}
                    onChange={(e) =>
                      setNewPropData({
                        ...newPropData,
                        publicacion: { ...newPropData.publicacion, precio: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Superficie (m²)</label>
                  <input
                    type="number"
                    value={newPropData.superficie}
                    onChange={(e) => setNewPropData({ ...newPropData, superficie: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dormitorios</label>
                  <input
                    type="number"
                    value={newPropData.habitaciones}
                    onChange={(e) => setNewPropData({ ...newPropData, habitaciones: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Baños</label>
                  <input
                    type="number"
                    value={newPropData.banos}
                    onChange={(e) => setNewPropData({ ...newPropData, banos: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción Detallada</label>
                <textarea
                  rows={3}
                  value={newPropData.descripcion}
                  onChange={(e) => setNewPropData({ ...newPropData, descripcion: e.target.value })}
                  placeholder="Detalla ambientes, comodidades, expensas y ubicación..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              {/* Multimedia links */}
              <div className="space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-indigo-400 block">Multimedia Avanzada</span>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">URL Foto Principal</label>
                  <input
                    type="text"
                    value={newPropData.fotoUrl}
                    onChange={(e) => setNewPropData({ ...newPropData, fotoUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">URL Imagen Equirrectangular 360° (.jpg)</label>
                  <input
                    type="text"
                    value={newPropData.panorama360Url}
                    onChange={(e) => setNewPropData({ ...newPropData, panorama360Url: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">URL Modelo 3D para Realidad Aumentada (.glb)</label>
                  <input
                    type="text"
                    value={newPropData.modelo3dUrl}
                    onChange={(e) => setNewPropData({ ...newPropData, modelo3dUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPropModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Publicar y Certificar en Blockchain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REDACTAR CONTRATO CON IA */}
      {newContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Redactor Jurídico Automatizado con IA
                </h3>
              </div>
              <button onClick={() => setNewContractModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveContract} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Inmueble</label>
                  <select
                    value={contractForm.inmuebleId}
                    onChange={(e) => setContractForm({ ...contractForm, inmuebleId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {myProperties.map((p) => (
                      <option key={p.id} value={p.id}>{p.titulo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Inquilino</label>
                  <input
                    type="email"
                    value={contractForm.inquilinoEmail}
                    onChange={(e) => setContractForm({ ...contractForm, inquilinoEmail: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Canon / Monto ($)</label>
                  <input
                    type="number"
                    value={contractForm.monto}
                    onChange={(e) => setContractForm({ ...contractForm, monto: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Garantía ($)</label>
                  <input
                    type="number"
                    value={contractForm.deposito}
                    onChange={(e) => setContractForm({ ...contractForm, deposito: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Día de Pago (1-28)</label>
                  <input
                    type="number"
                    value={contractForm.diaPago}
                    onChange={(e) => setContractForm({ ...contractForm, diaPago: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-300">Generar Cláusulas Notariales con IA</span>
                  <p className="text-[11px] text-slate-400">
                    Redacta automáticamente desahucio voluntario, mora, fianza y resolución civil.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateContractWithAi}
                  disabled={contractForm.generatingAi}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md shadow-purple-600/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{contractForm.generatingAi ? 'Redactando...' : 'Generar con IA'}</span>
                </button>
              </div>

              {contractForm.generatedClauses && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-48 overflow-y-auto text-xs text-slate-300 font-serif whitespace-pre-wrap">
                  {contractForm.generatedClauses}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewContractModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30"
                >
                  Emitir y Enviar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VERIFICAR TITULO CON IA & OCR */}
      {verifyTitleModalOpen && selectedPropToVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setVerifyTitleModalOpen(false);
                setVerificationResult(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Verificación Legal de Folio Real (IA + OCR)</h3>
                <p className="text-xs text-slate-400">{selectedPropToVerify.titulo}</p>
              </div>
            </div>

            {verificationResult ? (
              <div className="space-y-3 py-2 text-xs">
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-emerald-400 text-sm">Dictamen: {verificationResult.estado?.toUpperCase()}</span>
                    <span className="font-extrabold text-white text-base">Score: {verificationResult.scoreConfianza}/100</span>
                  </div>
                  <p className="text-slate-300 mt-1">{verificationResult.resumenPublico}</p>
                  <p className="text-[11px] text-indigo-300 font-mono mt-2 break-all">
                    Hash Blockchain: {verificationResult.hashCertificado}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setVerifyTitleModalOpen(false);
                    setVerificationResult(null);
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
                >
                  Entendido y Certificado
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Texto Extraído / OCR del Folio Real o Alodial:
                  </label>
                  <textarea
                    rows={4}
                    value={deedOcrText}
                    onChange={(e) => setDeedOcrText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <button
                  onClick={handleVerifyTitle}
                  disabled={verifyingTitle}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{verifyingTitle ? 'Auditando con IA...' : 'Ejecutar Auditoría Notarial'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PAGAR CON STRIPE */}
      {stripePaymentModalOpen && selectedContractToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setStripePaymentModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pasarela de Pagos Stripe</h3>
                <p className="text-xs text-slate-400">Contrato: {selectedContractToPay.inmueble?.titulo}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Monto Alquiler:</span>
                <span className="font-bold text-white">${selectedContractToPay.monto} {selectedContractToPay.moneda}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Comisión Plataforma (5%):</span>
                <span className="font-semibold text-emerald-400">${(Number(selectedContractToPay.monto) * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-200">Total a Debitar:</span>
                <span className="font-black text-white text-sm">${selectedContractToPay.monto} {selectedContractToPay.moneda}</span>
              </div>
            </div>

            <button
              onClick={handlePayRentStripe}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Confirmar Pago Seguro Stripe</span>
            </button>
          </div>
        </div>
      )}

      {/* Contract Sign Modal */}
      {signContractModalOpen && selectedContractToSign && (
        <ContractSignModal
          isOpen={signContractModalOpen}
          onClose={() => {
            setSignContractModalOpen(false);
            loadDashboardData();
          }}
          contrato={selectedContractToSign}
          onSigned={() => loadDashboardData()}
        />
      )}

      {/* Live Chat Modal */}
      {activeChat && (
        <LiveChatModal
          isOpen={!!activeChat}
          onClose={() => setActiveChat(null)}
          targetUserId={
            activeChat.participante1Id === user?.id
              ? activeChat.participante2Id
              : activeChat.participante1Id
          }
          targetUserName={
            activeChat.participante1Id === user?.id
              ? `${activeChat.participante2?.nombre || ''} ${activeChat.participante2?.apellido || ''}`
              : `${activeChat.participante1?.nombre || ''} ${activeChat.participante1?.apellido || ''}`
          }
          inmuebleId={activeChat.inmuebleId}
          inmuebleTitulo={activeChat.inmueble?.titulo}
        />
      )}
    </div>
  );
}
