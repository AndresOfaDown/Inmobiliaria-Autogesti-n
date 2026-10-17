import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Compass, Plus, Trash2, AlertCircle, Link2, HelpCircle, ChevronUp, ChevronDown, Check } from 'lucide-react';
import inmuebleService from '../services/inmuebleService';
import 'pannellum/build/pannellum.css';
import 'pannellum';
import './EditorRecorrido.css';

/**
 * EditorRecorrido — Editor inmersivo del recorrido virtual para propietarios.
 * Permite la creación visual e interactiva de puntos de transición.
 * 
 * @param {object} props
 * @param {number} props.inmuebleId - ID del inmueble
 * @param {string} props.tituloPropiedad - Título de la propiedad
 * @param {Function} props.onClose - Callback al cerrar el editor
 */
const EditorRecorrido = ({ inmuebleId, tituloPropiedad = '', onClose }) => {
  const viewerRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const objectUrlRef = useRef(null);

  // ─── Estados Principales ───
  const [panoramas, setPanoramas] = useState([]);
  const [panoramaActivo, setPanoramaActivo] = useState(null);
  const [cargandoInmueble, setCargandoInmueble] = useState(true);
  const [cargandoImagen, setCargandoImagen] = useState(false);

  // Hotspots cargados de base de datos para la escena activa
  const [existingHotspots, setExistingHotspots] = useState([]);

  // Formulario para crear un hotspot
  const [escenaDestinoId, setEscenaDestinoId] = useState('');
  const [textoAyuda, setTextoAyuda] = useState('');
  const [bidireccional, setBidireccional] = useState(true);
  const [guardandoHotspot, setGuardandoHotspot] = useState(false);

  // Modo de selección manual
  const [modoManual, setModoManual] = useState(false);
  const [puntoManual, setPuntoManual] = useState(null);

  // Hotspot actualmente seleccionado para detalles o eliminación
  const [hotspotSeleccionado, setHotspotSeleccionado] = useState(null);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [guardadoStatus, setGuardadoStatus] = useState('sincronizado'); // 'sincronizado' | 'guardando' | 'error'

  // ─── Carga Inicial de la Propiedad ───
  const cargarDatosPropiedad = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) {
        setCargandoInmueble(true);
      }
      const data = await inmuebleService.getById(inmuebleId);
      const todosMedia = data.multimedia || [];
      const panos360 = todosMedia.filter((m) => m.tipo === 'panorama360');

      setPanoramas(panos360);

      if (panos360.length > 0) {
        // Conservar activo si existe, sino seleccionar el primero
        setPanoramaActivo((prev) => {
          if (prev) {
            const found = panos360.find((p) => p.id === prev.id);
            if (found) {
              // Evitar cambiar la referencia si el archivo y la descripción son idénticos.
              // De lo contrario, se reinicializa Pannellum y hay parpadeo del visor.
              if (found.archivo === prev.archivo && found.descripcion === prev.descripcion) {
                return prev;
              }
              return found;
            }
          }
          return panos360[0];
        });
      }
    } catch (err) {
      console.error('Error al cargar datos del inmueble:', err);
      if (!silencioso) {
        alert('No se pudo cargar la información del recorrido virtual.');
      }
    } finally {
      if (!silencioso) {
        setCargandoInmueble(false);
      }
    }
  }, [inmuebleId]);

  // ─── Reordenar Panoramas (Primera, Segunda, etc.) ───
  const reordenarPanorama = async (panoId, direccion) => {
    const idx = panoramas.findIndex((p) => p.id === panoId);
    if (idx === -1) return;

    const targetIdx = direccion === 'subir' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= panoramas.length) return;

    // 1. Clonar y realizar actualización optimista en el estado local
    const nuevosPanoramas = [...panoramas];
    const temp = nuevosPanoramas[idx];
    nuevosPanoramas[idx] = nuevosPanoramas[targetIdx];
    nuevosPanoramas[targetIdx] = temp;

    // Actualizar estado local inmediatamente para retroalimentación instantánea
    setPanoramas(nuevosPanoramas);
    setGuardadoStatus('guardando');

    try {
      // 2. Ejecutar las peticiones PATCH en segundo plano
      const promesas = nuevosPanoramas.map((pano, i) => {
        return inmuebleService.actualizarMultimedia(pano.id, { orden: i });
      });

      await Promise.all(promesas);
      // 3. Recargar silenciosamente de la base de datos para asegurar consistencia
      await cargarDatosPropiedad(true);
      setGuardadoStatus('sincronizado');
    } catch (err) {
      console.error('Error reordenando panoramas:', err);
      setGuardadoStatus('error');
      alert('Error al intentar cambiar el orden de las habitaciones.');
      // Revertir a la base de datos en caso de fallo real
      await cargarDatosPropiedad(false);
    }
  };

  useEffect(() => {
    cargarDatosPropiedad();
  }, [cargarDatosPropiedad]);

  // ─── Cargar Hotspots de la Escena Activa ───
  const cargarHotspotsEscena = useCallback(async () => {
    if (!panoramaActivo) return;
    try {
      const response = await inmuebleService.listarHotspots(inmuebleId);
      const todos = Array.isArray(response) ? response : (response?.results || []);
      // Filtrar los que se originan en este panorama
      const filtrados = todos.filter((h) => h.escena_origen === panoramaActivo.id);
      setExistingHotspots(filtrados);
    } catch (err) {
      console.error('Error cargando hotspots:', err);
    }
  }, [panoramaActivo, inmuebleId]);

  useEffect(() => {
    cargarHotspotsEscena();
    // Limpiar selecciones y borradores al cambiar de escena
    setPuntoManual(null);
    setHotspotSeleccionado(null);
    setConfirmandoEliminar(false);
  }, [panoramaActivo, cargarHotspotsEscena]);

  // ─── Inicializar el Visor Pannellum ───
  const inicializarVisor = useCallback(async () => {
    if (!panoramaActivo || !viewerRef.current) return;

    setCargandoImagen(true);

    // Destruir instancia previa
    if (viewerInstanceRef.current) {
      try {
        viewerInstanceRef.current.destroy();
      } catch {
        // Ignorar
      }
      viewerInstanceRef.current = null;
    }

    // Revocar ObjectURL previo
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    try {
      let panoramaUrl = '';
      try {
        // Forzar fetch con cache: 'reload' para evadir CORS y caching agresivo
        const response = await fetch(panoramaActivo.archivo, { cache: 'reload', mode: 'cors' });
        const blob = await response.blob();
        const objUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objUrl;
        panoramaUrl = objUrl;
      } catch (err) {
        console.warn('Fallo el fetch CORS para el editor, usando URL directa:', err);
        panoramaUrl = `${panoramaActivo.archivo}?cb=${new Date().getTime()}`;
      }

      if (!window.pannellum) {
        throw new Error('Pannellum no está disponible globalmente');
      }

      const viewer = window.pannellum.viewer(viewerRef.current, {
        type: 'equirectangular',
        panorama: panoramaUrl,
        autoLoad: true,
        crossOrigin: 'anonymous',
        compass: false,
        showZoomCtrl: true,
        showFullscreenCtrl: false,
        mouseZoom: true,
        draggable: true,
        hfov: 100,
        yaw: 0,
        pitch: 0,
        hotSpots: []
      });

      viewerInstanceRef.current = viewer;

      viewer.on('load', () => {
        setCargandoImagen(false);
        renderizarHotspotsEInyecciones();
      });

      // Timeout de carga de seguridad
      setTimeout(() => setCargandoImagen(false), 4000);
    } catch (err) {
      console.error('Error inicializando Pannellum en editor:', err);
      setCargandoImagen(false);
    }
  }, [panoramaActivo]);

  useEffect(() => {
    inicializarVisor();
    return () => {
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
        } catch { }
        viewerInstanceRef.current = null;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [inicializarVisor]);

  // ─── Renderizar Hotspots de Base de Datos y Borradores ───
  const renderizarHotspotsEInyecciones = () => {
    if (!viewerInstanceRef.current) return;

    // 1. Eliminar hotspots cargados previamente en el visor
    const config = viewerInstanceRef.current.getConfig();
    if (config.hotSpots) {
      config.hotSpots.forEach((hs) => {
        try {
          viewerInstanceRef.current.removeHotSpot(hs.id);
        } catch { }
      });
    }

    // 2. Renderizar Hotspots Existentes (Guardados en Base de Datos)
    existingHotspots.forEach((hs) => {
      const dest = panoramas.find((p) => p.id === hs.escena_destino);
      const destLabel = dest ? (dest.descripcion || 'Habitación') : 'Habitación Destino';

      viewerInstanceRef.current.addHotSpot({
        pitch: hs.pitch,
        yaw: hs.yaw,
        type: 'info',
        text: `${hs.texto_ayuda || 'Enlace'} (${destLabel})`,
        cssClass: 'editor-hotspot-saved',
        clickHandlerFunc: () => {
          setHotspotSeleccionado(hs);
          setConfirmandoEliminar(false);
          setPuntoManual(null);
        }
      });
    });

    // 3. Renderizar borrador manual si existe
    if (puntoManual) {
      viewerInstanceRef.current.addHotSpot({
        pitch: puntoManual.pitch,
        yaw: puntoManual.yaw,
        type: 'info',
        text: 'Nuevo Punto Manual (Borrador)',
        cssClass: 'editor-hotspot-manual-draft',
        clickHandlerFunc: () => {
          setHotspotSeleccionado(null);
        }
      });
    }
  };

  // Re-renderizar cuando cambien las listas
  useEffect(() => {
    renderizarHotspotsEInyecciones();
  }, [existingHotspots, puntoManual]);

  // ─── Capturar Clicks en el Visor (Modo Manual) ───
  const handleViewerClick = (e) => {
    if (!modoManual || !viewerInstanceRef.current) return;

    // mouseEventToCoords retorna [pitch, yaw] correspondientes al click
    const coords = viewerInstanceRef.current.mouseEventToCoords(e.nativeEvent || e);
    if (coords && coords.length === 2) {
      const [pitch, yaw] = coords;
      setPuntoManual({
        pitch: roundDecimal(pitch, 2),
        yaw: roundDecimal(yaw, 2)
      });
      setModoManual(false);
      setHotspotSeleccionado(null);
      setConfirmandoEliminar(false);
      // Pre-llenar formulario
      setTextoAyuda('Ir a...');
      setEscenaDestinoId('');
    }
  };

  const roundDecimal = (num, decimals) => {
    const p = Math.pow(10, decimals);
    return Math.round(num * p) / p;
  };

  // ─── Crear Hotspot ───
  const guardarEnlaceHotspot = async (e) => {
    e.preventDefault();
    if (!panoramaActivo || !escenaDestinoId) return;

    let targetPitch = 0;
    let targetYaw = 0;
    let descTooltip = textoAyuda.trim() || 'Siguiente habitación';

    if (puntoManual) {
      targetPitch = puntoManual.pitch;
      targetYaw = puntoManual.yaw;
    } else {
      return;
    }

    try {
      setGuardandoHotspot(true);
      setGuardadoStatus('guardando');

      // 1. Crear el Hotspot de Ida (Origen -> Destino)
      const forwardData = {
        inmueble: inmuebleId,
        escena_origen: panoramaActivo.id,
        escena_destino: parseInt(escenaDestinoId, 10),
        pitch: targetPitch,
        yaw: targetYaw,
        texto_ayuda: descTooltip
      };

      await inmuebleService.crearHotspot(forwardData);

      // 2. Si es bidireccional, crear el Hotspot de Retorno (Destino -> Origen)
      if (bidireccional) {
        // Calculamos un ángulo opuesto razonable para el retorno (yaw + 180)
        let reverseYaw = targetYaw + 180;
        if (reverseYaw > 180) reverseYaw -= 360;

        // Etiqueta de regreso
        const cleanName = panoramaActivo.descripcion
          ? panoramaActivo.descripcion.split('|')[1]?.trim() || panoramaActivo.descripcion
          : 'Regresar';

        const reverseData = {
          inmueble: inmuebleId,
          escena_origen: parseInt(escenaDestinoId, 10),
          escena_destino: panoramaActivo.id,
          pitch: 0.0, // Altura neutra por defecto
          yaw: roundDecimal(reverseYaw, 2),
          texto_ayuda: `Regresar a ${cleanName}`
        };

        try {
          await inmuebleService.crearHotspot(reverseData);
        } catch (revError) {
          console.warn('Fallo al crear enlace bidireccional de retorno:', revError);
          // No bloqueamos el flujo principal si el reverso falla (ej: ya existía un enlace similar)
        }
      }

      // Resetear estados de selección
      setPuntoManual(null);
      setEscenaDestinoId('');
      setTextoAyuda('');
      setConfirmandoEliminar(false);

      // Recargar base de datos
      await cargarHotspotsEscena();
      setGuardadoStatus('sincronizado');
      alert('¡Enlace de recorrido virtual creado correctamente!');
    } catch (err) {
      console.error(err);
      setGuardadoStatus('error');
      alert('Error al guardar punto de recorrido: ' + (err.response?.data?.detail || err.message));
    } finally {
      setGuardandoHotspot(false);
    }
  };

  // ─── Eliminar Hotspot ───
  const confirmarEliminacionEfectiva = async () => {
    if (!hotspotSeleccionado) return;
    try {
      setEliminando(true);
      setGuardadoStatus('guardando');
      await inmuebleService.eliminarHotspot(hotspotSeleccionado.id);
      setHotspotSeleccionado(null);
      setConfirmandoEliminar(false);
      await cargarHotspotsEscena();
      setGuardadoStatus('sincronizado');
    } catch (err) {
      console.error(err);
      setGuardadoStatus('error');
      alert('Error al eliminar punto de transición: ' + (err.response?.data?.detail || err.message));
    } finally {
      setEliminando(false);
    }
  };

  // ─── Miniaturas de otras habitaciones para dropdown ───
  const opcionesDestino = useMemo(() => {
    return panoramas.filter((p) => p.id !== panoramaActivo?.id);
  }, [panoramas, panoramaActivo]);

  // Convenciones de nombre de escena
  const cleanSceneLabel = (pano) => {
    if (!pano) return '';
    if (pano.descripcion && pano.descripcion.includes('|')) {
      return pano.descripcion.split('|')[1]?.trim() || pano.descripcion;
    }
    return pano.descripcion || 'Vista 360°';
  };

  const handleGuardarYFinalizar = () => {
    alert('¡Felicidades! El recorrido 3D ha sido configurado y guardado con éxito en la base de datos.');
    onClose();
  };

  if (cargandoInmueble) {
    return (
      <div className="editor-modal-wrapper">
        <div className="editor-modal-loader">
          <div className="editor-modal-spinner" />
          <h3>Cargando visor interactivo...</h3>
          <p>Preparando planos y fotografías panorámicas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-modal-wrapper">
      <div className="editor-modal-container">

        {/* Encabezado Principal */}
        <div className="editor-modal-header">
          <div className="editor-modal-header__info">
            <div className="editor-modal-header__icon">
              <Compass size={22} className="editor-modal-compass" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="editor-modal-header__badge">EDITOR DE RECORRIDO 3D</span>
                {guardadoStatus === 'guardando' && (
                  <span className="editor-status-badge editor-status-badge--saving">
                    <span className="editor-status-badge__dot editor-status-badge__dot--saving" />
                    Guardando...
                  </span>
                )}
                {guardadoStatus === 'sincronizado' && (
                  <span className="editor-status-badge editor-status-badge--saved">
                    <span className="editor-status-badge__dot editor-status-badge__dot--saved" />
                    Sincronizado en la nube
                  </span>
                )}
                {guardadoStatus === 'error' && (
                  <span className="editor-status-badge editor-status-badge--error">
                    <span className="editor-status-badge__dot editor-status-badge__dot--error" />
                    Error al guardar
                  </span>
                )}
              </div>
              <h2 className="editor-modal-header__title">{tituloPropiedad}</h2>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="editor-modal-save-finalize-btn" onClick={handleGuardarYFinalizar} type="button">
              <Check size={18} />
              <span>Guardar y Finalizar</span>
            </button>
            <button className="editor-modal-close-btn" onClick={onClose} type="button">
              <X size={18} />
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del Editor */}
        <div className="editor-modal-body">

          {/* LADO IZQUIERDO: Visor Pannellum */}
          <div
            className={`editor-viewport ${modoManual ? 'editor-viewport--selection-mode' : ''}`}
            onClick={handleViewerClick}
          >
            {/* Cargando panorama */}
            {cargandoImagen && (
              <div className="editor-viewport__loader">
                <div className="editor-viewport__spinner"></div>
                <span>Cargando habitación en 3D...</span>
              </div>
            )}

            {/* Banner superior de modo manual */}
            {modoManual && (
              <div className="editor-viewport__manual-banner">
                <Plus size={16} />
                <span>Modo Selección Activo: Haz clic sobre el lugar físico del panorama donde desees colocar la flecha.</span>
              </div>
            )}

            {/* El contenedor donde se inyecta Pannellum */}
            <div ref={viewerRef} className="editor-viewport__canvas" />
          </div>

          {/* LADO DERECHO: Panel de Control & Sidebar */}
          <div className="editor-sidebar">

            {/* 1. Selector de Habitación Activa */}
            <div className="editor-card">
              <h3 className="editor-card__title">1. Seleccionar Habitación</h3>
              <p className="editor-card__desc">Selecciona la habitación que deseas inspeccionar o enlazar:</p>

              {panoramas.length === 0 ? (
                <div className="editor-alert-info">
                  <AlertCircle size={16} />
                  <span>No has subido panoramas 360° para este inmueble todavía. Agrégalos en el formulario de edición tradicional.</span>
                </div>
              ) : (
                <div className="editor-room-list">
                  {panoramas.map((pano, idx) => {
                    const isActive = pano.id === panoramaActivo?.id;
                    const cleanName = cleanSceneLabel(pano);
                    const pisoNum = pano.descripcion?.includes('|') ? pano.descripcion.split('|')[0].trim() : 'Piso 1';

                    return (
                      <div
                        key={pano.id}
                        className={`editor-room-item-wrapper ${isActive ? 'editor-room-item-wrapper--active' : ''}`}
                      >
                        <button
                          className="editor-room-btn-select"
                          onClick={() => {
                            setPanoramaActivo(pano);
                            setConfirmandoEliminar(false);
                          }}
                          type="button"
                        >
                          <div className="editor-room-btn__img-wrapper">
                            <img src={pano.archivo} alt={pano.descripcion} className="editor-room-btn__img" />
                          </div>
                          <div className="editor-room-btn__info">
                            <span className="editor-room-btn__piso">{pisoNum}</span>
                            <span className="editor-room-btn__name">{cleanName}</span>
                          </div>
                        </button>

                        <div className="editor-room-order-controls">
                          <button
                            className="editor-room-order-btn"
                            disabled={idx === 0}
                            onClick={() => reordenarPanorama(pano.id, 'subir')}
                            title="Subir orden (se muestra antes)"
                            type="button"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            className="editor-room-order-btn"
                            disabled={idx === panoramas.length - 1}
                            onClick={() => reordenarPanorama(pano.id, 'bajar')}
                            title="Bajar orden (se muestra después)"
                            type="button"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Creador de Transiciones */}
            {panoramaActivo && (
              <div className="editor-card">
                <h3 className="editor-card__title">2. Añadir Punto de Transición</h3>
                <p className="editor-card__desc">
                  Crea una conexión interactiva en 3D para que el usuario pueda hacer clic en una parte del panorama y avanzar a otra habitación.
                </p>

                <div className="editor-action-buttons">
                  <button
                    className={`editor-btn-manual ${modoManual ? 'editor-btn-manual--active' : ''}`}
                    onClick={() => {
                      setModoManual(!modoManual);
                      setHotspotSeleccionado(null);
                      setConfirmandoEliminar(false);
                      setPuntoManual(null);
                    }}
                    disabled={cargandoImagen}
                    type="button"
                  >
                    <Plus size={16} />
                    <span>{modoManual ? 'Haz clic en el visor...' : 'Colocar Punto de Enlace'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Formulario para enlazar un punto manual */}
            {puntoManual && (
              <div className="editor-card editor-card--highlight">
                <div className="editor-card__flex-title">
                  <Link2 size={18} className="editor-primary-icon" />
                  <h3 className="editor-card__title" style={{ margin: 0 }}>Vincular Punto Espacial</h3>
                </div>

                <div className="editor-manual-prompt-info">
                  <p style={{ margin: 0 }}>
                    <strong>Punto manual seleccionado</strong> en:
                    yaw: {puntoManual.yaw}°, pitch: {puntoManual.pitch}°
                  </p>
                </div>

                <form onSubmit={guardarEnlaceHotspot} className="editor-link-form">
                  <div className="editor-form-group">
                    <label className="editor-label">¿A qué habitación conecta este acceso? *</label>
                    {opcionesDestino.length === 0 ? (
                      <div className="editor-alert-warning">
                        <AlertCircle size={14} />
                        <span>Necesitas subir al menos otro panorama 360° para enlazar.</span>
                      </div>
                    ) : (
                      <select
                        className="editor-select"
                        required
                        value={escenaDestinoId}
                        onChange={(e) => setEscenaDestinoId(e.target.value)}
                      >
                        <option value="">-- Seleccionar Habitación Destino --</option>
                        {opcionesDestino.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.descripcion || `Panorama #${p.id}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="editor-form-group">
                    <label className="editor-label">Texto de ayuda (tooltip) *</label>
                    <input
                      type="text"
                      className="editor-input"
                      required
                      placeholder="Ej: Ir a Cocina"
                      value={textoAyuda}
                      onChange={(e) => setTextoAyuda(e.target.value)}
                    />
                  </div>

                  <div className="editor-form-group editor-checkbox-group">
                    <label className="editor-checkbox-label">
                      <input
                        type="checkbox"
                        checked={bidireccional}
                        onChange={(e) => setBidireccional(e.target.checked)}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Crear enlace bidireccional</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 'normal' }}>
                          Crea automáticamente el camino de regreso para que el usuario no se quede atrapado.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="editor-form-actions">
                    <button
                      type="button"
                      className="editor-btn-secondary"
                      onClick={() => {
                        setPuntoManual(null);
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="editor-btn-primary"
                      disabled={guardandoHotspot || opcionesDestino.length === 0}
                    >
                      {guardandoHotspot ? 'Enlazando...' : 'Guardar Enlace'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. Visualización / Eliminación de Hotspots Existentes */}
            {hotspotSeleccionado && (
              <div className="editor-card editor-card--highlight-danger">
                <div className="editor-card__flex-title" style={{ color: '#ef4444' }}>
                  <Trash2 size={18} />
                  <h3 className="editor-card__title" style={{ margin: 0, color: '#ef4444' }}>Punto Espacial Enlazado</h3>
                </div>

                <div className="editor-hotspot-details">
                  <p>Este punto físico está vinculado a otra escena:</p>
                  <ul>
                    <li>
                      <strong>Tooltip:</strong> "{hotspotSeleccionado.texto_ayuda || 'N/A'}"
                    </li>
                    <li>
                      <strong>Habitación conectada:</strong>{' '}
                      {cleanSceneLabel(panoramas.find((p) => p.id === hotspotSeleccionado.escena_destino))}
                    </li>
                    <li>
                      <strong>Posición:</strong> pitch {hotspotSeleccionado.pitch}°, yaw {hotspotSeleccionado.yaw}°
                    </li>
                  </ul>
                </div>

                {confirmandoEliminar ? (
                  <div className="editor-delete-confirmation">
                    <p className="editor-delete-confirmation-msg">
                      <strong>¿Estás seguro?</strong> Esta acción eliminará permanentemente la conexión espacial.
                    </p>
                    <div className="editor-form-actions">
                      <button
                        type="button"
                        className="editor-btn-secondary"
                        onClick={() => setConfirmandoEliminar(false)}
                        disabled={eliminando}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="editor-btn-danger"
                        onClick={confirmarEliminacionEfectiva}
                        disabled={eliminando}
                      >
                        {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="editor-form-actions">
                    <button
                      type="button"
                      className="editor-btn-secondary"
                      onClick={() => {
                        setHotspotSeleccionado(null);
                        setConfirmandoEliminar(false);
                      }}
                    >
                      Cerrar Detalle
                    </button>
                    <button
                      type="button"
                      className="editor-btn-danger"
                      onClick={() => setConfirmandoEliminar(true)}
                    >
                      <Trash2 size={14} />
                      <span>Eliminar Enlace</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. Listado de Hotspots Existentes en la escena */}
            {panoramaActivo && (
              <div className="editor-card">
                <h3 className="editor-card__title">3. Enlaces en esta Habitación ({existingHotspots.length})</h3>
                <p className="editor-card__desc">Lista de puntos espaciales activos configurados en esta habitación:</p>

                {existingHotspots.length === 0 ? (
                  <div className="editor-no-data-placeholder">
                    <HelpCircle size={28} />
                    <span>No hay enlaces espaciales creados en esta habitación. ¡Coloca un punto de enlace en el visor para empezar!</span>
                  </div>
                ) : (
                  <div className="editor-active-hotspot-list">
                    {existingHotspots.map((hs) => {
                      const dest = panoramas.find((p) => p.id === hs.escena_destino);
                      const destLabel = cleanSceneLabel(dest);

                      return (
                        <div key={hs.id} className="editor-active-hotspot-item">
                          <div className="editor-active-hotspot-item__info">
                            <span className="editor-active-hotspot-item__text">
                              <strong>{hs.texto_ayuda || 'Ir a...'}</strong> &rarr; {destLabel}
                            </span>
                            <span className="editor-active-hotspot-item__coords">
                              Posición: {hs.pitch}°, {hs.yaw}°
                            </span>
                          </div>
                          <button
                            className="editor-active-hotspot-item__del-btn"
                            onClick={() => {
                              setHotspotSeleccionado(hs);
                              setPuntoManual(null);
                              setConfirmandoEliminar(true); // Abrir confirmación directamente
                              // Scroll visual al panel destacado
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            title="Inspeccionar / Eliminar"
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default EditorRecorrido;
