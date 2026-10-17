import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { X, Layers, Gamepad, Smartphone } from 'lucide-react';
import './VisorVRGlasses.css';

const VRIcon = ({ size = 20, style = {} }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', ...style }}
  >
    <path d="M21 7H3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h3.2c1 .7 2.4 1 3.8 1s2.8-.3 3.8-1H21c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM7.5 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm9 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const VisorVRGlasses = ({ panoramas = [], onClose }) => {
  const [escenaActiva, setEscenaActiva] = useState(panoramas[0] || null);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState('');
  const [pantallaDoble, setPantallaDoble] = useState(false);
  const [gyroPermission, setGyroPermission] = useState('unknown');
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false);

  // ─── Refs para control del joystick (sin re-renders por frame) ────────────
  const rigRotationRef = useRef(0);
  const fovRef = useRef(80);
  // Dirección actual del zoom por tecla de volumen: 'in' | 'out' | null
  const volumeZoomDirectionRef = useRef(null);

  const sensorInicializado = useRef(false);
  const escenaActivaRef = useRef(escenaActiva);
  const panoramasRef = useRef(panoramas);
  const onCloseRef = useRef(onClose);

  useEffect(() => { escenaActivaRef.current = escenaActiva; }, [escenaActiva]);
  useEffect(() => { panoramasRef.current = panoramas; }, [panoramas]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      setGyroPermission('prompt');
    } else {
      setGyroPermission('granted');
    }
  }, []);

  const reloadLookControls = () => {
    const sceneEl = document.querySelector('a-scene');
    if (sceneEl) {
      const cameraEl = sceneEl.querySelector('a-camera');
      if (cameraEl) {
        cameraEl.removeAttribute('look-controls');
        setTimeout(() => {
          cameraEl.setAttribute(
            'look-controls',
            'magicWindowTrackingEnabled: true; touchEnabled: true; mouseEnabled: true'
          );
        }, 80);
      }
    }
  };

  const solicitarPermisoGiroscopio = async (silencioso = false) => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        setGyroPermission(permissionState);
        if (permissionState === 'granted') {
          reloadLookControls();
          sensorInicializado.current = true;
          if (!silencioso) alert('¡Permiso de sensor de movimiento concedido!');
        } else {
          if (!silencioso) alert('Permiso de giroscopio denegado.');
        }
      } catch (err) {
        console.error('Error al solicitar permiso de giroscopio:', err);
        if (!silencioso) alert('Error al solicitar permiso: ' + err.message);
      }
    } else {
      setGyroPermission('granted');
      reloadLookControls();
      sensorInicializado.current = true;
      if (!silencioso) alert('El sensor de movimiento ya está activo y soportado.');
    }
  };

  const handleVisorClick = () => {
    if (gyroPermission === 'prompt') {
      solicitarPermisoGiroscopio(true);
    } else if (!sensorInicializado.current) {
      reloadLookControls();
      sensorInicializado.current = true;
    }
  };

  const toggleOrientacion = async () => {
    try {
      const isLandscape = screen.orientation?.type.includes('landscape');
      const target = isLandscape ? 'portrait' : 'landscape';

      if (!document.fullscreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      }

      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock(target);
      } else {
        alert('Gira físicamente tu móvil para cambiar entre vertical y horizontal.');
      }
    } catch (err) {
      console.warn('No se pudo bloquear la orientación:', err);
      alert('Para cambiar de vista vertical/horizontal, activa la rotación automática en tu móvil y gíralo.');
    }
  };

  const togglePantallaDoble = (doble) => {
    const sceneEl = document.querySelector('a-scene');
    if (!sceneEl) return;
    try {
      if (doble) {
        sceneEl.enterVR();
        setPantallaDoble(true);
      } else {
        sceneEl.exitVR();
        setPantallaDoble(false);
      }
    } catch (err) {
      console.warn("No se pudo alternar el modo VR de A-Frame:", err);
    }
  };

  useEffect(() => {
    const sceneEl = document.querySelector('a-scene');
    if (!sceneEl) return;

    const handleEnterVR = () => setPantallaDoble(true);
    const handleExitVR = () => setPantallaDoble(false);

    sceneEl.addEventListener('enter-vr', handleEnterVR);
    sceneEl.addEventListener('exit-vr', handleExitVR);

    return () => {
      sceneEl.removeEventListener('enter-vr', handleEnterVR);
      sceneEl.removeEventListener('exit-vr', handleExitVR);
    };
  }, [escenaActiva]);

  useEffect(() => {
    import('aframe');
  }, []);

  // ─── Helpers para controles ───────────────────────────────────────────────

  /** Aplica la rotación actual del rig al elemento A-Frame de forma imperativa */
  const applyRigRotation = useCallback((newRot) => {
    rigRotationRef.current = newRot;
    const rig = document.getElementById('camera-rig');
    if (rig) {
      rig.setAttribute('rotation', `0 ${newRot} 0`);
    }
  }, []);

  /** Aplica el FOV actual a la cámara A-Frame de forma imperativa */
  const applyFov = useCallback((newFov) => {
    fovRef.current = newFov;
    const cameraEl = document.querySelector('a-camera');
    if (cameraEl) {
      cameraEl.setAttribute('camera', 'fov', newFov);
    }
  }, []);

  const triggerActiveHotspot = () => {
    const cursorEl = document.querySelector('a-cursor');
    if (cursorEl && cursorEl.components.cursor) {
      const intersectedEl = cursorEl.components.cursor.intersectedEl;
      if (intersectedEl) {
        intersectedEl.click();
      }
    }
  };

  const goToNextRoom = () => {
    const currentPanos = panoramasRef.current;
    const currentEscena = escenaActivaRef.current;
    if (!currentEscena || currentPanos.length <= 1) return;

    const currentIndex = currentPanos.findIndex(p => p.id === currentEscena.id);
    let nextEscena;
    if (currentIndex !== -1 && currentIndex < currentPanos.length - 1) {
      nextEscena = currentPanos[currentIndex + 1];
    } else {
      nextEscena = currentPanos[0];
    }
    setEscenaActiva(nextEscena);
  };

  const goToPrevRoom = () => {
    const currentPanos = panoramasRef.current;
    const currentEscena = escenaActivaRef.current;
    if (!currentEscena || currentPanos.length <= 1) return;

    const currentIndex = currentPanos.findIndex(p => p.id === currentEscena.id);
    let prevEscena;
    if (currentIndex > 0) {
      prevEscena = currentPanos[currentIndex - 1];
    } else {
      prevEscena = currentPanos[currentPanos.length - 1];
    }
    setEscenaActiva(prevEscena);
  };

  // ─── Escucha de teclado (botones del mando y teclado de PC) ───────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      const keyLower = key?.toLowerCase();
      const keyCode = e.keyCode || e.which;

      if (key === '@' || keyLower === '@') {
        e.preventDefault();
        triggerActiveHotspot();
        return;
      }
      if (keyLower === 'a') { e.preventDefault(); goToNextRoom(); return; }
      if (keyLower === 'b') { e.preventDefault(); goToPrevRoom(); return; }

      // Flechas de teclado como fallback
      if (key === 'ArrowRight') {
        e.preventDefault();
        applyRigRotation((rigRotationRef.current + 5) % 360);
      }
      if (key === 'ArrowLeft') {
        e.preventDefault();
        applyRigRotation((rigRotationRef.current - 5 + 360) % 360);
      }
      if (key === 'ArrowUp') {
        e.preventDefault();
        applyFov(Math.max(30, fovRef.current - 2));
      }
      if (key === 'ArrowDown') {
        e.preventDefault();
        applyFov(Math.min(100, fovRef.current + 2));
      }

      if (key === ' ' || key === 'Enter' || key === 'Trigger' || key === 'Select' || key === 'MediaPlayPause') {
        e.preventDefault();
        triggerActiveHotspot();
      }

      if (key === 'Escape' || key === 'Backspace' || keyLower === 'q') {
        e.preventDefault();
        onCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applyRigRotation, applyFov]);

  // ─────────────────────────────────────────────────────────────────────────────
  // SOLUCIÓN PARA MANDOS BT QUE ENVÍAN VolumeUp/VolumeDown EN ANDROID
  // ─────────────────────────────────────────────────────────────────────────────
  // En Android, el sistema operativo procesa las teclas de volumen ANTES de que
  // Chrome las reciba. e.preventDefault() NO puede evitar el cambio de volumen.
  //
  // ESTRATEGIA: Usamos un <audio> oculto reproduciendo silencio. Cuando el mando
  // envía VolumeUp/Down, Android cambia el volumen de ESTE audio en lugar del
  // volumen del sistema (porque hay media activa). Detectamos ese cambio de
  // volumen y lo convertimos en zoom. Luego restauramos el volumen del audio
  // a 0.5 para tener rango en ambas direcciones.
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // 1. Crear un AudioContext con oscilador silencioso para reclamar media session
    let audioCtx = null;
    let gainNode = null;
    let oscillator = null;
    let silentAudio = null;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.001; // Prácticamente inaudible
      gainNode.connect(audioCtx.destination);

      oscillator = audioCtx.createOscillator();
      oscillator.frequency.value = 1; // 1 Hz, inaudible
      oscillator.connect(gainNode);
      oscillator.start();
    } catch (err) {
      console.warn('No se pudo crear AudioContext silencioso:', err);
    }

    // 2. Crear un <audio> oculto. Lo usamos para detectar cambios de volumen.
    //    Cuando Android cambia el volumen multimedia, el .volume de este elemento
    //    NO cambia (es un volumen relativo), PERO podemos usar las teclas keydown
    //    como señal de dirección.
    //    La verdadera clave es que con media activa, las teclas de volumen
    //    controlan el volumen MULTIMEDIA y no el del TIMBRE, lo cual es menos molesto.

    // 3. Interceptar VolumeUp/VolumeDown con captura agresiva en keydown Y keyup
    //    para saber cuándo empieza y cuándo termina el movimiento del joystick.
    const handleVolumeKeyDown = (e) => {
      const isVolumeUp = e.key === 'VolumeUp' || e.key === 'AudioVolumeUp' || e.keyCode === 24;
      const isVolumeDown = e.key === 'VolumeDown' || e.key === 'AudioVolumeDown' || e.keyCode === 25;

      if (isVolumeUp || isVolumeDown) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Marcar la dirección del zoom (el rAF loop se encarga de aplicarlo suavemente)
        if (isVolumeUp) {
          volumeZoomDirectionRef.current = 'in';  // Joystick adelante → Zoom IN
        } else {
          volumeZoomDirectionRef.current = 'out'; // Joystick atrás → Zoom OUT
        }
        return false;
      }
    };

    const handleVolumeKeyUp = (e) => {
      const isVolume = e.key === 'VolumeUp' || e.key === 'AudioVolumeUp' || 
                       e.key === 'VolumeDown' || e.key === 'AudioVolumeDown' ||
                       e.keyCode === 24 || e.keyCode === 25;

      if (isVolume) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        volumeZoomDirectionRef.current = null; // Joystick suelto → parar zoom
        return false;
      }
    };

    // Registrar en TODOS los niveles posibles, en fase de captura (lo más temprano posible)
    const opts = { capture: true, passive: false };
    window.addEventListener('keydown', handleVolumeKeyDown, opts);
    window.addEventListener('keyup', handleVolumeKeyUp, opts);
    document.addEventListener('keydown', handleVolumeKeyDown, opts);
    document.addEventListener('keyup', handleVolumeKeyUp, opts);

    // Si el usuario suelta sin keyup (pierde foco, etc.), reset con timeout
    let volumeResetTimer = null;
    const safeResetVolume = () => {
      clearTimeout(volumeResetTimer);
      volumeResetTimer = setTimeout(() => {
        volumeZoomDirectionRef.current = null;
      }, 300); // Si no recibimos otro keydown en 300ms, asumimos que soltó
    };

    const handleVolumeKeyDownWithReset = (e) => {
      const isVolume = e.key === 'VolumeUp' || e.key === 'AudioVolumeUp' || 
                       e.key === 'VolumeDown' || e.key === 'AudioVolumeDown' ||
                       e.keyCode === 24 || e.keyCode === 25;
      if (isVolume) {
        safeResetVolume();
      }
    };
    window.addEventListener('keydown', handleVolumeKeyDownWithReset);

    return () => {
      window.removeEventListener('keydown', handleVolumeKeyDown, opts);
      window.removeEventListener('keyup', handleVolumeKeyUp, opts);
      document.removeEventListener('keydown', handleVolumeKeyDown, opts);
      document.removeEventListener('keyup', handleVolumeKeyUp, opts);
      window.removeEventListener('keydown', handleVolumeKeyDownWithReset);
      clearTimeout(volumeResetTimer);

      if (oscillator) { try { oscillator.stop(); } catch(e) { /* ignore */ } }
      if (audioCtx) { try { audioCtx.close(); } catch(e) { /* ignore */ } }
      if (silentAudio) { silentAudio.pause(); silentAudio.remove(); }
    };
  }, []);

  // ─── Loop unificado de zoom y Gamepad API ─────────────────────────────────
  // Un solo requestAnimationFrame que maneja AMBOS: el zoom por tecla de volumen
  // y el polling del Gamepad API (ejes analógicos + botones).
  useEffect(() => {
    let rafId;
    let lastButtonStates = {};
    let prevConnected = false;
    let prevGamepadName = '';

    const DEADZONE = 0.18;
    const ROT_SPEED = 2.0;
    const FOV_SPEED = 0.6;
    const VOLUME_ZOOM_SPEED = 1.5; // Velocidad del zoom por tecla de volumen (por frame)

    const mainLoop = () => {

      // ── A) Zoom continuo por VolumeUp/VolumeDown del mando BT ─────────
      const zoomDir = volumeZoomDirectionRef.current;
      if (zoomDir === 'in') {
        applyFov(Math.max(30, fovRef.current - VOLUME_ZOOM_SPEED));
      } else if (zoomDir === 'out') {
        applyFov(Math.min(100, fovRef.current + VOLUME_ZOOM_SPEED));
      }

      // ── B) Gamepad API: botones y ejes analógicos ─────────────────────
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let activeGamepad = null;

      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) { activeGamepad = gamepads[i]; break; }
      }

      if (activeGamepad) {
        if (!prevConnected || prevGamepadName !== activeGamepad.id) {
          prevConnected = true;
          prevGamepadName = activeGamepad.id;
          setGamepadConnected(true);
          setGamepadName(activeGamepad.id);
        }

        // Botones
        activeGamepad.buttons.forEach((btn, index) => {
          const pressed = btn.pressed || btn.value > 0.5;
          const wasPressed = lastButtonStates[index] || false;

          if (pressed && !wasPressed) {
            if (index === 0) goToNextRoom();
            else if (index === 1) goToPrevRoom();
            else triggerActiveHotspot();
          }
          lastButtonStates[index] = pressed;
        });

        // Joystick analógico (ejes)
        let axisX = 0;
        let axisY = 0;

        if (activeGamepad.axes.length >= 2) {
          axisX = activeGamepad.axes[0];
          axisY = activeGamepad.axes[1];
        }
        if (Math.abs(axisX) < 0.05 && Math.abs(axisY) < 0.05 && activeGamepad.axes.length >= 4) {
          axisX = activeGamepad.axes[2];
          axisY = activeGamepad.axes[3];
        }
        if (Math.abs(axisX) < 0.05 && Math.abs(axisY) < 0.05) {
          for (let j = 0; j < activeGamepad.axes.length; j++) {
            const val = activeGamepad.axes[j];
            if (Math.abs(val) > DEADZONE) {
              if (j % 2 === 0) axisX = val;
              else axisY = val;
            }
          }
        }

        // Rotación horizontal
        if (Math.abs(axisX) > DEADZONE) {
          const sign = axisX > 0 ? 1 : -1;
          const magnitude = axisX * axisX * sign;
          let newRot = rigRotationRef.current - magnitude * ROT_SPEED;
          newRot = ((newRot % 360) + 360) % 360;
          applyRigRotation(newRot);
        }

        // Zoom con joystick analógico
        if (Math.abs(axisY) > DEADZONE) {
          const newFov = Math.max(30, Math.min(100, fovRef.current + axisY * FOV_SPEED));
          applyFov(newFov);
        }

      } else {
        if (prevConnected) {
          prevConnected = false;
          prevGamepadName = '';
          setGamepadConnected(false);
          setGamepadName('');
        }
      }

      rafId = requestAnimationFrame(mainLoop);
    };

    rafId = requestAnimationFrame(mainLoop);
    return () => cancelAnimationFrame(rafId);
  }, [applyFov, applyRigRotation]);

  // Convertir coordenadas esféricas (pitch, yaw) a coordenadas cartesianas 3D
  const getPositionFromPitchYaw = (pitch, yaw, radius = 3.5) => {
    const phi = (pitch * Math.PI) / 180;
    const theta = (yaw * Math.PI) / 180;

    const x = radius * Math.cos(phi) * Math.sin(theta);
    const y = radius * Math.sin(phi);
    const z = -radius * Math.cos(phi) * Math.cos(theta);

    return `${x} ${y} ${z}`;
  };

  // Buscar y asociar los hotspots reales de la escena activa
  const hotspots3D = useMemo(() => {
    if (!escenaActiva) return [];
    return (escenaActiva.hotspots || []).map((h) => {
      const destinoPano = panoramas.find((p) => p.id === h.escena_destino);
      let label = h.texto_ayuda || '';
      if (!label && destinoPano) {
        const desc = destinoPano.descripcion || '';
        label = desc.includes('|') ? desc.split('|')[1].trim() : desc;
      }
      let labelText = label ? label.toUpperCase().trim() : 'IR A HABITACIÓN';
      const needsPrefix = !labelText.startsWith('IR A') && 
                          !labelText.startsWith('REGRESAR A') && 
                          !labelText.startsWith('ENTRAR A') && 
                          !labelText.startsWith('VOLVER A');
      if (needsPrefix && label) {
        labelText = `IR A: ${labelText}`;
      }
      return {
        ...h,
        label: labelText,
        position: getPositionFromPitchYaw(h.pitch, h.yaw),
        destinoPano,
      };
    });
  }, [escenaActiva, panoramas]);

  if (!escenaActiva) return null;

  return (
    <div className="visor-vr-glasses" onClick={handleVisorClick} onTouchStart={handleVisorClick}>
      
      {/* 1. Modal de Instrucciones de VR y Mando */}
      {mostrarInstrucciones && (
        <div className="visor-vr-glasses__instructions-overlay">
          <div className="visor-vr-glasses__instructions-card" onClick={(e) => e.stopPropagation()}>
            <h3><VRIcon size={26} style={{ color: '#3b82f6' }} /> Instrucciones de Recorrido VR</h3>
            <p className="subtitle">Uso de tus Gafas VR y Mando Bluetooth:</p>
            
            <div className="instruction-steps">
              <div className="step">
                <span className="step-num">A</span>
                <div>
                  <strong>Avanzar Habitación:</strong> Presiona el botón <strong>A</strong> en tu mando para cambiar a la siguiente habitación.
                </div>
              </div>
              <div className="step">
                <span className="step-num">B</span>
                <div>
                  <strong>Retroceder Habitación:</strong> Presiona el botón <strong>B</strong> en tu mando para regresar a la habitación anterior.
                </div>
              </div>
              <div className="step">
                <span className="step-num">@</span>
                <div>
                  <strong>Entrar a un Enlace:</strong> Apunta la mirada (círculo azul) hacia una esfera de transición y presiona el botón <strong>@</strong> (o gatillo) para teletransportarte.
                </div>
              </div>
              <div className="step">
                <span className="step-num">🕹️</span>
                <div>
                  <strong>Joystick / Palanca analógica:</strong>
                  <br />• Empuja <strong>hacia adelante</strong> para hacer <strong>Zoom IN</strong> (acercar imagen).
                  <br />• Jala <strong>hacia atrás</strong> para hacer <strong>Zoom OUT</strong> (alejar imagen).
                  <br />• Mueve a los <strong>lados</strong> para <strong>girar la cámara</strong>.
                </div>
              </div>
            </div>

            <div className="instructions-tip" style={{
              margin: '12px 0', padding: '10px 14px',
              background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.5'
            }}>
              <strong style={{ color: '#60a5fa' }}>💡 Consejo:</strong> Si tu mando tiene un interruptor de modo 
              (Game / Music / Selfie), usa el modo <strong style={{ color: '#60a5fa' }}>Game</strong> para 
              mejor experiencia. Si el joystick cambia el volumen del celular, el zoom 
              funcionará igualmente.
            </div>

            <div className="instructions-actions">
              <button 
                className="start-vr-btn"
                onClick={() => {
                  setMostrarInstrucciones(false);
                  togglePantallaDoble(true);
                }}
                type="button"
              >
                <VRIcon size={18} style={{ color: '#fff', marginRight: '8px' }} />
                Empezar Recorrido (Pantalla Doble)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cabecera de controles flotantes */}
      {!pantallaDoble && (
        <div className="visor-vr-glasses__ui">
          <div className="visor-vr-glasses__nav-group">
            <button
              className="visor-vr-glasses__close-btn"
              onClick={onClose}
              type="button"
            >
              <X size={18} />
              <span>Salir de VR</span>
            </button>

            <button
              className="visor-vr-glasses__close-btn"
              onClick={toggleOrientacion}
              title="Cambiar orientación de pantalla"
              type="button"
            >
              <Smartphone size={16} />
              <span>Girar Pantalla</span>
            </button>

            {gyroPermission === 'prompt' && (
              <button
                className="visor-vr-glasses__close-btn"
                style={{ background: '#f59e0b', color: '#fff', borderColor: '#d97706' }}
                onClick={solicitarPermisoGiroscopio}
                title="Activar sensor de movimiento"
                type="button"
              >
                <span>Activar Giroscopio</span>
              </button>
            )}

            {gamepadConnected && (
              <span
                className="visor-vr-glasses__close-btn"
                style={{ background: '#10b981', color: '#fff', borderColor: '#059669', cursor: 'default', fontSize: '0.75rem' }}
                title={`Mando conectado: ${gamepadName}`}
              >
                <Gamepad size={16} />
                <span>Mando ✓</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. Selector de Habitaciones */}
      {!pantallaDoble && panoramas.length > 1 && (
        <div className="visor-vr-glasses__selector" onClick={(e) => e.stopPropagation()}>
          <span className="visor-vr-glasses__selector-title">
            <Layers size={14} /> <span>Habitaciones:</span>
          </span>
          <div className="visor-vr-glasses__btns">
            {panoramas.map((pano) => {
              const habitacion = pano.descripcion?.includes('|')
                ? pano.descripcion.split('|')[1].trim()
                : pano.descripcion || 'Vista 360°';

              return (
                <button
                  key={pano.id}
                  className={`visor-vr-glasses__pano-btn ${
                    escenaActiva.id === pano.id ? 'active' : ''
                  }`}
                  onClick={() => setEscenaActiva(pano)}
                  type="button"
                >
                  {habitacion}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Escena VR en A-Frame */}
      <a-scene 
        embedded 
        cursor="rayOrigin: mouse; fuse: false"
        style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
      >
        <a-assets>
          {panoramas.map((pano) => (
            <img
              key={`pano-asset-${pano.id}`}
              id={`pano-${pano.id}`}
              src={pano.archivo}
              crossOrigin={pano.archivo?.startsWith('blob:') ? undefined : 'anonymous'}
              alt={pano.descripcion}
            />
          ))}
        </a-assets>

        {/* Esfera 360° */}
        <a-sky
          src={`#pano-${escenaActiva.id}`}
          rotation="0 -90 0"
        ></a-sky>

        {/* Hotspots 3D Interactivos */}
        {hotspots3D.map((h, idx) => (
          <a-entity
            key={`${escenaActiva.id}-hotspot-${idx}`}
            position={h.position}
            onClick={() => {
              if (h.destinoPano) {
                setEscenaActiva(h.destinoPano);
              }
            }}
          >
            <a-sphere
              radius="0.16"
              color="#3b82f6"
              material="emissive: #2563eb; emissiveIntensity: 1; roughness: 0.1"
              animation="property: scale; to: 1.2 1.2 1.2; dir: alternate; dur: 800; loop: true"
            ></a-sphere>

            <a-ring
              radius-inner="0.22"
              radius-outer="0.26"
              color="#60a5fa"
              material="side: double; opacity: 0.8"
            ></a-ring>

            <a-entity position="0 0.5 0" rotation="0 0 0">
              <a-plane
                width="1.8"
                height="0.4"
                color="#0f172a"
                material="opacity: 0.8; shader: flat; transparent: true"
              ></a-plane>
              <a-text
                value={h.label}
                align="center"
                color="#ffffff"
                width="4.2"
                position="0 0 0.02"
              ></a-text>
            </a-entity>
          </a-entity>
        ))}

        {/* Rig de la Cámara — la rotación se controla imperativamente vía setAttribute */}
        <a-entity id="camera-rig" rotation="0 0 0">
          <a-camera
            fov="80"
            look-controls="magicWindowTrackingEnabled: true; touchEnabled: true; mouseEnabled: true"
            wasd-controls="enabled: false"
          >
            <a-cursor
              color="#3b82f6"
              fuse="true"
              fuse-timeout="1500"
              design="ring"
              animation__fusing="property: scale; startEvents: fusing; easing: easeInCubic; dur: 1500; from: 1 1 1; to: 0.1 0.1 0.1"
              animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 1 1 1"
              animation__mouseleave="property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 500; to: 1 1 1"
            ></a-cursor>
          </a-camera>
        </a-entity>
      </a-scene>
    </div>
  );
};

export default VisorVRGlasses;
