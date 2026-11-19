import { formatCurrency } from '../utils/formatDates';
import Button from './Button';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff } from 'lucide-react';
import './InmuebleCard.css';

/**
 * Componente presentacional para mostrar un inmueble en tarjeta.
 *
 * @param {Object} props
 * @param {Object} props.inmueble - Datos del inmueble
 * @param {Function} props.onEdit - Callback al pulsar "Editar"
 * @param {Function} props.onDelete - Callback al pulsar "Eliminar"
 */
const InmuebleCard = ({ inmueble, onEdit, onDelete }) => {
  const {
    id,
    titulo,
    tipo_nombre,
    precio,
    estado,
    habitaciones,
    banos,
    imagen_principal,
  } = inmueble;

  const ciudad = inmueble.direccion_fk?.ciudad || '';
  const zona = inmueble.direccion_fk?.zona || '';

  const estadoLabel = {
    disponible: 'Disponible',
    ocupado: 'Ocupado',
    mantenimiento: 'En Mant.',
    reservado: 'Reservado',
  };

  return (
    <article className="inmueble-card" id={`inmueble-card-${id}`}>
      {/* ── Imagen ─────────────────────────── */}
      <div className="inmueble-card__image-wrapper">
        {imagen_principal ? (
          <img
            className="inmueble-card__image"
            src={imagen_principal}
            alt={titulo}
            loading="lazy"
          />
        ) : (
          <div className="inmueble-card__placeholder">Imagen No Disponible</div>
        )}

        <span className={`inmueble-card__badge inmueble-card__badge--${estado}`}>
          {estadoLabel[estado] || estado}
        </span>
        {inmueble.multimedia?.some(m => m.tipo === 'panorama360') && (
          <span style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            color: '#38bdf8',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            zIndex: 2
          }}>
            🧭 Tour 360°
          </span>
        )}
      </div>

      {/* ── Body ───────────────────────────── */}
      <div className="inmueble-card__body">
        {tipo_nombre && (
          <span className="inmueble-card__tipo">{tipo_nombre}</span>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <h3 className="inmueble-card__titulo" style={{ margin: 0, flex: 1 }}>{titulo}</h3>
          {inmueble.verificacion_estado === 'verificado' ? (
            <span title="Propiedad Oficialmente Verificada con Valor Legal" style={{ display: 'inline-flex', flexShrink: 0, marginTop: '2px' }}>
              <ShieldCheck size={18} color="#16a34a" />
            </span>
          ) : (
            <span title="Propiedad sin verificación legal oficial" style={{ display: 'inline-flex', flexShrink: 0, marginTop: '2px' }}>
              <ShieldOff size={16} color="#94a3b8" />
            </span>
          )}
        </div>
        <p className="inmueble-card__location">
          {ciudad}{zona ? `, ${zona}` : ''}
        </p>
        <div className="inmueble-card__features">
          <span>{habitaciones} Hab.</span>
          <span>{banos} Baños</span>
        </div>
      </div>

      {/* ── Footer ─────────────────────────── */}
      <div className="inmueble-card__footer">
        <span className="inmueble-card__price">
          {formatCurrency(precio)}
        </span>
        <div className="inmueble-card__actions">
          <Button variant="ghost" size="sm" onClick={() => onEdit(id)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(inmueble)}>
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  );
};

export default InmuebleCard;
