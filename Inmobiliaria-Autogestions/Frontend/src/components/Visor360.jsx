import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Maximize2, Minimize2, Layers, Compass } from 'lucide-react';
import 'pannellum/build/pannellum.css';
import 'pannellum';
import ModalRecorrido3D from './ModalRecorrido3D';
import api from '../services/api';
import './Visor360.css';
/**
 * Visor360 — Componente de exploración inmersiva con panoramas 360°.
 *
 * Soporta navegación de dos niveles:
 *   1. Selector de pisos (pills)
 *   2. Tabs de habitaciones dentro del piso seleccionado
 *
 * Convención del campo `descripcion` de Multimedia:
 *   "Piso N | Habitación"  →  ej: "Piso 1 | Sala", "Piso 2 | Dormitorio"
 *   Si no contiene "|", se asume "Piso 1 | {descripcion}"
 *
 * @param {{ panoramas: Array<{id: number, archivo: string, descripcion: string}> }} props
 */
const Visor360 = ({ panoramas = [], accesoId = null, musica = null }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const [pisoActivo, setPisoActivo] = useState('');
  const [escenaActiva, setEscenaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);

  // ─── Latido de Conexión (Heartbeat) para Analíticas ──────────────────
  useEffect(() => {
    if (!accesoId) return;

    const ping = () => {
      api.post(`/inmuebles/accesos-360/${accesoId}/ping_visor/`).catch(() => {});
    };

    // Ping inmediato al abrir
    ping();

    // Ping continuo cada 10 segundos
    const intervalId = setInterval(ping, 10000);

    return () => clearInterval(intervalId);
  }, [accesoId]);

  // ─── Parsear y agrupar panoramas por piso ────────────────────────────
  const pisosParsed = useMemo(() => {
    /** @type {Map<string, Array<{id: number, archivo: string, habitacion: string}>>} */
    const mapa = new Map();

    panoramas.forEach((p) => {
      let piso = 'Piso 1';
      let habitacion = p.descripcion || 'Vista 360°';

      if (p.descripcion && p.descripcion.includes('|')) {
        const partes = p.descripcion.split('|');
        piso = partes[0].trim();
        habitacion = partes[1]?.trim() || 'Vista 360°';
      }

      if (!mapa.has(piso)) {
        mapa.set(piso, []);
      }
      mapa.get(piso).push({
        id: p.id,
        archivo: p.archivo,
        habitacion,
      });
    });

    return mapa;
  }, [panoramas]);

  const nombresPisos = useMemo(() => Array.from(pisosParsed.keys()).sort(), [pisosParsed]);
  const tieneMasDeUnPiso = nombresPisos.length > 1;

  const habitacionesDelPiso = useMemo(
    () => pisosParsed.get(pisoActivo) || [],
    [pisosParsed, pisoActivo]
  );

  // ─── Inicializar piso y escena por defecto ───────────────────────────
  useEffect(() => {
    if (nombresPisos.length > 0 && !pisoActivo) {
      setPisoActivo(nombresPisos[0]);
    }
  }, [nombresPisos, pisoActivo]);

  useEffect(() => {
    if (habitacionesDelPiso.length > 0) {
      setEscenaActiva(habitacionesDelPiso[0]);
    }
  }, [habitacionesDelPiso]);

  // ─── Referencia para el ObjectURL del Blob ───────────────────────────
  const objectUrlRef = useRef(null);

  // ─── Inicializar / Actualizar Pannellum ──────────────────────────────
  const inicializarVisor = useCallback(async () => {
    if (isModalOpen) {
      // Destruir instancia previa para liberar WebGL context antes de abrir el modal full screen
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
        } catch {
          // Ignorar
        }
        viewerInstanceRef.current = null;
      }
      return;
    }

    if (!escenaActiva || !viewerRef.current) return;

    setCargando(true);

    // Destruir instancia previa si existe
    if (viewerInstanceRef.current) {
      try {
        viewerInstanceRef.current.destroy();
      } catch {
        // Ignorar errores al destruir
      }
      viewerInstanceRef.current = null;
    }

    // Liberar ObjectURL previo
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    try {
      const imageUrl = escenaActiva.archivo;
      let panoramaUrl = imageUrl || '';

      if (imageUrl) {
        // Intentar fetch con CORS — si falla, usar la URL directa (Pannellum la maneja nativamente)
        try {
          const response = await fetch(imageUrl, { cache: 'force-cache', mode: 'cors' });
          if (response.ok) {
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            objectUrlRef.current = objectUrl;
            panoramaUrl = objectUrl;
          }
          // Si no es ok, panoramaUrl ya tiene imageUrl (fallback)
        } catch {
          // Fallback: usar URL directa — Pannellum usa crossOrigin anonymous internamente
          panoramaUrl = imageUrl;
        }
      }

      // Inicializar Visor
      if (!window.pannellum) {
        throw new Error('Pannellum no se inicializó correctamente en el objeto window');
      }
      
      if (!viewerRef.current) return;

      viewerInstanceRef.current = window.pannellum.viewer(viewerRef.current, {
        type: 'equirectangular',
        panorama: panoramaUrl,
        autoLoad: true,
        crossOrigin: 'anonymous',
        autoRotate: -2,
        autoRotateInactivityDelay: 3000,
        compass: false,
        showZoomCtrl: true,
        showFullscreenCtrl: false,
        mouseZoom: true,
        draggable: true,
        hfov: 110,
        minHfov: 50,
        maxHfov: 120,
        friction: 0.15,
        yaw: 0,
        pitch: 0,
      });

      viewerInstanceRef.current.on('load', () => {
        setCargando(false);
      });

      // Si falla con blob URL, reintentar con URL directa
      viewerInstanceRef.current.on('error', () => {
        if (panoramaUrl !== imageUrl && imageUrl && viewerRef.current) {
          try {
            if (viewerInstanceRef.current) viewerInstanceRef.current.destroy();
          } catch { /* ignorar */ }
          viewerInstanceRef.current = window.pannellum.viewer(viewerRef.current, {
            type: 'equirectangular',
            panorama: imageUrl,
            autoLoad: true,
            crossOrigin: 'anonymous',
            autoRotate: -2,
            autoRotateInactivityDelay: 3000,
            compass: false,
            showZoomCtrl: true,
            showFullscreenCtrl: false,
            mouseZoom: true,
            draggable: true,
            hfov: 110,
            minHfov: 50,
            maxHfov: 120,
            friction: 0.15,
          });
          viewerInstanceRef.current.on('load', () => setCargando(false));
        }
        setTimeout(() => setCargando(false), 4000);
      });

      // Fallback timeout en caso de que el evento 'load' no se dispare
      setTimeout(() => setCargando(false), 6000);
    } catch (error) {
      console.error('Error inicializando Pannellum:', error);
      setCargando(false);
    }
  }, [escenaActiva, isModalOpen]);

  useEffect(() => {
    inicializarVisor();

    return () => {
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
        } catch {
          // Ignorar
        }
        viewerInstanceRef.current = null;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [inicializarVisor, isModalOpen]);

  // Escuchar eventos de pantalla completa para sincronizar estado e íconos
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Forzar redibujado de Pannellum despachando un evento resize
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────
  const cambiarPiso = (nombrePiso) => {
    if (nombrePiso === pisoActivo) return;
    setPisoActivo(nombrePiso);
  };

  const cambiarEscena = (escena) => {
    if (escena.id === escenaActiva?.id) return;
    setEscenaActiva(escena);
  };

  const toggleFullscreen = () => {
    const wrapper = viewerRef.current?.parentElement;
    if (!wrapper) return;

    if (!document.fullscreenElement) {
      wrapper.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  };

  // ─── Sin panoramas: no renderizar ────────────────────────────────────
  if (panoramas.length === 0) return null;

  return (
    <div className="visor360">
      {/* Encabezado */}
      <div className="visor360__header">
        <div className="visor360__header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Recorrido Virtual 360°</h2>
          <p>Explora el inmueble arrastrando la imagen con el mouse o tocando la pantalla</p>
        </div>
        <button
          className="visor360__start-tour-btn"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <Compass size={16} className="visor360__start-tour-icon" />
          Iniciar recorrido virtual
        </button>
      </div>

      {isModalOpen && (
        <ModalRecorrido3D
          panoramas={panoramas}
          onClose={() => setIsModalOpen(false)}
          musica={musica}
        />
      )}

      {/* Selector de pisos (solo si hay más de 1) */}
      {tieneMasDeUnPiso && (
        <div className="visor360__pisos">
          {nombresPisos.map((nombre) => (
            <button
              key={nombre}
              className={`visor360__piso-btn ${pisoActivo === nombre ? 'visor360__piso-btn--active' : ''}`}
              onClick={() => cambiarPiso(nombre)}
              type="button"
            >
              <Layers size={14} />
              {nombre}
            </button>
          ))}
        </div>
      )}

      {/* Tabs de habitaciones */}
      {habitacionesDelPiso.length > 1 && (
        <div className="visor360__tabs">
          {habitacionesDelPiso.map((esc) => (
            <button
              key={esc.id}
              className={`visor360__tab ${escenaActiva?.id === esc.id ? 'visor360__tab--active' : ''}`}
              onClick={() => cambiarEscena(esc)}
              type="button"
            >
              {esc.habitacion}
            </button>
          ))}
        </div>
      )}

      {/* Contenedor del visor */}
      <div className="visor360__viewer-wrapper">
        {/* Loading overlay */}
        <div className={`visor360__loading ${!cargando ? 'visor360__loading--hidden' : ''}`}>
          <div className="visor360__spinner" />
          <span className="visor360__loading-text">Cargando panorama 360°...</span>
        </div>

        {/* Pannellum viewer */}
        <div ref={viewerRef} className="visor360__viewer" id="visor360-pannellum" />

        {/* Barra inferior de controles */}
        <div className="visor360__controls">
          <div className="visor360__scene-label">
            {tieneMasDeUnPiso && (
              <span className="visor360__scene-badge">{pisoActivo}</span>
            )}
            <span>{escenaActiva?.habitacion || 'Vista 360°'}</span>
          </div>
          <button
          className="visor360__fullscreen-btn"
          onClick={toggleFullscreen}
          type="button"
        >
          {isFullscreen ? (
            <>
              <Minimize2 size={14} />
              Salir de pantalla completa
            </>
          ) : (
            <>
              <Maximize2 size={14} />
              Pantalla completa
            </>
          )}
        </button>
        </div>
      </div>
    </div>
  );
};

export default Visor360;
