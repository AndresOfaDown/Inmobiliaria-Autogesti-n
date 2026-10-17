import { useState, useEffect } from 'react';
import { Compass, Smartphone, Info } from 'lucide-react';
import '@google/model-viewer';
import './VisorAR.css';

const VisorAR = ({ modeloUrl = '', tituloPropiedad = '' }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    window.location.href
  )}`;

  if (!modeloUrl) {
    return (
      <div className="visor-ar__error">
        <Info size={24} />
        <p>No hay un plano 3D disponible para esta propiedad.</p>
      </div>
    );
  }

  return (
    <div className="visor-ar">
      <div className="visor-ar__container">
        {/* Lado Izquierdo: El Renderizador 3D */}
        <div className="visor-ar__canvas-wrapper">
          <model-viewer
            src={modeloUrl}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            poster="https://res.cloudinary.com/dwerzrgya/image/upload/v1776445025/3d-placeholder.jpg"
            shadow-intensity="1"
            auto-rotate
            rotation-per-second="20deg"
            alt={`Plano 3D interactivo de ${tituloPropiedad}`}
            style={{ width: '100%', height: '100%', background: 'var(--color-bg-secondary, #1e293b)' }}
          >
            {isMobile && (
              <button
                slot="ar-button"
                className="visor-ar__mobile-btn"
                type="button"
              >
                <Compass size={18} />
                Ver en mi espacio (AR)
              </button>
            )}
          </model-viewer>
        </div>

        {/* Lado Derecho: Instrucciones y QR (Sólo en Computadora) */}
        {!isMobile && (
          <div className="visor-ar__sidebar">
            <div className="visor-ar__header">
              <Smartphone size={20} className="visor-ar__icon" />
              <h3>Visualizar Plano en AR</h3>
            </div>
            <p className="visor-ar__instructions">
              Escanea el siguiente código QR con la cámara de tu celular para abrir este sitio web móvil e iniciar la proyección en Realidad Aumentada sobre tu mesa o suelo.
            </p>
            <div className="visor-ar__qr-wrapper">
              <img
                src={qrImageUrl}
                alt="Escanea para ver en AR móvil"
                className="visor-ar__qr-img"
              />
            </div>
            <div className="visor-ar__tip">
              <Info size={14} />
              <span>Asegúrate de conceder permisos de cámara al abrir la web en tu celular.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisorAR;
