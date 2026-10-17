import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Check, X, Clock, Trash2, Tag, Megaphone, Plus, Calendar, AlertCircle, ShieldCheck, ShieldAlert, FileText, UploadCloud, RefreshCw, Settings, ChevronDown, ChevronUp, Eye, EyeOff, Edit3 } from 'lucide-react';
import tituloService from '../../services/tituloService';
import BlockchainAuditTrail from '../../components/BlockchainAuditTrail';
import useAlertConfirm from '../../hooks/useAlertConfirm';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import imageCompression from 'browser-image-compression';

// Configurar marker por defecto de Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import './Propiedades.css';
import EditorRecorrido from '../../components/EditorRecorrido';

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const MisInmuebles = () => {
  const { isAuthenticated } = useAuth();
  const { showAlert, showConfirm, ModalComponent } = useAlertConfirm();

  const [inmuebles, setInmuebles] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaToDelete, setMediaToDelete] = useState([]);

  // ─── Estado para panoramas 360° ─────────────────────────────────────
  const [archivos360, setArchivos360] = useState([]);
  const [preview360, setPreview360] = useState([]);
  const [existing360, setExisting360] = useState([]);
  const [meta360, setMeta360] = useState([]); // [{piso: '', habitacion: ''}, ...]
  const [existingMusica, setExistingMusica] = useState(null);
  const [archivoMusica, setArchivoMusica] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ uploading: false, message: '', current: 0, total: 0 });
  const [showGuiaModal, setShowGuiaModal] = useState(false);
  const [guiaPasoActivo, setGuiaPasoActivo] = useState(1);
  const [showEditorRecorrido, setShowEditorRecorrido] = useState(false);
  const [editorInmueble, setEditorInmueble] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: '',
    ciudad: '',
    zona: '',
    calle: '',
    referencia: '',
    valor_activo: '',
    largo: '',
    ancho: '',
    superficie: '',
    habitaciones: 0,
    banos: 0,
    garaje: false,
    estado: 'disponible',
    gps: ''
  });

  const [saving, setSaving] = useState(false);
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [inmuebleHorarioId, setInmuebleHorarioId] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [nuevoHorario, setNuevoHorario] = useState({ dia_semana: 0, hora_inicio: '09:00', hora_fin: '18:00' });
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  const [showPubModal, setShowPubModal] = useState(false);
  const [selectedInmId, setSelectedInmId] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loadingPubs, setLoadingPubs] = useState(false);
  const [savingPub, setSavingPub] = useState(false);
  const [newPubFormData, setNewPubFormData] = useState({
    tipo_oferta: 'alquiler',
    precio: '',
    estado: 'activa'
  });

  const [showVerificacionModal, setShowVerificacionModal] = useState(false);
  const [inmuebleVerificacionId, setInmuebleVerificacionId] = useState(null);
  const [verificacionLoading, setVerificacionLoading] = useState(false);
  const [verificacionData, setVerificacionData] = useState(null);
  const [archivoVerificacion, setArchivoVerificacion] = useState(null);
  const [verificando, setVerificando] = useState(false);

  const DIAS_NOMBRES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const abrirPublicaciones = async (inmId) => {
    setSelectedInmId(inmId);
    setLoadingPubs(true);
    setShowPubModal(true);
    try {
      const res = await api.get('/inmuebles/panel/publicaciones/', { params: { inmueble: inmId } });
      setPublications(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      setPublications([]);
    } finally {
      setLoadingPubs(false);
    }
  };

  const crearPublicacion = async (e) => {
    e.preventDefault();
    if (!newPubFormData.precio || parseFloat(newPubFormData.precio) < 0) {
      alert('Por favor ingrese un precio válido.');
      return;
    }
    setSavingPub(true);
    try {
      await api.post('/inmuebles/panel/publicaciones/', {
        inmueble: selectedInmId,
        tipo_oferta: newPubFormData.tipo_oferta,
        precio: parseFloat(newPubFormData.precio),
        estado: newPubFormData.estado
      });
      // Recargar publicaciones
      const res = await api.get('/inmuebles/panel/publicaciones/', { params: { inmueble: selectedInmId } });
      setPublications(res.data.results || res.data || []);
      // Reset form
      setNewPubFormData({ tipo_oferta: 'alquiler', precio: '', estado: 'activa' });
      // Recargar catálogo de mis inmuebles para reflejar cambios de precio en las tarjetas
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al crear publicación: ' + (err.response?.data?.detail || 'Intente de nuevo.'));
    } finally {
      setSavingPub(false);
    }
  };

  const cambiarEstadoPublicacion = async (pubId, nuevoEstado) => {
    try {
      await api.patch(`/inmuebles/panel/publicaciones/${pubId}/`, { estado: nuevoEstado });
      // Recargar publicaciones
      const res = await api.get('/inmuebles/panel/publicaciones/', { params: { inmueble: selectedInmId } });
      setPublications(res.data.results || res.data || []);
      // Recargar catálogo de mis inmuebles para reflejar cambios
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al cambiar el estado de la publicación.');
    }
  };

  const abrirHorarios = async (inmId) => {
    setInmuebleHorarioId(inmId);
    try {
      const res = await api.get('/inmuebles/horarios/', { params: { inmueble: inmId } });
      setHorarios(res.data.results || res.data || []);
    } catch { setHorarios([]); }
    setShowHorarioModal(true);
  };

  const agregarHorario = async () => {
    if (!nuevoHorario.hora_inicio || !nuevoHorario.hora_fin) return;
    setGuardandoHorario(true);
    try {
      await api.post('/inmuebles/horarios/', {
        ...nuevoHorario,
        inmueble: inmuebleHorarioId,
        hora_inicio: nuevoHorario.hora_inicio + ':00',
        hora_fin: nuevoHorario.hora_fin + ':00',
      });
      const res = await api.get('/inmuebles/horarios/', { params: { inmueble: inmuebleHorarioId } });
      setHorarios(res.data.results || res.data || []);
    } catch (err) {
      showAlert({
        title: 'Error de Horario',
        message: err.response?.data?.detail || 'No se pudo agregar el horario de visitas. Verifica los datos.',
        status: 'error'
      });
    } finally { setGuardandoHorario(false); }
  };

  const eliminarHorario = (horarioId) => {
    showConfirm({
      title: '¿Eliminar horario?',
      message: '¿Estás seguro de que deseas eliminar este horario de visitas?',
      status: 'warning',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await api.delete(`/inmuebles/horarios/${horarioId}/`);
          setHorarios(prev => prev.filter(h => h.id !== horarioId));
          showAlert({ title: '¡Horario eliminado!', message: 'El horario ha sido removido con éxito.', status: 'success' });
        } catch {
          showAlert({ title: 'Error', message: 'No se pudo eliminar el horario.', status: 'error' });
        }
      }
    });
  };

  const abrirVerificacion = async (inmId) => {
    setInmuebleVerificacionId(inmId);
    setVerificacionLoading(true);
    setVerificacionData(null);
    setArchivoVerificacion(null);
    setShowVerificacionModal(true);
    try {
      const data = await tituloService.getResultado(inmId);
      setVerificacionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setVerificacionLoading(false);
    }
  };

  const handleSubirTitulo = async (e) => {
    e.preventDefault();
    if (!archivoVerificacion) return;
    setVerificando(true);
    try {
      const data = await tituloService.subirTitulo(inmuebleVerificacionId, archivoVerificacion);
      setVerificacionData(data);
      showAlert({
        title: '¡Análisis legal completado!',
        message: 'El análisis legal inteligente con IA del título de propiedad finalizó con éxito y el activo se selló automáticamente en la Blockchain.',
        status: 'success'
      });
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert({
        title: 'Error de verificación',
        message: err.response?.data?.error || 'No se pudo verificar el documento.',
        status: 'error'
      });
    } finally {
      setVerificando(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inmRes, tipRes] = await Promise.all([
        api.get('/inmuebles/panel/lista/?personal=true'),
        api.get('/inmuebles/tipos/')
      ]);
      setInmuebles(inmRes.data.results || inmRes.data);
      setTipos(tipRes.data.results || tipRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (type === 'number' && value !== '') {
      value = value.replace(/^-/, '');
      if (Number(value) < 0) return;
    }
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Auto-calcular superficie en tiempo real
      if (name === 'largo' || name === 'ancho') {
        const l = parseFloat(newData.largo);
        const a = parseFloat(newData.ancho);
        if (!isNaN(l) && !isNaN(a)) {
          newData.superficie = (l * a).toFixed(2);
        } else {
          newData.superficie = '';
        }
      }

      return newData;
    });
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    // Acumulamos archivos para permitir múltiples selecciones sucesivas
    setArchivos(prev => [...prev, ...newFiles]);

    // Crear URLs de preview
    const newPreviews = newFiles.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type,
      name: f.name
    }));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (indexToRemove) => {
    setArchivos(prev => prev.filter((_, i) => i !== indexToRemove));
    setPreviewUrls(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const validarDimensionesPano = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const ancho = img.naturalWidth;
        const alto = img.naturalHeight;
        const relacion = ancho / alto;

        // El estándar equirectangular 360° perfecto es 2:1.
        // Se ha flexibilizado enormemente el rango (de 1.2 a 5.0) para permitir panorámicas 
        // extremadamente largas capturadas por smartphones sin apps de Photo Sphere.
        if (relacion >= 1.2 && relacion <= 5.0) {
          resolve({ valido: true, relacion, ancho, alto });
        } else {
          resolve({ valido: false, relacion, ancho, alto });
        }
      };
      img.onerror = () => {
        resolve({ valido: false, error: true });
      };
    });
  };

  const handleFile360Change = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const archivosValidos = [];
    const previewsValidos = [];
    const metasValidas = [];

    setUploadProgress({ uploading: true, message: 'Optimizando imágenes para subida rápida...', current: 0, total: selectedFiles.length });

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadProgress(prev => ({ ...prev, current: i + 1 }));
      const check = await validarDimensionesPano(file);
      if (check.valido) {
        try {
          const options = {
            maxSizeMB: 4.5,
            maxWidthOrHeight: 8192,
            useWebWorker: true,
            initialQuality: 0.85
          };
          const compressedBlob = await imageCompression(file, options);
          const compressedFile = new File([compressedBlob], file.name, { type: file.type });

          archivosValidos.push(compressedFile);
          previewsValidos.push(URL.createObjectURL(compressedFile));
          metasValidas.push({ piso: '', habitacion: '' });
        } catch (error) {
          console.error("Error al comprimir imagen", error);
          alert(`No se pudo comprimir la imagen ${file.name}`);
        }
      } else {
        alert(
          `⚠️ Archivo inválido: "${file.name}"\n\n` +
          `Para que el visor 360° funcione correctamente sin distorsiones, la foto debe ser panorámica (proporción cercana a 2:1, es decir, el doble de ancho que de alto).\n\n` +
          `• Proporción detectada: ${(check.relacion || 0).toFixed(2)}:1 (${check.ancho}x${check.alto}px).\n` +
          `• Por favor, captura la foto usando el modo "Panorámica" (PANO) de tu móvil y vuelve a intentarlo.`
        );
      }
    }

    setUploadProgress({ uploading: false, message: '', current: 0, total: 0 });

    if (archivosValidos.length > 0) {
      setArchivos360(prev => [...prev, ...archivosValidos]);
      setPreview360(prev => [...prev, ...previewsValidos]);
      setMeta360(prev => [...prev, ...metasValidas]);
    }
  };

  const handleMeta360Change = (index, field, value) => {
    setMeta360(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const removeFile360 = (indexToRemove) => {
    setArchivos360(prev => prev.filter((_, i) => i !== indexToRemove));
    setPreview360(prev => prev.filter((_, i) => i !== indexToRemove));
    setMeta360(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleEdit = async (inm) => {
    try {
      setLoading(true);
      const res = await api.get(`/inmuebles/lista/${inm.id}/`);
      const detailedInm = res.data;

      setEditingId(detailedInm.id);
      setFormData({
        titulo: detailedInm.titulo || '',
        descripcion: detailedInm.descripcion || '',
        tipo: detailedInm.tipo || (tipos.length > 0 ? tipos[0].id : ''),
        ciudad: detailedInm.direccion?.ciudad || '',
        zona: detailedInm.direccion?.zona || '',
        calle: detailedInm.direccion?.calle || '',
        referencia: detailedInm.direccion?.referencia || '',
        valor_activo: detailedInm.valor_activo || '',
        largo: detailedInm.largo || '',
        ancho: detailedInm.ancho || '',
        superficie: detailedInm.superficie || '',
        habitaciones: detailedInm.habitaciones || 0,
        banos: detailedInm.banos || 0,
        garaje: detailedInm.garaje || false,
        estado: detailedInm.estado || 'disponible',
        gps: detailedInm.gps || ''
      });
      setArchivos([]);
      setPreviewUrls([]);
      // Separar multimedia normal de panoramas 360°
      const allMultimedia = detailedInm.multimedia || [];
      setExistingMedia(allMultimedia.filter(m => m.tipo !== 'panorama360' && m.tipo !== 'musica'));
      setExisting360(allMultimedia.filter(m => m.tipo === 'panorama360'));
      setExistingMusica(allMultimedia.find(m => m.tipo === 'musica') || null);
      setArchivoMusica(null);
      setArchivos360([]);
      setPreview360([]);
      setMeta360([]);
      setMediaToDelete([]);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      showAlert({
        title: 'Error de Carga',
        message: 'No se pudieron obtener los detalles del inmueble seleccionado. Inténtalo de nuevo.',
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar etiquetas de panoramas 360
    if (archivos360.length > 0) {
      for (let i = 0; i < archivos360.length; i++) {
        const meta = meta360[i];
        if (!meta || !meta.piso.trim() || !meta.habitacion.trim()) {
          alert('Por favor, completa el Piso y el Nombre de Habitación para TODAS las fotos panorámicas 360°.');
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = { ...formData };

      payload.direccion = {
        ciudad: payload.ciudad || '',
        zona: payload.zona || '',
        calle: payload.calle || '',
        referencia: payload.referencia || ''
      };
      delete payload.ciudad;
      delete payload.zona;
      delete payload.calle;
      delete payload.referencia;

      if (payload.superficie === '') payload.superficie = null;
      if (payload.largo === '') payload.largo = null;
      if (payload.ancho === '') payload.ancho = null;

      let nuevoInmuebleId;
      if (editingId) {
        await api.put(`/inmuebles/panel/lista/${editingId}/`, payload);
        nuevoInmuebleId = editingId;

        if (mediaToDelete.length > 0) {
          const deletePromises = mediaToDelete.map(mediaId =>
            api.delete(`/inmuebles/multimedia/${mediaId}/`)
          );
          await Promise.all(deletePromises);
        }
      } else {
        const res = await api.post('/inmuebles/panel/lista/', payload);
        nuevoInmuebleId = res.data.id;
      }

      // Subir imágenes/videos a Cloudinary vía el backend
      if (archivos.length > 0) {
        const currentPrincipalExists = existingMedia.some(m => m.principal);
        const uploadPromises = archivos.map(async (file, i) => {
          const mediaForm = new FormData();
          mediaForm.append('inmueble', nuevoInmuebleId);
          mediaForm.append('archivo', file);
          mediaForm.append('principal', (!currentPrincipalExists && i === 0) ? 'true' : 'false');
          mediaForm.append('tipo', file.type.startsWith('video/') ? 'video' : 'imagen');

          return api.post('/inmuebles/multimedia/', mediaForm, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        });
        await Promise.all(uploadPromises);
      }

      // Subir panoramas 360° a Cloudinary vía el backend
      if (archivos360.length > 0) {
        setUploadProgress({ uploading: true, message: 'Subiendo panoramas 360°...', current: 1, total: archivos360.length });
        for (let i = 0; i < archivos360.length; i++) {
          setUploadProgress(prev => ({ ...prev, current: i + 1 }));
          const file = archivos360[i];
          const mediaForm = new FormData();
          mediaForm.append('inmueble', nuevoInmuebleId);
          mediaForm.append('archivo', file);
          mediaForm.append('principal', 'false');
          mediaForm.append('tipo', 'panorama360');
          const metaItem = meta360[i];
          mediaForm.append('descripcion', `${metaItem.piso.trim()} | ${metaItem.habitacion.trim()}`);

          await api.post('/inmuebles/multimedia/', mediaForm, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        setUploadProgress({ uploading: false, message: '', current: 0, total: 0 });
      }

      // Subir archivo de música si se ha seleccionado uno nuevo
      if (archivoMusica) {
        if (existingMusica) {
          try {
            await api.delete(`/inmuebles/multimedia/${existingMusica.id}/`);
          } catch (err) {
            console.warn("No se pudo borrar la música anterior:", err);
          }
        }
        
        const mediaForm = new FormData();
        mediaForm.append('inmueble', nuevoInmuebleId);
        mediaForm.append('archivo', archivoMusica);
        mediaForm.append('principal', 'false');
        mediaForm.append('tipo', 'musica');
        mediaForm.append('descripcion', 'Música de fondo VR');

        await api.post('/inmuebles/multimedia/', mediaForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowModal(false);
      setEditingId(null);
      setExistingMedia([]);
      setExisting360([]);
      setExistingMusica(null);
      setArchivoMusica(null);
      setMediaToDelete([]);
      setFormData({
        titulo: '', descripcion: '', tipo: tipos.length > 0 ? tipos[0].id : '',
        ciudad: '', zona: '', calle: '', referencia: '', valor_activo: '', largo: '', ancho: '', superficie: '',
        habitaciones: 0, banos: 0, garaje: false, estado: 'disponible',
        gps: ''
      });
      setArchivos([]);
      setPreviewUrls([]);
      setArchivos360([]);
      setPreview360([]);
      setMeta360([]);
      fetchData(); // Recargar
      showAlert({
        title: editingId ? '¡Inmueble Actualizado!' : '¡Inmueble Registrado!',
        message: editingId ? 'Los datos de tu propiedad han sido modificados exitosamente.' : 'Tu nuevo inmueble ha sido registrado y publicado exitosamente en la plataforma.',
        status: 'success'
      });
    } catch (err) {
      console.error(err);
      showAlert({
        title: 'Error de registro',
        message: 'No se pudo guardar la información del inmueble.',
        status: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    showConfirm({
      title: '¿Eliminar Inmueble?',
      message: '¿Estás seguro de que deseas eliminar este inmueble? Esta acción borrará todas sus fotos y datos de forma permanente.',
      status: 'error',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await api.delete(`/inmuebles/panel/lista/${id}/`);
          fetchData();
          showAlert({
            title: '¡Inmueble Eliminado!',
            message: 'La propiedad ha sido eliminada del sistema con éxito.',
            status: 'success'
          });
        } catch (err) {
          console.error(err);
          showAlert({
            title: 'Error al eliminar',
            message: 'Hubo un problema al intentar eliminar el inmueble.',
            status: 'error'
          });
        }
      }
    });
  };

  const handleToggleVisibilidad = async (inm) => {
    try {
      const nuevoEstado = inm.estado === 'oculto' ? 'disponible' : 'oculto';
      await api.patch(`/inmuebles/panel/lista/${inm.id}/`, { estado: nuevoEstado });
      fetchData();
      showAlert({
        title: 'Estado Actualizado',
        message: nuevoEstado === 'oculto' ? 'El inmueble ha sido ocultado del catálogo público.' : 'El inmueble ahora es visible para todos en el catálogo.',
        status: 'success'
      });
    } catch (err) {
      console.error(err);
      showAlert({
        title: 'Error de cambio de estado',
        message: 'No se pudo cambiar la visibilidad del inmueble.',
        status: 'error'
      });
    }
  };

  const estadoColors = {
    disponible: { bg: '#dcfce7', color: '#15803d' },
    ocupado: { bg: '#fee2e2', color: '#dc2626' },
    mantenimiento: { bg: '#fef3c7', color: '#d97706' },
    reservado: { bg: '#dbeafe', color: '#2563eb' },
    oculto: { bg: '#f3f4f6', color: '#6b7280' },
  };

  return (
    <div className="propiedades-page" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', paddingTop: '20px' }}>
      {uploadProgress.uploading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 99999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#fff', padding: '20px', textAlign: 'center'
        }}>
          <div style={{ background: '#1e293b', padding: '40px', borderRadius: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <div style={{
              width: '60px', height: '60px', border: '5px solid rgba(255,255,255,0.1)', borderTopColor: '#8b5cf6',
              borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px auto'
            }}></div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 'bold' }}>{uploadProgress.message}</h3>
            {uploadProgress.total > 0 && (
              <>
                <p style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#cbd5e1' }}>
                  Procesando {uploadProgress.current} de {uploadProgress.total} panorámicas...
                </p>
                <div style={{ width: '100%', height: '10px', background: '#334155', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', transition: 'width 0.4s ease' }}></div>
                </div>
              </>
            )}
            <p style={{ marginTop: '24px', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1.5 }}>
              ⚠️ Por favor, mantén esta aplicación abierta y la pantalla encendida.
            </p>
          </div>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}


      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-text)', margin: 0 }}>Mis Inmuebles</h1>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  titulo: '', descripcion: '', tipo: tipos.length > 0 ? tipos[0].id : '',
                  ciudad: '', zona: '', calle: '', referencia: '', valor_activo: '', largo: '', ancho: '', superficie: '',
                  habitaciones: 0, banos: 0, garaje: false, estado: 'disponible',
                  gps: ''
                });
                setArchivos([]);
                setPreviewUrls([]);
                setExistingMedia([]);
                setExisting360([]);
                setExistingMusica(null);
                setArchivoMusica(null);
                setArchivos360([]);
                setPreview360([]);
                setMeta360([]);
                setMediaToDelete([]);
                setShowModal(true);
              }}
              style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Registrar Inmueble
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Cargando tus inmuebles...</div>
          ) : inmuebles.length === 0 ? (
            <div style={{ background: '#fff', padding: '60px 20px', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-bg)', color: 'var(--color-primary)', marginBottom: '16px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </div>
              <h2 style={{ margin: '0 0 8px 0', color: 'var(--color-text)' }}>No tienes inmuebles registrados</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Tus propiedades publicadas aparecerán aquí y en el catálogo público.</p>
              <button
                onClick={() => {
                  if (tipos.length > 0 && !formData.tipo) setFormData(p => ({ ...p, tipo: tipos[0].id }));
                  setExistingMusica(null);
                  setArchivoMusica(null);
                  setShowModal(true);
                }}
                style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Registrar mi primer Inmueble
              </button>
            </div>
          ) : (
            <div className="propiedades-grid">
              {inmuebles.map(inm => {
                const estadoStyle = estadoColors[inm.estado] || estadoColors.disponible;
                return (
                  <div key={inm.id} className="propiedad-card">
                    <div className="propiedad-card__image" style={{ height: '200px', position: 'relative' }}>
                      {inm.imagen_principal ? (
                        <img src={inm.imagen_principal} alt={inm.titulo} />
                      ) : (
                        <div className="propiedad-card__placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
                        <span className="propiedad-card__badge" style={{ background: estadoStyle.bg, color: estadoStyle.color, position: 'static' }}>
                          {inm.estado}
                        </span>
                        {inm.verificacion_estado && (
                          <span
                            className="propiedad-card__badge"
                            style={{
                              background: inm.verificacion_estado === 'verificado' ? '#dcfce7' :
                                inm.verificacion_estado === 'observado' ? '#fef3c7' : '#fee2e2',
                              color: inm.verificacion_estado === 'verificado' ? '#15803d' :
                                inm.verificacion_estado === 'observado' ? '#d97706' : '#dc2626',
                              position: 'static',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 700
                            }}
                          >
                            {inm.verificacion_estado === 'verificado' ? '✓ Título Ok' :
                              inm.verificacion_estado === 'observado' ? '⚠ Obs. Título' : '✗ Inválido'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="propiedad-card__body">
                      <h3 className="propiedad-card__title">{inm.titulo}</h3>
                      <p className="propiedad-card__location">{inm.ciudad}{inm.zona ? `, ${inm.zona}` : ''}</p>

                      <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <span className="propiedad-card__price" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            {inm.precio ? (
                              <>{`Bs. ${parseFloat(inm.precio).toLocaleString()}`}
                                {inm.tipo_oferta === 'alquiler' && <small style={{ fontSize: '0.75rem', fontWeight: 'normal', marginLeft: '4px' }}>/mes</small>}
                                {inm.tipo_oferta === 'anticretico' && <small style={{ fontSize: '0.75rem', fontWeight: 'normal', marginLeft: '4px' }}>(Anticrético)</small>}
                              </>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, background: '#fef3c7', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fde68a' }}>
                                <AlertCircle size={13} /> Sin publicación activa
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Botones principales de la tarjeta */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <Link
                            to={`/propiedades/${inm.id}`}
                            className="propiedad-card__cta"
                            style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '0.85rem' }}
                          >
                            Ver Detalles
                          </Link>

                          <button
                            type="button"
                            className={`propiedad-card__admin-toggle ${expandedCardId === inm.id ? 'propiedad-card__admin-toggle--active' : ''}`}
                            onClick={() => setExpandedCardId(expandedCardId === inm.id ? null : inm.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              background: '#ffffff',
                              border: '1px solid var(--color-border)',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              color: 'var(--color-text-secondary)',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            <Settings size={16} />
                            <span>Gestionar</span>
                            {expandedCardId === inm.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>

                        {/* PANEL DE DESGLOSE ADMINISTRATIVO (COLLAPSIBLE) */}
                        {expandedCardId === inm.id && (
                          <div className="propiedad-card__admin-pane" style={{
                            marginTop: '12px',
                            background: 'var(--color-bg-secondary)',
                            borderRadius: '8px',
                            padding: '12px',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            animation: 'slideDown var(--transition-fast) ease-out'
                          }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                              Acciones de Administración
                            </span>

                            <button
                              type="button"
                              onClick={() => abrirPublicaciones(inm.id)}
                              className="propiedad-card__admin-btn"
                              style={{ color: '#10b981' }}
                            >
                              <Tag size={16} />
                              <span>Publicar / Ofertas</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => abrirVerificacion(inm.id)}
                              className="propiedad-card__admin-btn"
                              style={{
                                color: inm.verificacion_estado === 'verificado' ? '#10b981' :
                                  inm.verificacion_estado === 'observado' ? '#eab308' :
                                    inm.verificacion_estado === 'rechazado' ? '#ef4444' : 'var(--color-text-secondary)'
                              }}
                            >
                              {inm.verificacion_estado === 'verificado' ? <ShieldCheck size={16} /> : <FileText size={16} />}
                              <span>Análisis Legal de Título (IA)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => abrirHorarios(inm.id)}
                              className="propiedad-card__admin-btn"
                              style={{ color: '#0ea5e9' }}
                            >
                              <Clock size={16} />
                              <span>Gestionar Horarios de Visita</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditorInmueble(inm);
                                setShowEditorRecorrido(true);
                              }}
                              className="propiedad-card__admin-btn"
                              style={{ color: '#6366f1' }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                <path d="M2 12h20" />
                              </svg>
                              <span>Recorrido 3D y Hotspots (IA)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEdit(inm)}
                              className="propiedad-card__admin-btn"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              <Edit3 size={16} />
                              <span>Editar Información Ficha</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleVisibilidad(inm)}
                              className="propiedad-card__admin-btn"
                              style={{ color: inm.estado === 'oculto' ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                            >
                              {inm.estado === 'oculto' ? <Eye size={16} /> : <EyeOff size={16} />}
                              <span>{inm.estado === 'oculto' ? 'Publicar Inmueble' : 'Ocultar Inmueble'}</span>
                            </button>

                            <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }}></div>

                            <button
                              type="button"
                              onClick={() => handleDelete(inm.id)}
                              className="propiedad-card__admin-btn propiedad-card__admin-btn--danger"
                            >
                              <Trash2 size={16} />
                              <span>Eliminar Publicación</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '700px',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{editingId ? 'Editar Inmueble' : 'Registrar Inmueble'}</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >&times;</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <form id="inmuebleForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Título *</label>
                    <input required type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Tipo *</label>
                    <select required name="tipo" value={formData.tipo} onChange={handleChange} className="propiedades-filter__select" style={{ width: '100%' }}>
                      {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Ciudad *</label>
                    <input required type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Zona</label>
                    <input type="text" name="zona" value={formData.zona} onChange={handleChange} className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Calle *</label>
                    <input required type="text" name="calle" value={formData.calle} onChange={handleChange} className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Referencia</label>
                    <input type="text" name="referencia" value={formData.referencia} onChange={handleChange} className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Largo (m) *</label>
                    <input required type="number" min="0" step="0.01" name="largo" value={formData.largo} onChange={handleChange} className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Ancho (m) *</label>
                    <input required type="number" min="0" step="0.01" name="ancho" value={formData.ancho} onChange={handleChange} className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Superficie (m²)</label>
                    <input type="text" value={formData.superficie} disabled placeholder="Calculado auto." className="propiedades-filter__input" style={{ width: '100%', background: '#f8fafc', color: '#64748b', fontWeight: 600 }} />
                  </div>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400e' }}>
                      Valor del Activo (Bs)
                    </label>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '20px', border: '1px solid #fde68a', textTransform: 'uppercase' }}>
                      Interno
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '10px', lineHeight: '1.4' }}>
                    Valor catastral o de referencia del activo físico (DDRR). No se muestra en el catálogo público.
                  </p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="valor_activo"
                    value={formData.valor_activo}
                    onChange={handleChange}
                    placeholder="Ej: 350000"
                    className="propiedades-filter__input"
                    style={{ width: '100%', maxWidth: '280px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Habitaciones</label>
                    <input type="number" min="0" name="habitaciones" value={formData.habitaciones} onChange={handleChange} className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Baños</label>
                    <input type="number" min="0" name="banos" value={formData.banos} onChange={handleChange} className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" name="garaje" checked={formData.garaje} onChange={handleChange} />
                      Tiene Garaje
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4" className="propiedades-filter__input" style={{ width: '100%', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    Ubicación GPS
                  </label>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                    Haz clic en el mapa para marcar la ubicación, o usa tu ubicación actual.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => setFormData(prev => ({ ...prev, gps: `${pos.coords.latitude}, ${pos.coords.longitude}` })),
                          () => showAlert({
                            title: 'Permiso Denegado',
                            message: 'No se pudo acceder a tu ubicación actual. Por favor, verifica los permisos en tu navegador.',
                            status: 'warning'
                          })
                        );
                      }
                    }}
                    style={{ marginBottom: '16px', background: 'var(--color-secondary, #475569)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} /> Usar mi ubicación actual
                    </span>
                  </button>

                  <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    {(() => {
                      let lat = -17.7833;
                      let lng = -63.1821;
                      if (formData.gps) {
                        const parts = formData.gps.split(',');
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                          lat = parseFloat(parts[0]);
                          lng = parseFloat(parts[1]);
                        }
                      }
                      const position = formData.gps ? [lat, lng] : null;

                      return (
                        <MapContainer center={[lat, lng]} zoom={formData.gps ? 15 : 12} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <LocationPicker
                            position={position}
                            setPosition={(p) => setFormData(prev => ({ ...prev, gps: `${p[0]}, ${p[1]}` }))}
                          />
                        </MapContainer>
                      );
                    })()}
                  </div>
                  {formData.gps && (
                    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--color-success, #10b981)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={14} /> Ubicación registrada ({formData.gps})
                    </div>
                  )}
                </div>

                <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    Imágenes y Videos
                  </label>

                  {existingMedia.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Archivos actuales:</p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {existingMedia.map((media, i) => (
                          <div key={media.id} style={{ width: '100px', position: 'relative' }}>
                            {media.tipo === 'video' ? (
                              <video src={media.archivo} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                            ) : (
                              <img src={media.archivo} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} alt={`existing-${i}`} />
                            )}
                            {media.principal && (
                              <span style={{ position: 'absolute', bottom: '4px', left: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '2px', borderRadius: '4px' }}>Principal</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setMediaToDelete(prev => [...prev, media.id]);
                                setExistingMedia(prev => prev.filter(m => m.id !== media.id));
                              }}
                              style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--color-danger, #ef4444)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                              title="Eliminar archivo existente"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                    Sube {existingMedia.length > 0 ? 'más ' : ''}fotografías o videos de tu inmueble. La primera imagen será usada como la principal. Serán subidos a Cloudinary.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ display: 'block', width: '100%', padding: '8px' }}
                  />
                  {previewUrls.length > 0 && (
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {previewUrls.map((preview, i) => (
                        <div key={i} style={{ width: '100px', position: 'relative' }}>
                          {preview.type.startsWith('video/') ? (
                            <video src={preview.url} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                          ) : (
                            <img src={preview.url} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} alt={`prev-${i}`} />
                          )}
                          {i === 0 && (
                            <span style={{ position: 'absolute', bottom: '4px', left: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '2px', borderRadius: '4px' }}>Principal</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--color-danger, #ef4444)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ─── Sección de Fotos Panorámicas 360° (RF-40) ─── */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  marginTop: '16px',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                          <path d="M2 12h20" />
                        </svg>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>Fotos Panorámicas 360°</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Agrega un recorrido interactivo a tu propiedad</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setGuiaPasoActivo(1);
                        setShowGuiaModal(true);
                      }}
                      style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#6366f1',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '20px',
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      ¿Cómo capturar con mi móvil?
                    </button>
                  </div>

                  {/* Panoramas existentes */}
                  {existing360.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Panoramas 360° actuales:</p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {existing360.map((media, i) => {
                          let labelPiso = 'Piso 1';
                          let labelHab = 'Vista 360°';
                          if (media.descripcion && media.descripcion.includes('|')) {
                            const partes = media.descripcion.split('|');
                            labelPiso = partes[0].trim();
                            labelHab = partes[1]?.trim() || 'Vista 360°';
                          }
                          return (
                            <div key={media.id} style={{
                              width: '120px',
                              position: 'relative',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: '1px solid var(--color-border)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                              <img src={media.archivo} crossOrigin="anonymous" style={{ width: '120px', height: '90px', objectFit: 'cover' }} alt={`existing-360-${i}`} />
                              <div style={{
                                padding: '4px 6px',
                                background: 'rgba(255, 255, 255, 0.95)',
                                fontSize: '0.7rem',
                                color: 'var(--color-text)',
                                borderTop: '1px solid var(--color-border)'
                              }}>
                                <div style={{ fontWeight: 700, color: '#4f46e5' }}>{labelPiso}</div>
                                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{labelHab}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setMediaToDelete(prev => [...prev, media.id]);
                                  setExisting360(prev => prev.filter(m => m.id !== media.id));
                                }}
                                style={{
                                  position: 'absolute', top: '4px', right: '4px',
                                  background: 'rgba(239, 68, 68, 0.9)', color: '#fff',
                                  border: 'none', borderRadius: '50%',
                                  width: '22px', height: '22px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                  transition: 'background 0.2s'
                                }}
                                title="Eliminar panorama existente"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                    Sube imágenes en formato <strong>equirectangular (panorámicas 360°)</strong>. Especifica el piso y el nombre de la habitación para que los usuarios puedan navegar entre ellas.
                  </p>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFile360Change}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      marginBottom: '16px'
                    }}
                  />

                  {/* Previews de nuevos panoramas con edición de metadatos */}
                  {preview360.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {preview360.map((url, i) => {
                        const meta = meta360[i] || { piso: '', habitacion: '' };
                        const errorPiso = !meta.piso.trim();
                        const errorHabitacion = !meta.habitacion.trim();

                        return (
                          <div key={i} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            background: '#fff',
                            borderRadius: '12px',
                            border: `1px solid ${errorPiso || errorHabitacion ? '#f87171' : 'rgba(99, 102, 241, 0.15)'}`,
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s'
                          }}>
                            {/* Miniatura */}
                            <div style={{ width: '100%', height: '140px', position: 'relative' }}>
                              <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`new-360-preview-${i}`} />
                              <span style={{
                                position: 'absolute', top: '8px', left: '8px',
                                background: 'rgba(99, 102, 241, 0.9)', color: '#fff',
                                fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', fontWeight: 600
                              }}>Panorama {i + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeFile360(i)}
                                style={{
                                  position: 'absolute', top: '8px', right: '8px',
                                  background: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#fff',
                                  padding: '6px', borderRadius: '50%', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Remover"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* Controles de metadatos */}
                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: errorPiso ? '#ef4444' : 'var(--color-text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                                  Piso *
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Piso 1, Planta Baja"
                                  required
                                  value={meta.piso}
                                  onChange={(e) => handleMeta360Change(i, 'piso', e.target.value)}
                                  style={{
                                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                                    border: `1px solid ${errorPiso ? '#fca5a5' : 'var(--color-border)'}`,
                                    fontSize: '0.9rem', outline: 'none'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: errorHabitacion ? '#ef4444' : 'var(--color-text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                                  Habitación / Zona *
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Sala principal, Terraza"
                                  required
                                  value={meta.habitacion}
                                  onChange={(e) => handleMeta360Change(i, 'habitacion', e.target.value)}
                                  style={{
                                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                                    border: `1px solid ${errorHabitacion ? '#fca5a5' : 'var(--color-border)'}`,
                                    fontSize: '0.9rem', outline: 'none'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ─── Música de Fondo para Recorrido VR ─── */}
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed rgba(99, 102, 241, 0.2)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                      Música de Fondo (Modo VR)
                    </h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Sube una pista de audio (.mp3, .wav) para ambientar la experiencia virtual en 360°.
                    </p>

                    {/* Mostrar música existente */}
                    {existingMusica && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <span style={{ color: '#10b981', display: 'flex' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M9 18V5l12-2v13" />
                              <circle cx="6" cy="18" r="3" />
                              <circle cx="18" cy="16" r="3" />
                            </svg>
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            Música de fondo activa
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaToDelete(prev => [...prev, existingMusica.id]);
                            setExistingMusica(null);
                          }}
                          style={{
                            background: 'none', border: 'none', color: '#ef4444',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px'
                          }}
                          title="Eliminar música"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setArchivoMusica(file);
                        }
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    />
                    {archivoMusica && (
                      <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✓ Seleccionado: {archivoMusica.name}</span>
                        <button
                          type="button"
                          onClick={() => setArchivoMusica(null)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                        >
                          (Quitar)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--color-bg)' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                form="inmuebleForm"
                type="submit"
                disabled={saving}
                style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Guardando...' : (editingId ? 'Actualizar Inmueble' : 'Guardar Inmueble')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Asistente de Captura Móvil (Guía 360°) ─── */}
      {showGuiaModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '24px', width: '100%', maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: '1px solid rgba(99, 102, 241, 0.1)',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>Guía de Captura Móvil 360°</h3>
              </div>
              <button
                onClick={() => setShowGuiaModal(false)}
                style={{
                  background: 'rgba(99, 102, 241, 0.05)', border: 'none',
                  fontSize: '1.2rem', cursor: 'pointer', color: '#64748b',
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'}
              >&times;</button>
            </div>

            {/* Progreso en la cabecera */}
            <div style={{ display: 'flex', height: '4px', background: '#e2e8f0' }}>
              {[1, 2, 3, 4].map(step => (
                <div key={step} style={{
                  flex: 1,
                  background: step <= guiaPasoActivo ? 'linear-gradient(90deg, #6366f1, #a855f7)' : 'transparent',
                  transition: 'background 0.3s ease'
                }} />
              ))}
            </div>

            {/* Contenido del Paso */}
            <div style={{ padding: '30px 24px', flex: 1, overflowY: 'auto' }}>

              {guiaPasoActivo === 1 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.1)'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px', color: '#1e293b' }}>Paso 1: Usa la Cámara de tu Celular</h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                    Para obtener la mejor resolución y evitar distorsiones en el visor esférico, utiliza la <strong>aplicación de cámara oficial</strong> que viene instalada en tu smartphone (iPhone o Android).
                  </p>
                </div>
              )}

              {guiaPasoActivo === 2 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(168, 85, 247, 0.1)'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px', color: '#1e293b' }}>Paso 2: Activa el Modo "Panorámica"</h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                    Abre tu cámara y desliza los modos de captura hasta encontrar <strong>"PANO" o "Panorámica"</strong>.<br />
                    Sujeta el teléfono en <strong>posición vertical (retrato)</strong>. Esto te dará un campo de visión vertical mucho más amplio y detallado del espacio.
                  </p>
                </div>
              )}

              {guiaPasoActivo === 3 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.1)'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px', color: '#1e293b' }}>Paso 3: Gira despacio sobre tu propio Eje</h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                    Párate en el centro de la habitación. Presiona el botón de captura y <strong>gira lentamente en círculo 360 grados</strong>.<br />
                    Intenta mantener el teléfono al mismo nivel y sigue la línea guía en pantalla para evitar costuras desalineadas o curvas.
                  </p>
                </div>
              )}

              {guiaPasoActivo === 4 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px', color: '#1e293b' }}>Paso 4: Guarda y Sube el archivo</h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                    Tu celular procesará la imagen guardándola en tu galería con la proporción perfecta <strong>(proporción panorámica 2:1)</strong>.<br />
                    Presiona el botón de selección de fotos en esta pantalla, selecciónala y ¡listo! Nuestro motor 360° se encargará del resto de forma automática.
                  </p>
                </div>
              )}
            </div>

            {/* Footer / Controles */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(99, 102, 241, 0.1)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f8fafc'
            }}>
              {/* Botón Atrás */}
              <button
                type="button"
                onClick={() => setGuiaPasoActivo(p => Math.max(1, p - 1))}
                disabled={guiaPasoActivo === 1}
                style={{
                  background: 'transparent',
                  color: guiaPasoActivo === 1 ? '#cbd5e1' : '#64748b',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: guiaPasoActivo === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                &larr; Atrás
              </button>

              {/* Indicadores de puntos */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4].map(step => (
                  <div
                    key={step}
                    onClick={() => setGuiaPasoActivo(step)}
                    style={{
                      width: guiaPasoActivo === step ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: guiaPasoActivo === step ? '#6366f1' : '#cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>

              {/* Botón Siguiente / Entendido */}
              {guiaPasoActivo < 4 ? (
                <button
                  type="button"
                  onClick={() => setGuiaPasoActivo(p => Math.min(4, p + 1))}
                  style={{
                    background: 'var(--color-primary, #6366f1)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(99, 102, 241, 0.15)'
                  }}
                >
                  Siguiente &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGuiaModal(false)}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  ¡Entendido!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showHorarioModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Horarios de visita</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Define cuándo pueden agendar visitas a este inmueble
                </p>
              </div>
              <button onClick={() => setShowHorarioModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
                &times;
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {/* Formulario para agregar horario */}
              <div style={{
                background: '#f8fafc', borderRadius: '12px', padding: '16px',
                marginBottom: '20px', border: '1px solid #e2e8f0',
              }}>
                <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                  Agregar disponibilidad
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>Día</label>
                    <select
                      value={nuevoHorario.dia_semana}
                      onChange={e => setNuevoHorario(p => ({ ...p, dia_semana: parseInt(e.target.value) }))}
                      className="propiedades-filter__select" style={{ width: '100%' }}
                    >
                      {DIAS_NOMBRES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>Desde</label>
                    <input type="time" value={nuevoHorario.hora_inicio}
                      onChange={e => setNuevoHorario(p => ({ ...p, hora_inicio: e.target.value }))}
                      className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>Hasta</label>
                    <input type="time" value={nuevoHorario.hora_fin}
                      onChange={e => setNuevoHorario(p => ({ ...p, hora_fin: e.target.value }))}
                      className="propiedades-filter__input" style={{ width: '100%' }} />
                  </div>
                  <button onClick={agregarHorario} disabled={guardandoHorario}
                    style={{
                      background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '10px 16px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
                    }}>
                    {guardandoHorario ? '...' : '+ Agregar'}
                  </button>
                </div>
              </div>

              {/* Lista de horarios */}
              {horarios.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.9rem' }}>
                  No has definido horarios aún. Los clientes no podrán agendar visitas sin horarios.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {horarios.map(h => (
                    <div key={h.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          background: '#e0f2fe', color: '#0284c7',
                          padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                        }}>
                          {DIAS_NOMBRES[h.dia_semana]}
                        </span>
                        <span style={{ color: '#334155', fontSize: '0.9rem', fontWeight: 500 }}>
                          {h.hora_inicio?.slice(0, 5)} — {h.hora_fin?.slice(0, 5)}
                        </span>
                      </div>
                      <button onClick={() => eliminarHorario(h.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{
              padding: '16px 24px', borderTop: '1px solid var(--color-border)',
              background: '#f8fafc', display: 'flex', justifyContent: 'flex-end',
            }}>
              <button onClick={() => setShowHorarioModal(false)}
                style={{
                  background: '#0ea5e9', color: '#fff', border: 'none',
                  padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                }}>
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {showPubModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '650px',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid var(--color-border)'
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={20} style={{ color: 'var(--color-primary)' }} />
                    Gestionar Ofertas Comerciales
                  </span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Administra las publicaciones, precios e historial de esta propiedad.
                </p>
              </div>
              <button onClick={() => setShowPubModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >&times;</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <form onSubmit={crearPublicacion} style={{
                background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', borderRadius: '16px', padding: '20px',
                border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '14px'
              }}>
                <p style={{ margin: '0', fontWeight: 700, color: '#065f46', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Crear Nueva Oferta Comercial
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: '130px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#047857', marginBottom: '6px', fontWeight: 600 }}>Tipo de Oferta</label>
                    <select
                      value={newPubFormData.tipo_oferta}
                      onChange={e => setNewPubFormData(p => ({ ...p, tipo_oferta: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                        border: '1px solid rgba(16, 185, 129, 0.3)', background: '#fff', fontSize: '0.9rem'
                      }}
                    >
                      <option value="alquiler">Alquiler</option>
                      <option value="venta">Venta</option>
                      <option value="anticretico">Anticrético</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '130px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#047857', marginBottom: '6px', fontWeight: 600 }}>Precio (Bs)</label>
                    <input type="number" min="0" step="0.01" required value={newPubFormData.precio}
                      onChange={e => setNewPubFormData(p => ({ ...p, precio: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                        border: '1px solid rgba(16, 185, 129, 0.3)', background: '#fff', fontSize: '0.9rem'
                      }}
                      placeholder="Ej. 3500" />
                  </div>
                  <div style={{ flex: 1, minWidth: '130px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#047857', marginBottom: '6px', fontWeight: 600 }}>Estado Inicial</label>
                    <select
                      value={newPubFormData.estado}
                      onChange={e => setNewPubFormData(p => ({ ...p, estado: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                        border: '1px solid rgba(16, 185, 129, 0.3)', background: '#fff', fontSize: '0.9rem'
                      }}
                    >
                      <option value="activa">Activa (Publicada)</option>
                      <option value="borrador">Borrador</option>
                      <option value="pausada">Pausada</option>
                    </select>
                  </div>
                  <button type="submit" disabled={savingPub}
                    style={{
                      background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px',
                      padding: '10px 20px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap',
                      boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)', transition: 'transform 0.1s',
                      display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px'
                    }}>
                    {savingPub ? '...' : '+ Publicar'}
                  </button>
                </div>
                {newPubFormData.estado === 'activa' && (
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.87 }}>
                    <AlertCircle size={12} /> Nota: Activar esta oferta finalizará automáticamente cualquier otra oferta activa existente.
                  </p>
                )}
              </form>

              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Historial de Ofertas Comerciales
                </h3>
                {loadingPubs ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>Cargando ofertas...</div>
                ) : publications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.9rem', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                    Esta propiedad no tiene ofertas registradas. Crea una arriba.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {publications.map(pub => {
                      const isActiva = pub.estado === 'activa';
                      const offerColors = {
                        alquiler: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Alquiler', border: '1px solid rgba(16, 185, 129, 0.2)' },
                        venta: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', label: 'Venta', border: '1px solid rgba(99, 102, 241, 0.2)' },
                        anticretico: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Anticrético', border: '1px solid rgba(245, 158, 11, 0.2)' },
                      };
                      const pubStyle = offerColors[pub.tipo_oferta] || { label: pub.tipo_oferta, color: '#475569', bg: '#f1f5f9', border: '1px solid #cbd5e1' };

                      return (
                        <div key={pub.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '16px', background: isActiva ? 'rgba(16, 185, 129, 0.03)' : '#f8fafc',
                          borderRadius: '14px', border: isActiva ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--color-border)',
                          transition: 'all 0.2s', boxShadow: isActiva ? '0 4px 6px -1px rgba(16, 185, 129, 0.05)' : 'none'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                                background: pubStyle.bg, color: pubStyle.color, border: pubStyle.border
                              }}>
                                {pubStyle.label}
                              </span>
                              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
                                Bs. {parseFloat(pub.precio).toLocaleString()} {pub.tipo_oferta === 'alquiler' ? '/ mes' : pub.tipo_oferta === 'anticretico' ? '(Anticrético)' : ''}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> Creada el {new Date(pub.creado).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <select
                              value={pub.estado}
                              onChange={e => cambiarEstadoPublicacion(pub.id, e.target.value)}
                              style={{
                                padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
                                fontSize: '0.85rem', fontWeight: 600, background: isActiva ? '#dcfce7' : '#f1f5f9',
                                color: isActiva ? '#15803d' : '#475569', cursor: 'pointer'
                              }}
                            >
                              <option value="borrador">Borrador</option>
                              <option value="activa">Activa</option>
                              <option value="pausada">Pausada</option>
                              <option value="finalizada">Finalizada</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={{
              padding: '16px 24px', borderTop: '1px solid var(--color-border)',
              background: '#f8fafc', display: 'flex', justifyContent: 'flex-end',
            }}>
              <button onClick={() => setShowPubModal(false)}
                style={{
                  background: 'var(--color-primary)', color: '#fff', border: 'none',
                  padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                }}>
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerificacionModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 1002,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={22} style={{ color: 'var(--color-primary)' }} /> Verificación de Título con IA
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Análisis legal automático de escrituras y folios reales usando OCR y NLP (Llama 3)
                </p>
              </div>
              <button onClick={() => setShowVerificacionModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
                &times;
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {verificacionLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '12px' }}>
                  <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Obteniendo estado de verificación...</p>
                </div>
              ) : verificando ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '16px' }}>
                  <div className="spinner" style={{
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid var(--color-primary)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>Procesando documento...</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>Extrayendo texto con OCR y ejecutando análisis legal con IA. Esto puede tomar unos segundos.</p>
                  </div>
                </div>
              ) : (!verificacionData || verificacionData.estado === 'no_solicitado' || verificacionData.estado === 'error') ? (
                <form onSubmit={handleSubirTitulo} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {verificacionData?.estado === 'error' && (
                    <div style={{
                      background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
                      padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px'
                    }}>
                      <ShieldAlert size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: '#991b1b', fontSize: '0.9rem' }}>
                          Error al procesar el documento anterior
                        </p>
                        <p style={{ margin: '4px 0 0', color: '#b91c1c', fontSize: '0.82rem' }}>
                          {verificacionData.resumen_publico || 'No se pudo leer el documento. Sube un archivo PDF o imagen legible e inténtalo de nuevo.'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <input
                      type="file"
                      required
                      accept="application/pdf,image/*"
                      onChange={(e) => setArchivoVerificacion(e.target.files[0])}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <UploadCloud size={40} style={{ color: '#94a3b8' }} />
                      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                        {archivoVerificacion ? archivoVerificacion.name : 'Arrastra o selecciona el documento del título'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                        Formatos soportados: PDF, JPG, PNG (máx. 10MB)
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '12px', border: '1px solid #bfdbfe' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.4 }}>
                      💡 <strong>Recomendación:</strong> Para obtener la mejor precisión, sube un documento escaneado con buena iluminación y resolución, de preferencia la matrícula computarizada (Folio Real) o testimonio notarial de propiedad.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!archivoVerificacion}
                    style={{
                      background: archivoVerificacion ? 'var(--color-primary)' : '#cbd5e1',
                      color: '#fff', border: 'none', padding: '12px', borderRadius: '8px',
                      fontWeight: 600, cursor: archivoVerificacion ? 'pointer' : 'not-allowed',
                      transition: 'background 0.2s'
                    }}
                  >
                    Iniciar Verificación Inteligente
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px', borderRadius: '12px',
                    background: verificacionData.estado === 'verificado' ? '#dcfce7' :
                      verificacionData.estado === 'observado' ? '#fef3c7' :
                        verificacionData.estado === 'rechazado' ? '#fee2e2' : '#f1f5f9',
                    border: '1px solid ' + (
                      verificacionData.estado === 'verificado' ? '#bbf7d0' :
                        verificacionData.estado === 'observado' ? '#fef08a' :
                          verificacionData.estado === 'rechazado' ? '#fecaca' : '#cbd5e1'
                    ),
                    color: verificacionData.estado === 'verificado' ? '#14532d' :
                      verificacionData.estado === 'observado' ? '#713f12' :
                        verificacionData.estado === 'rechazado' ? '#7f1d1d' : '#334155'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {verificacionData.estado === 'verificado' ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                          {verificacionData.estado_display}
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.85 }}>
                          Analizado el {new Date(verificacionData.creado).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {verificacionData.score_confianza !== null && (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{verificacionData.score_confianza}</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>/100</span>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', tracking: '0.05em', fontWeight: 600 }}>Confianza</div>
                      </div>
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase' }}>Resumen de la IA</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', fontWeight: 500, fontStyle: 'italic' }}>
                      "{verificacionData.resumen_publico}"
                    </p>
                  </div>

                  {verificacionData.resultado_ia && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>Datos Registrales Detectados</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Tipo de Documento</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{verificacionData.resultado_ia.tipo_documento || 'No detectado'}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Matrícula Inmobiliaria</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{verificacionData.resultado_ia.matricula_inmobiliaria || 'No detectado'}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Propietario Registrado</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{verificacionData.resultado_ia.propietario_registrado || 'No detectado'}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Documento Identidad</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{verificacionData.resultado_ia.documento_identidad || 'No detectado'}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Superficie Registrada</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{verificacionData.resultado_ia.superficie_registrada_m2 ? `${verificacionData.resultado_ia.superficie_registrada_m2} m²` : 'No detectada'}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Ubicación Registrada</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                            {verificacionData.resultado_ia.municipio ? `${verificacionData.resultado_ia.municipio}, ` : ''}
                            {verificacionData.resultado_ia.departamento || ''}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <h5 style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>Gravámenes e Hipotecas</h5>
                        {(!verificacionData.resultado_ia.gravamenes || verificacionData.resultado_ia.gravamenes.length === 0) ? (
                          <div style={{ background: '#f0fdf4', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Check size={16} /> Libre de gravámenes. No se detectaron hipotecas ni cargas legales vigentes.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {verificacionData.resultado_ia.gravamenes.map((grav, i) => (
                              <div key={i} style={{ background: '#fffbeb', color: '#92400e', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #fef08a', display: 'flex', gap: '8px' }}>
                                <span style={{ fontWeight: 'bold' }}>•</span>
                                <span>{grav}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {verificacionData.resultado_ia.alertas && verificacionData.resultado_ia.alertas.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <h5 style={{ margin: 0, fontSize: '0.85rem', color: '#b91c1c', fontWeight: 700 }}>Observaciones / Irregularidades</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {verificacionData.resultado_ia.alertas.map((alerta, i) => (
                              <div key={i} style={{ background: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #fecaca', display: 'flex', gap: '8px' }}>
                                <span style={{ fontWeight: 'bold' }}>⚠</span>
                                <span>{alerta}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '16px' }}>
                    <BlockchainAuditTrail assetId={`INM-${inmuebleVerificacionId}`} />
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a href={verificacionData.archivo_titulo} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      Ver documento original subido
                    </a>
                    <button
                      onClick={() => {
                        setVerificacionData(null);
                        setArchivoVerificacion(null);
                      }}
                      style={{
                        background: 'transparent', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)', borderRadius: '8px', padding: '8px 16px',
                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Volver a Subir Documento
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              padding: '16px 24px', borderTop: '1px solid var(--color-border)',
              background: '#f8fafc', display: 'flex', justifyContent: 'flex-end',
            }}>
              <button onClick={() => setShowVerificacionModal(false)}
                style={{
                  background: 'var(--color-primary)', color: '#fff', border: 'none',
                  padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditorRecorrido && editorInmueble && (
        <EditorRecorrido
          inmuebleId={editorInmueble.id}
          tituloPropiedad={editorInmueble.titulo}
          onClose={() => {
            setShowEditorRecorrido(false);
            setEditorInmueble(null);
          }}
        />
      )}
      {ModalComponent}
    </div>
  );
};

export default MisInmuebles;
