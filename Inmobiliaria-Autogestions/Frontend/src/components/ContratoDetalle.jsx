import { useState, useEffect, useRef } from 'react';
import { 
  FileText, CheckCircle, XCircle, Clock, AlertTriangle, Home, User, Sparkles, Send, Bot, RotateCcw,
  ClipboardList, MessageSquare, Printer, Ban, ShieldCheck, Lightbulb, Calendar, RefreshCw, Zap, History
} from 'lucide-react';
import BlockchainAuditTrail from './BlockchainAuditTrail';
import useAlertConfirm from '../hooks/useAlertConfirm';
import contratoService from '../services/contratoService';

const estadoConfig = {
  borrador: { color: '#94a3b8', bg: '#f1f5f9', label: 'Borrador', icon: Clock },
  enviado: { color: '#f59e0b', bg: '#fef3c7', label: 'En Revisión', icon: AlertTriangle },
  aceptado: { color: '#10b981', bg: '#d1fae5', label: 'Aceptado', icon: CheckCircle },
  rechazado: { color: '#ef4444', bg: '#fee2e2', label: 'Rechazado', icon: XCircle },
  activo: { color: '#6366f1', bg: '#e0e7ff', label: 'Activo', icon: CheckCircle },
  finalizado: { color: '#64748b', bg: '#f1f5f9', label: 'Finalizado', icon: Clock },
  cancelado: { color: '#dc2626', bg: '#fee2e2', label: 'Cancelado', icon: XCircle },
  pendiente: { color: '#f59e0b', bg: '#fef3c7', label: 'Pendiente', icon: Clock },
};

const ContratoDetalle = ({ contrato: c, user, onUpdate }) => {
  const { showAlert, showConfirm, ModalComponent } = useAlertConfirm();
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  // ── Estados para la navegación por Pestañas y Vista PDF ──
  const [activeTab, setActiveTab] = useState('resumen'); // 'resumen', 'chat', 'pdf'
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // ── Chat con Asistente IA ──────────────────────────────
  const [chatMensajes, setChatMensajes] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatCargando, setChatCargando] = useState(false);
  const [chatIniciado, setChatIniciado] = useState(false);
  const [temasClickeados, setTemasClickeados] = useState([]);
  const chatEndRef = useRef(null);

  // Limpiar URL de blob al desmontar
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);


  // Scroll al fondo del chat cuando llegan nuevos mensajes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMensajes]);

  // Inicializar chat con saludo automático al abrir el modal
  useEffect(() => {
    if (!chatIniciado) {
      setChatIniciado(true);
      const saludo = `¡Hola! Soy tu asistente legal. Revisé el contrato de **${c.tipo_contrato_nombre || 'arrendamiento'}** entre **${c.propietario_nombre}** (propietario) y **${c.inquilino_nombre}** (inquilino) por el inmueble **${c.inmueble_titulo}** a $${c.monto} ${c.moneda}/mes.\n\n¿En qué puedo ayudarte? Puedo sugerirte cláusulas, restricciones, condiciones de uso, o analizar posibles riesgos para ambas partes.`;
      setChatMensajes([{ role: 'assistant', content: saludo }]);
    }
  }, [chatIniciado, c]);

  // Temas del contrato con sus chips — se van marcando conforme se hablan
  const TEMAS_CONTRATO = [
    { id: 'clausulas',    icon: ClipboardList, label: 'Cláusulas',          pregunta: '¿Qué cláusulas recomiendas para este contrato?' },
    { id: 'restricciones',icon: Ban, label: 'Restricciones',      pregunta: '¿Qué restricciones debería incluir el contrato?' },
    { id: 'garantias',    icon: ShieldCheck, label: 'Garantías',          pregunta: '¿Cómo debería estructurarse la garantía y el depósito?' },
    { id: 'penalizaciones',icon: AlertTriangle, label: 'Penalizaciones',   pregunta: '¿Qué penalizaciones recomiendas incluir si el inquilino incumple?' },
    { id: 'servicios',    icon: Lightbulb, label: 'Servicios',          pregunta: '¿Qué servicios debería incluir o excluir el contrato?' },
    { id: 'cancelacion',  icon: Calendar, label: 'Cancelación',       pregunta: '¿Cuál debería ser la política de cancelación del contrato?' },
    { id: 'renovacion',   icon: RefreshCw, label: 'Renovación',        pregunta: '¿Qué tipo de cláusula de renovación recomiendas?' },
    { id: 'riesgos',      icon: Zap, label: 'Riesgos Legales',   pregunta: '¿Cuáles son los principales riesgos legales de este contrato?' },
    { id: 'uso',          icon: Home, label: 'Uso del Inmueble',  pregunta: '¿Qué condiciones de uso debo especificar en el contrato?' },
    { id: 'antecedentes', icon: History, label: 'Antecedentes',       pregunta: '¿Qué antecedentes del inmueble debo incluir en el contrato?' },
  ];

  // Retorna los temas que AUN NO se han discutido (se filtra por click del usuario)
  const getChipsPendientes = () => {
    return TEMAS_CONTRATO.filter(t => !temasClickeados.includes(t.id));
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await contratoService.downloadPdf(c.id);
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `Contrato_Oficial_${c.id}.pdf`);
      link.download = `Contrato_Oficial_${c.id}.pdf`;
      link.style.position = 'absolute';
      link.style.left = '-9999px';
      link.style.top = '0';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        if (link.parentNode) document.body.removeChild(link);
      }, 2000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showAlert({ title: 'Error de descarga', message: 'No se pudo descargar el contrato en formato PDF.', status: 'error' });
    }
  };

  const esCliente = c.inquilino === user?.id;
  const puedeAceptar = esCliente && c.estado === 'enviado';

  const handleAceptar = () => {
    showConfirm({
      title: '¿Aceptar y Firmar Contrato?',
      message: '¿Estás seguro de que deseas aceptar los términos y condiciones de este contrato? Al aceptar, se registrarán automáticamente tus firmas criptográficas digitales en la Blockchain.',
      status: 'question',
      confirmText: 'Sí, aceptar y firmar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await contratoService.aceptar(c.id);
          showAlert({
            title: '¡Contrato Firmado!',
            message: 'Has firmado y aceptado el contrato exitosamente. Sus bloques e historial digital se han sellado de forma inmutable en la Blockchain.',
            status: 'success'
          });
          onUpdate();
        } catch (e) {
          showAlert({
            title: 'Error al firmar',
            message: e.response?.data?.error || 'No se pudo firmar el contrato.',
            status: 'error'
          });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleRechazar = () => {
    if (!motivoRechazo.trim()) {
      showAlert({
        title: 'Motivo Requerido',
        message: 'Por favor, ingresa un motivo para rechazar el borrador de contrato.',
        status: 'warning'
      });
      return;
    }
    showConfirm({
      title: '¿Rechazar Contrato?',
      message: '¿Estás seguro de que deseas rechazar este borrador? Se notificará al propietario con tus observaciones.',
      status: 'warning',
      confirmText: 'Sí, rechazar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await contratoService.rechazar(c.id, motivoRechazo);
          showAlert({
            title: 'Contrato Devuelto',
            message: 'Has rechazado el contrato. Se ha notificado al propietario con tus observaciones.',
            status: 'info'
          });
          onUpdate();
        } catch (e) {
          showAlert({
            title: 'Error al rechazar',
            message: e.response?.data?.error || 'No se pudo rechazar el contrato.',
            status: 'error'
          });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const enviarMensaje = async (textoOverride) => {
    const texto = (textoOverride || chatInput).trim();
    if (!texto || chatCargando) return;

    const nuevosMensajes = [...chatMensajes, { role: 'user', content: texto }];
    setChatMensajes(nuevosMensajes);
    setChatInput('');
    setChatCargando(true);

    try {
      const respuesta = await contratoService.chatIA(c.id, nuevosMensajes);
      setChatMensajes(prev => [...prev, { role: 'assistant', content: respuesta }]);
    } catch {
      setChatMensajes(prev => [...prev, {
        role: 'assistant',
        content: '❌ Ocurrió un error al contactar al asistente. Verifica tu conexión e intenta de nuevo.'
      }]);
    } finally {
      setChatCargando(false);
    }
  };

  const getChatComoInstrucciones = () => {
    const conversacion = chatMensajes
      .filter((m, idx) => !(m.role === 'assistant' && idx === 0))
      .map(m => `${m.role === 'user' ? 'Usuario' : 'Abogado IA'}: ${m.content}`)
      .join('\n\n');
    return conversacion.length > 100 ? conversacion : '';
  };

  const handleGenerateIAInline = async () => {
    setIsGeneratingIA(true);
    try {
      const instruccionesChat = getChatComoInstrucciones();
      const blob = await contratoService.generarContratoIA(c.id, instruccionesChat);
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(blobUrl);
      showAlert({
        title: '¡Contrato Generado!',
        message: 'El contrato formal con formato legal boliviano se ha generado con éxito y está listo para visualizar y descargar.',
        status: 'success'
      });
    } catch (error) {
      console.error('Error generando PDF con IA:', error);
      showAlert({
        title: 'Error de Asistente IA',
        message: 'Hubo un error al contactar a la Inteligencia Artificial para la redacción legal del contrato.',
        status: 'error'
      });
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handleDownloadPDFBlob = () => {
    if (!pdfBlobUrl) return;
    const link = document.createElement('a');
    link.href = pdfBlobUrl;
    link.setAttribute('download', `Contrato_Oficial_IA_${c.id}.pdf`);
    link.style.position = 'absolute';
    link.style.left = '-9999px';
    link.style.top = '0';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) document.body.removeChild(link);
    }, 2000);
  };

  const cfg = estadoConfig[c.estado] || estadoConfig.pendiente;
  const sectionStyle = { marginBottom: '20px' };
  const titleStyle = { fontSize: '0.8rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' };
  const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' };
  const labelStyle = { color: '#64748b', fontWeight: 500 };
  const valueStyle = { fontWeight: 600, color: '#1e293b', textAlign: 'right', maxWidth: '60%' };

  return (
    <div style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '15px', padding: '4px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '16px', background: 'linear-gradient(135deg, #f8fafc, #e0e7ff)', borderRadius: '12px', flexShrink: 0 }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>CONTRATO DE {(c.tipo_contrato_nombre || 'INMUEBLE').toUpperCase()}</div>
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>Contrato N. {c.id} · Creado: {new Date(c.creado).toLocaleDateString('es-BO')}</div>
        <span style={{ display: 'inline-block', marginTop: '8px', background: cfg.bg, color: cfg.color, padding: '4px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>{cfg.label}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px', flexShrink: 0 }}>
        <button
          onClick={() => setActiveTab('resumen')}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'resumen' ? '3px solid #6366f1' : '3px solid transparent',
            color: activeTab === 'resumen' ? '#6366f1' : '#64748b',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ClipboardList size={16} /> Resumen y Firmas
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'chat' ? '3px solid #8b5cf6' : '3px solid transparent',
            color: activeTab === 'chat' ? '#8b5cf6' : '#64748b',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <MessageSquare size={16} /> Abogado Virtual
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pdf' ? '3px solid #059669' : '3px solid transparent',
            color: activeTab === 'pdf' ? '#059669' : '#64748b',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Printer size={16} /> Vista de Impresión (PDF)
        </button>
      </div>

      {/* Content scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {activeTab === 'resumen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Partes */}
            <div style={sectionStyle}>
              <div style={titleStyle}>Partes del Contrato</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#6366f1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                    <Home size={14} /> Propietario
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{c.propietario_nombre}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>CI: {c.propietario_ci || 'N/A'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Tel: {c.propietario_telefono || 'N/A'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#0ea5e9', fontWeight: 500 }}>{c.propietario_email}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#6366f1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                    <User size={14} /> Inquilino / Comprador
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{c.inquilino_nombre}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>CI: {c.inquilino_ci || 'N/A'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Tel: {c.inquilino_telefono || 'N/A'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#0ea5e9', fontWeight: 500 }}>{c.inquilino_email}</div>
                </div>
              </div>
            </div>

            {/* Inmueble */}
            <div style={sectionStyle}>
              <div style={titleStyle}>Inmueble</div>
              <div style={rowStyle}><span style={labelStyle}>Propiedad</span><span style={valueStyle}>{c.inmueble_titulo}</span></div>
              <div style={rowStyle}><span style={labelStyle}>Dirección</span><span style={valueStyle}>{c.inmueble_direccion || 'N/A'}</span></div>
            </div>

            {/* Condiciones Económicas */}
            <div style={sectionStyle}>
              <div style={titleStyle}>Condiciones Económicas</div>
              <div style={rowStyle}><span style={labelStyle}>Monto</span><span style={{ ...valueStyle, color: '#059669', fontSize: '1.1rem' }}>${c.monto} {c.moneda}</span></div>
              <div style={rowStyle}><span style={labelStyle}>Depósito/Garantía</span><span style={valueStyle}>${c.deposito} {c.moneda}</span></div>
              <div style={rowStyle}><span style={labelStyle}>Día de pago</span><span style={valueStyle}>Día {c.dia_pago} de cada mes</span></div>
              <div style={rowStyle}><span style={labelStyle}>Forma de pago</span><span style={valueStyle}>{c.forma_pago || 'Stripe'}</span></div>
              <div style={rowStyle}><span style={labelStyle}>Vigencia</span><span style={valueStyle}>{c.inicio} → {c.fin || 'Indefinido'}</span></div>
            </div>

            {/* Cláusulas Legales */}
            {c.antecedentes && <div style={sectionStyle}><div style={titleStyle}>Antecedentes</div><div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-wrap', background: '#f0f9ff', padding: '12px', borderRadius: '8px', lineHeight: '1.6', border: '1px solid #bae6fd' }}>{c.antecedentes}</div></div>}
            {c.clausulas && <div style={sectionStyle}><div style={titleStyle}>Cláusulas</div><div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px', lineHeight: '1.6' }}>{c.clausulas}</div></div>}
            {c.clausulas_especiales && <div style={sectionStyle}><div style={titleStyle}>Cláusulas Especiales</div><div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-wrap', background: '#faf5ff', padding: '12px', borderRadius: '8px', lineHeight: '1.6', border: '1px solid #e9d5ff' }}>{c.clausulas_especiales}</div></div>}
            {c.uso_exclusivo && <div style={sectionStyle}><div style={titleStyle}>Uso Exclusivo del Inmueble</div><div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-wrap', background: '#f0fdf4', padding: '12px', borderRadius: '8px', lineHeight: '1.6', border: '1px solid #bbf7d0' }}>{c.uso_exclusivo}</div></div>}
            {c.condiciones_uso && <div style={sectionStyle}><div style={titleStyle}>Condiciones de Uso</div><div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px', lineHeight: '1.6' }}>{c.condiciones_uso}</div></div>}
            {c.penalidades && <div style={sectionStyle}><div style={titleStyle}>Penalidades</div><div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-wrap', background: '#fef2f2', padding: '12px', borderRadius: '8px', lineHeight: '1.6' }}>{c.penalidades}</div></div>}
            {c.politica_cancelacion && <div style={sectionStyle}><div style={titleStyle}>Política de Cancelación</div><div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px', lineHeight: '1.6' }}>{c.politica_cancelacion}</div></div>}
            {c.incluye_servicios && <div style={sectionStyle}><div style={titleStyle}>Servicios Incluidos</div><div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-wrap', background: '#f0fdf4', padding: '12px', borderRadius: '8px', lineHeight: '1.6' }}>{c.incluye_servicios}</div></div>}
            {c.restricciones && <div style={sectionStyle}><div style={titleStyle}>Restricciones</div><div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-wrap', background: '#fef3c7', padding: '12px', borderRadius: '8px', lineHeight: '1.6' }}>{c.restricciones}</div></div>}
            {c.observaciones && <div style={sectionStyle}><div style={titleStyle}>Observaciones</div><div style={{ fontSize: '0.88rem', color: '#374151', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px', lineHeight: '1.6' }}>{c.observaciones}</div></div>}
            {c.motivo_rechazo && <div style={sectionStyle}><div style={titleStyle}>Motivo de Rechazo</div><div style={{ fontSize: '0.88rem', color: '#dc2626', whiteSpace: 'pre-wrap', background: '#fee2e2', padding: '12px', borderRadius: '8px' }}>{c.motivo_rechazo}</div></div>}



            {/* Acciones del cliente */}
            {puedeAceptar && (
              <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <button onClick={handleAceptar} disabled={actionLoading} style={{
                    flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                    border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 700, fontSize: '0.95rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    <CheckCircle size={18} /> Aceptar Contrato
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" value={motivoRechazo} onChange={e => setMotivoRechazo(e.target.value)} placeholder="Motivo de rechazo (obligatorio para rechazar)..."
                    style={{ border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px', fontSize: '0.9rem', width: '100%' }} />
                  <button onClick={handleRechazar} disabled={actionLoading} style={{
                    background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '10px',
                    padding: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    <XCircle size={16} /> Rechazar Contrato
                  </button>
                </div>
              </div>
            )}

            {/* Botón Descargar Básico */}
            <button onClick={handleDownloadPDF} style={{
              width: '100%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
              border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 700, fontSize: '0.95rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '10px'
            }}>
              <FileText size={18} /> Descargar Contrato Básico PDF
            </button>
          </div>
        )}

        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Header del chat */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Asistente Legal IA</div>
                  <div style={{ fontSize: '0.72rem', color: '#8b5cf6' }}>Abogado Inmobiliario Boliviano · Powered by Llama 3.3</div>
                </div>
              </div>
              <button
                onClick={() => { setChatMensajes([]); setChatIniciado(false); setTemasClickeados([]); }}
                title="Reiniciar conversación"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Área de mensajes */}
            <div style={{
              height: '320px', overflowY: 'auto', border: '1px solid #e2e8f0',
              borderRadius: '12px', padding: '12px', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              {chatMensajes.map((msg, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start', gap: '8px',
                }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                      : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 800, color: '#fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}>
                    {msg.role === 'user' ? 'Tú' : <Bot size={13} />}
                  </div>
                  <div style={{
                    maxWidth: '78%',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                      : '#ffffff',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    padding: '10px 14px',
                    fontSize: '0.84rem',
                    lineHeight: '1.6',
                    boxShadow: msg.role === 'user'
                      ? '0 3px 12px rgba(99,102,241,0.35)'
                      : '0 2px 8px rgba(0,0,0,0.08)',
                    border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                    borderLeft: msg.role === 'assistant' ? '3px solid #8b5cf6' : 'none',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </div>
                </div>
              ))}
              {chatCargando && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}>
                    <Bot size={13} color="#fff" />
                  </div>
                  <div style={{
                    background: '#fff', border: '1px solid #e2e8f0', borderLeft: '3px solid #8b5cf6',
                    borderRadius: '4px 18px 18px 18px',
                    padding: '12px 18px', display: 'flex', gap: '5px', alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chips dinámicos */}
            {!chatCargando && (() => {
              const pendientes = getChipsPendientes();
              if (pendientes.length === 0) return null;
              const esInicio = chatMensajes.length <= 1;
              return (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.71rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.3px' }}>
                      {esInicio ? '¿Por dónde quieres empezar?' : 'También puedo ayudarte con:'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {pendientes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTemasClickeados(prev => [...prev, t.id]);
                          enviarMensaje(t.pregunta);
                        }}
                        style={{
                          background: '#f5f3ff', color: '#6d28d9',
                          border: '1.5px solid #ddd6fe',
                          borderRadius: '20px', padding: '5px 12px',
                          fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600,
                          transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.borderColor = '#8b5cf6';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = '#f5f3ff';
                          e.currentTarget.style.color = '#6d28d9';
                          e.currentTarget.style.borderColor = '#ddd6fe';
                        }}
                      >
                        <t.icon size={13} style={{ flexShrink: 0 }} /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Input del chat */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
                placeholder="Escribe tu consulta al asistente legal..."
                disabled={chatCargando}
                style={{
                  flex: 1, border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  padding: '10px 16px', fontSize: '0.88rem', outline: 'none',
                }}
              />
              <button
                onClick={() => enviarMensaje()}
                disabled={!chatInput.trim() || chatCargando}
                style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: !chatInput.trim() || chatCargando ? '#e2e8f0' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  border: 'none', cursor: !chatInput.trim() || chatCargando ? 'default' : 'pointer',
                  color: !chatInput.trim() || chatCargando ? '#94a3b8' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Send size={16} />
              </button>
            </div>

            {/* Acceso rápido a Previsualización */}
            <button
              onClick={() => { setActiveTab('pdf'); }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                color: '#5b21b6',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '5px'
              }}
            >
              <Sparkles size={14} /> Redactar cláusulas en PDF Oficial de Impresión
            </button>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '480px' }}>
            {pdfBlobUrl ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    Previsualización del Documento Notarial (Generado por IA)
                  </span>
                  <button
                    onClick={handleDownloadPDFBlob}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    📥 Descargar PDF Oficial
                  </button>
                </div>
                <iframe
                  src={pdfBlobUrl}
                  title="Contrato PDF"
                  style={{ width: '100%', height: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}
                />
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                background: '#f8fafc',
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ede9fe, #c7d2fe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Sparkles size={28} color="#6d28d9" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                  Generar Contrato Formal con IA
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '380px', marginBottom: '20px', lineHeight: '1.5' }}>
                  La IA redactará el documento legal formal con formato notarial boliviano, incorporando todas las cláusulas acordadas y el historial de chat con el asistente.
                </p>
                <button
                  onClick={handleGenerateIAInline}
                  disabled={isGeneratingIA}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: isGeneratingIA ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s'
                  }}
                >
                  {isGeneratingIA ? (
                    <>
                      <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      Redactando contrato con IA...
                    </>
                  ) : (
                    <><Sparkles size={16} /> Redactar y Generar PDF</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Renders ModalComponent inside ContratoDetalle to keep it self-contained */}
      {ModalComponent}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default ContratoDetalle;
