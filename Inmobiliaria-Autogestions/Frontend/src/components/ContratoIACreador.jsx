import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, Send, RotateCcw, FileSignature, Loader2, CheckCircle2, Sparkles, Mic, MicOff,
  FileText, ClipboardList, Ban, Lightbulb, ShieldCheck, AlertTriangle, CalendarX, RefreshCw, Home, History
} from 'lucide-react';
import api from '../services/api';
import contratoService from '../services/contratoService';

/**
 * ContratoIACreador - Modal de 2 columnas para crear contratos con ayuda del Asistente Legal IA.
 *
 * Columna izq: Chat con la IA que guía al propietario para definir condiciones.
 * Columna der: Formulario simplificado con datos básicos (tipo, monto, fechas).
 * Al enviar: llama a /contratos/crear-con-ia/ → crea el contrato y lo manda al cliente.
 */
const ContratoIACreador = ({ selectedChat, user, tiposContrato, onContratoEnviado, onClose, contratoEdicion }) => {
  // ── Formulario básico ───────────────────────────────────────
  const inquilinoId = selectedChat?.participante1 === user?.id
    ? selectedChat?.participante2
    : selectedChat?.participante1;

  const [form, setForm] = useState({
    tipo_contrato_id: tiposContrato[0]?.id || '',
    monto: selectedChat?.inmueble_precio || '',
    moneda: 'BOB',
    inicio: new Date().toISOString().split('T')[0],
    fin: '',
    deposito: '0',
    dia_pago: '5',
  });

  const [enviando, setEnviando] = useState(false);
  const [exitoso, setExitoso] = useState(false);

  // ── Voz / Reconocimiento de voz ─────────────────────────────
  const [grabando, setGrabando] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  const toggleGrabacion = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta el reconocimiento de voz. Te sugerimos usar Google Chrome o Microsoft Edge.");
      return;
    }

    if (grabando) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setGrabando(false);
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.lang = 'es-BO';
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          setGrabando(true);
        };

        rec.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev ? prev + ' ' + transcript : transcript);
        };

        rec.onerror = (e) => {
          console.error("Error en reconocimiento de voz:", e);
          setGrabando(false);
        };

        rec.onend = () => {
          setGrabando(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error("Error al iniciar reconocimiento:", err);
        setGrabando(false);
      }
    }
  };

  // ── Chat IA ─────────────────────────────────────────────────
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [iniciado, setIniciado] = useState(false);
  const chatEndRef = useRef(null);

  // Chips rápidos de temas (10 temas)
  const CHIPS = [
    { id: 'tipo', icon: FileText, label: 'Tipo de contrato', pregunta: '¿Qué tipo de contrato necesito para este inmueble y cuál es la diferencia entre alquiler, venta y anticrético?' },
    { id: 'clausulas', icon: ClipboardList, label: 'Cláusulas recomendadas', pregunta: '¿Qué cláusulas principales debería tener el contrato para protegerme como propietario?' },
    { id: 'restricciones', icon: Ban, label: 'Restricciones', pregunta: '¿Qué restricciones son más importantes incluir para el inquilino?' },
    { id: 'servicios', icon: Lightbulb, label: 'Servicios', pregunta: '¿Cómo debo manejar los servicios básicos (agua, luz, gas) en el contrato?' },
    { id: 'garantia', icon: ShieldCheck, label: 'Garantía/Depósito', pregunta: '¿Cuánto debería pedir de depósito de garantía y cómo protegerme legalmente?' },
    { id: 'penalidades', icon: AlertTriangle, label: 'Penalidades', pregunta: '¿Qué penalidades por incumplimiento recomiendas incluir?' },
    { id: 'cancelacion', icon: CalendarX, label: 'Cancelación', pregunta: '¿Cuál debería ser la política de cancelación y devolución del depósito?' },
    { id: 'renovacion', icon: RefreshCw, label: 'Renovación', pregunta: '¿Qué tipo de cláusula de renovación o prórroga me conviene redactar?' },
    { id: 'uso', icon: Home, label: 'Uso del Inmueble', pregunta: '¿Qué condiciones de uso exclusivo y conservación del inmueble debo especificar?' },
    { id: 'antecedentes', icon: History, label: 'Antecedentes', pregunta: '¿Qué antecedentes de propiedad o estado actual del inmueble debo registrar en el contrato?' },
  ];
  const [chipsUsados, setChipsUsados] = useState([]);

  // Scroll al fondo del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Cargar borrador desde localStorage o contratoEdicion al cambiar de chat o contrato
  useEffect(() => {
    if (!selectedChat?.id) return;
    setIniciado(false);

    if (contratoEdicion) {
      const editKey = `contrato_ia_edit_draft_${contratoEdicion.id}`;
      const savedEdit = localStorage.getItem(editKey);
      if (savedEdit) {
        try {
          const parsed = JSON.parse(savedEdit);
          if (parsed.form) setForm(parsed.form);
          if (parsed.mensajes) setMensajes(parsed.mensajes);
          if (parsed.chipsUsados) setChipsUsados(parsed.chipsUsados);
          setIniciado(true);
          return;
        } catch (e) {
          console.error("Error al parsear el borrador de edición:", e);
        }
      }

      setForm({
        tipo_contrato_id: contratoEdicion.tipo_contrato || '',
        monto: contratoEdicion.monto || '',
        moneda: contratoEdicion.moneda || 'BOB',
        inicio: contratoEdicion.inicio || new Date().toISOString().split('T')[0],
        fin: contratoEdicion.fin || '',
        deposito: contratoEdicion.deposito || '0',
        dia_pago: contratoEdicion.dia_pago || '5',
      });
      
      const saludoEdicion = `¡Hola! Soy tu **Abogado IA**. Estoy listo para ayudarte a editar la propuesta del contrato #${contratoEdicion.id}.

Puedes consultarme sobre las cláusulas, penalidades o restricciones que deseas cambiar, o pedirme redactar un nuevo texto legal para actualizar el contrato.`;
      
      setMensajes([{ role: 'assistant', content: saludoEdicion }]);
      setChipsUsados([]);
      setIniciado(true);
      return;
    }

    // Modo creación
    const key = `contrato_ia_draft_${selectedChat.id}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm(parsed.form);
        if (parsed.mensajes) setMensajes(parsed.mensajes);
        if (parsed.chipsUsados) setChipsUsados(parsed.chipsUsados);
        setIniciado(true);
        return;
      } catch (e) {
        console.error("Error al parsear el borrador del contrato IA:", e);
      }
    }

    const saludo = `¡Hola! Soy tu **Abogado IA**. Voy a ayudarte a redactar el contrato para el inmueble **${selectedChat?.inmueble_titulo || 'la propiedad'}**.

Para comenzar, completa los datos básicos en el panel derecho (tipo de contrato, monto y fecha de inicio), y usa este chat para definir las cláusulas especiales, restricciones y condiciones que quieres incluir.

¿Por dónde te gustaría empezar? Puedes clickear uno de los temas de abajo o escribirme directamente.`;

    setForm({
      tipo_contrato_id: tiposContrato[0]?.id || '',
      monto: selectedChat?.inmueble_precio || '',
      moneda: 'BOB',
      inicio: new Date().toISOString().split('T')[0],
      fin: '',
      deposito: '0',
      dia_pago: '5',
    });
    setMensajes([{ role: 'assistant', content: saludo }]);
    setChipsUsados([]);
    setIniciado(true);
  }, [selectedChat?.id, contratoEdicion, tiposContrato]);

  // Guardar automáticamente el borrador en localStorage cuando cambie algún campo
  useEffect(() => {
    if (!selectedChat?.id || !iniciado) return;

    const key = contratoEdicion
      ? `contrato_ia_edit_draft_${contratoEdicion.id}`
      : `contrato_ia_draft_${selectedChat.id}`;

    const dataToSave = { form, mensajes, chipsUsados };
    localStorage.setItem(key, JSON.stringify(dataToSave));
  }, [form, mensajes, chipsUsados, selectedChat?.id, contratoEdicion, iniciado]);

  // Función para reiniciar el chat limpiando localStorage
  const handleReiniciar = () => {
    if (contratoEdicion) {
      localStorage.removeItem(`contrato_ia_edit_draft_${contratoEdicion.id}`);
      setForm({
        tipo_contrato_id: contratoEdicion.tipo_contrato || '',
        monto: contratoEdicion.monto || '',
        moneda: contratoEdicion.moneda || 'BOB',
        inicio: contratoEdicion.inicio || new Date().toISOString().split('T')[0],
        fin: contratoEdicion.fin || '',
        deposito: contratoEdicion.deposito || '0',
        dia_pago: contratoEdicion.dia_pago || '5',
      });
      const saludoEdicion = `¡Hola! Soy tu **Abogado IA**. Estoy listo para ayudarte a editar la propuesta del contrato #${contratoEdicion.id}.

Puedes consultarme sobre las cláusulas, penalidades o restricciones que deseas cambiar, o pedirme redactar un nuevo texto legal para actualizar el contrato.`;
      setMensajes([{ role: 'assistant', content: saludoEdicion }]);
      setChipsUsados([]);
      return;
    }

    if (selectedChat?.id) {
      localStorage.removeItem(`contrato_ia_draft_${selectedChat.id}`);
    }
    const saludo = `¡Hola! Soy tu **Abogado IA**. Voy a ayudarte a redactar el contrato para el inmueble **${selectedChat?.inmueble_titulo || 'la propiedad'}**.

Para comenzar, completa los datos básicos en el panel derecho (tipo de contrato, monto y fecha de inicio), y usa este chat para definir las cláusulas especiales, restricciones y condiciones que quieres incluir.

¿Por dónde te gustaría empezar? Puedes clickear uno de los temas de abajo o escribirme directamente.`;

    setForm({
      tipo_contrato_id: tiposContrato[0]?.id || '',
      monto: selectedChat?.inmueble_precio || '',
      moneda: 'BOB',
      inicio: new Date().toISOString().split('T')[0],
      fin: '',
      deposito: '0',
      dia_pago: '5',
    });
    setMensajes([{ role: 'assistant', content: saludo }]);
    setChipsUsados([]);
  };

  // Llamada a la IA — usa el endpoint de chat-ia del contrato temporal
  // Como no existe contrato aún, usamos un endpoint genérico pasando contexto manual
  const enviarMensaje = useCallback(async (textoOverride) => {
    const texto = (textoOverride || input).trim();
    if (!texto || cargando) return;

    const nuevos = [...mensajes, { role: 'user', content: texto }];
    setMensajes(nuevos);
    setInput('');
    setCargando(true);

    try {
      // Usamos el endpoint de chat general de contratos del primer contrato disponible como proxy,
      // o llamamos directamente a Groq via backend con un endpoint especial sin contrato.
      // Por ahora, si hay un contrato existente del chat lo usamos, sino usamos el primero disponible.
      // Solución pragmática: llamamos a un endpoint de chat-libre en el backend.
      const { data } = await api.post('/inmuebles/contratos/chat-creador-ia/', {
        mensajes: nuevos,
        contexto: {
          inmueble_titulo: selectedChat?.inmueble_titulo,
          tipo_contrato: tiposContrato.find(t => t.id == form.tipo_contrato_id)?.nombre || '',
          monto: form.monto,
          moneda: form.moneda,
          inicio: form.inicio,
          fin: form.fin,
          deposito: form.deposito,
          dia_pago: form.dia_pago,
          clausulas: contratoEdicion?.clausulas || '',
          condiciones_uso: contratoEdicion?.condiciones_uso || '',
          penalidades: contratoEdicion?.penalidades || '',
          restricciones: contratoEdicion?.restricciones || '',
          incluye_servicios: contratoEdicion?.incluye_servicios || '',
        }
      });
      setMensajes(prev => [...prev, { role: 'assistant', content: data.respuesta }]);
    } catch {
      setMensajes(prev => [...prev, {
        role: 'assistant',
        content: '❌ Error al contactar al asistente. Verifica tu conexión e intenta de nuevo.'
      }]);
    } finally {
      setCargando(false);
    }
  }, [mensajes, input, cargando, selectedChat, form, tiposContrato]);

  const handleEnviar = async () => {
    if (!form.tipo_contrato_id || !form.monto || !form.inicio) return;

    setEnviando(true);
    try {
      // Filtrar el saludo inicial (primer mensaje de la IA) del historial
      const historialChat = mensajes.filter((m, idx) => !(m.role === 'assistant' && idx === 0));

      const params = {
        inmueble_id: selectedChat.inmueble,
        inquilino_id: inquilinoId,
        chat_id: selectedChat.id,
        tipo_contrato_id: parseInt(form.tipo_contrato_id),
        monto: form.monto,
        moneda: form.moneda,
        inicio: form.inicio,
        fin: form.fin || undefined,
        deposito: form.deposito,
        dia_pago: parseInt(form.dia_pago),
        historial_chat: historialChat,
      };

      if (contratoEdicion) {
        await contratoService.editarConIA(contratoEdicion.id, params);
        if (contratoEdicion?.id) {
          localStorage.removeItem(`contrato_ia_edit_draft_${contratoEdicion.id}`);
        }
      } else {
        await contratoService.crearConIA(params);
        if (selectedChat?.id) {
          localStorage.removeItem(`contrato_ia_draft_${selectedChat.id}`);
        }
      }

      setExitoso(true);
      setTimeout(() => {
        onContratoEnviado?.();
        onClose?.();
      }, 2000);
    } catch (err) {
      console.error(err);
      setMensajes(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error al guardar el contrato: ${err.response?.data?.error || 'Error desconocido'}. Verifica que todos los campos estén completos.`
      }]);
    } finally {
      setEnviando(false);
    }
  };

  if (exitoso) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
        }}>
          <CheckCircle2 size={32} color="#fff" />
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
          {contratoEdicion ? '¡Contrato actualizado!' : '¡Contrato enviado al cliente!'}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          {contratoEdicion ? 'El borrador se actualizó correctamente con las nuevas cláusulas.' : 'El cliente recibirá una notificación y podrá revisarlo desde el chat.'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', height: '560px' }}>

      {/* ─── Columna izquierda: Chat con la IA ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Header IA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                Abogado IA · {contratoEdicion ? 'Editor' : 'Creador'} de Contratos
              </div>
              <div style={{ fontSize: '0.7rem', color: '#8b5cf6' }}>
                {contratoEdicion ? `Editando Contrato #${contratoEdicion.id}` : 'Powered by Llama 3.3 · Derecho Inmobiliario Boliviano'}
              </div>
            </div>
          </div>
          <button
            onClick={handleReiniciar}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            title="Reiniciar chat"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Área de mensajes */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          minHeight: 0,
        }}>
          {mensajes.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: '7px',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                  : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.58rem', fontWeight: 800, color: '#fff',
              }}>
                {msg.role === 'user' ? 'Tú' : <Bot size={12} />}
              </div>
              <div style={{
                maxWidth: '80%',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : '#ffffff',
                color: msg.role === 'user' ? '#fff' : '#1e293b',
                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                padding: '9px 13px',
                fontSize: '0.82rem',
                lineHeight: '1.55',
                boxShadow: msg.role === 'user'
                  ? '0 2px 10px rgba(99,102,241,0.3)'
                  : '0 1px 6px rgba(0,0,0,0.07)',
                border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                borderLeft: msg.role === 'assistant' ? '3px solid #8b5cf6' : 'none',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
            </div>
          ))}
          {cargando && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={12} color="#fff" />
              </div>
              <div style={{
                background: '#fff', border: '1px solid #e2e8f0', borderLeft: '3px solid #8b5cf6',
                borderRadius: '4px 16px 16px 16px',
                padding: '10px 16px', display: 'flex', gap: '4px', alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#8b5cf6',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chips de temas */}
        {!cargando && (() => {
          const pendientes = CHIPS.filter(c => !chipsUsados.includes(c.id));
          if (!pendientes.length) return null;
          return (
            <div style={{ marginTop: '8px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', width: '100%' }}>
                <span style={{ fontSize: '0.69rem', color: '#94a3b8', fontWeight: 600 }}>
                  Consúltame sobre:
                </span>
                <span style={{
                  fontSize: '0.65rem', background: '#ede9fe', color: '#7c3aed',
                  borderRadius: '10px', padding: '2px 8px', fontWeight: 700,
                }}>
                  {pendientes.length} de {CHIPS.length} temas pendientes
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {pendientes.map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setChipsUsados(prev => [...prev, chip.id]);
                      enviarMensaje(chip.pregunta);
                    }}
                    style={{
                      background: '#f5f3ff', color: '#6d28d9',
                      border: '1.5px solid #ddd6fe',
                      borderRadius: '20px', padding: '4px 10px',
                      fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#8b5cf6'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.color = '#6d28d9'; }}
                  >
                    <chip.icon size={13} style={{ flexShrink: 0 }} /> {chip.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Input del chat */}
        <div style={{ display: 'flex', gap: '7px', marginTop: '8px', flexShrink: 0 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
            placeholder={grabando ? "Escuchando voz..." : "Cuéntame qué condiciones quieres en el contrato..."}
            disabled={cargando}
            style={{
              flex: 1, border: '1.5px solid #e2e8f0', borderRadius: '10px',
              padding: '9px 14px', fontSize: '0.85rem', outline: 'none',
              background: grabando ? '#fef2f2' : '#fff',
              borderColor: grabando ? '#ef4444' : '#e2e8f0',
              opacity: cargando ? 0.6 : 1,
            }}
            onFocus={e => { if (!grabando) e.target.style.borderColor = '#8b5cf6'; }}
            onBlur={e => { if (!grabando) e.target.style.borderColor = '#e2e8f0'; }}
          />
          <button
            onClick={toggleGrabacion}
            disabled={cargando}
            style={{
              width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
              background: grabando ? '#ef4444' : '#f1f5f9',
              border: '1.5px solid ' + (grabando ? '#ef4444' : '#cbd5e1'),
              cursor: 'pointer',
              color: grabando ? '#fff' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: grabando ? 'pulse-red 1.5s infinite' : 'none',
            }}
            title={grabando ? "Detener dictado por voz" : "Dictar por voz"}
          >
            {grabando ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={() => enviarMensaje()}
            disabled={!input.trim() || cargando}
            style={{
              width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
              background: !input.trim() || cargando ? '#e2e8f0' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              border: 'none', cursor: !input.trim() || cargando ? 'default' : 'pointer',
              color: !input.trim() || cargando ? '#94a3b8' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* ─── Columna derecha: Datos básicos del contrato ─── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#f8fafc',
        borderRadius: '14px',
        padding: '18px',
        border: '1px solid #e2e8f0',
        overflowY: 'auto',
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileSignature size={16} color="#6366f1" />
          Datos del Contrato
        </div>

        {/* Tipo de contrato */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: '4px' }}>
            Tipo de Contrato *
          </label>
          <select
            value={form.tipo_contrato_id}
            onChange={e => setForm({ ...form, tipo_contrato_id: e.target.value })}
            style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', fontSize: '0.85rem', background: '#fff' }}
          >
            <option value="">Seleccionar...</option>
            {tiposContrato.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>

        {/* Monto + Moneda */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: '4px' }}>Monto *</label>
            <input
              type="number"
              value={form.monto}
              onChange={e => setForm({ ...form, monto: e.target.value })}
              placeholder="Ej. 1500"
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: '4px' }}>Moneda</label>
            <select
              value={form.moneda}
              onChange={e => setForm({ ...form, moneda: e.target.value })}
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 6px', fontSize: '0.85rem', background: '#fff' }}
            >
              <option value="BOB">BOB</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Fecha inicio */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: '4px' }}>Fecha de Inicio *</label>
          <input
            type="date"
            value={form.inicio}
            onChange={e => setForm({ ...form, inicio: e.target.value })}
            style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Fecha fin */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: '4px' }}>Fecha de Fin <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span></label>
          <input
            type="date"
            value={form.fin}
            onChange={e => setForm({ ...form, fin: e.target.value })}
            style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Depósito + Día de pago */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: '4px' }}>Depósito</label>
            <input
              type="number"
              value={form.deposito}
              onChange={e => setForm({ ...form, deposito: e.target.value })}
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: '4px' }}>Día de pago</label>
            <input
              type="number"
              min="1"
              max="31"
              value={form.dia_pago}
              onChange={e => setForm({ ...form, dia_pago: e.target.value })}
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Info de cláusulas */}
        <div style={{
          background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
          borderRadius: '10px',
          padding: '10px 12px',
          fontSize: '0.75rem',
          color: '#5b21b6',
          lineHeight: '1.5',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={12} /> La IA redacta las cláusulas
          </div>
          Las cláusulas, restricciones y penalidades se generarán automáticamente a partir de tu conversación con el Abogado IA.
        </div>

        {/* Botón enviar */}
        <button
          onClick={handleEnviar}
          disabled={enviando || !form.tipo_contrato_id || !form.monto || !form.inicio}
          style={{
            width: '100%',
            background: enviando || !form.tipo_contrato_id || !form.monto || !form.inicio
              ? '#cbd5e1'
              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: enviando || !form.tipo_contrato_id || !form.monto || !form.inicio ? '#94a3b8' : '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: enviando || !form.tipo_contrato_id || !form.monto || !form.inicio ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s',
            marginTop: 'auto',
            boxShadow: enviando || !form.tipo_contrato_id || !form.monto || !form.inicio
              ? 'none'
              : '0 4px 14px rgba(99,102,241,0.4)',
          }}
        >
          {enviando ? (
            <><Loader2 size={16} className="animate-spin" /> {contratoEdicion ? 'Guardando cambios...' : 'Enviando al cliente...'}</>
          ) : (
            <><FileSignature size={16} /> {contratoEdicion ? 'Actualizar y Enviar al Cliente' : 'Crear y Enviar al Cliente'}</>
          )}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-red {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default ContratoIACreador;
