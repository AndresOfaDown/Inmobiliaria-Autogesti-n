import { formatCurrency } from '../utils/formatDates';
import Button from './Button';
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
      </div>

      {/* ── Body ───────────────────────────── */}
      <div className="inmueble-card__body">
        {tipo_nombre && (
          <span className="inmueble-card__tipo">{tipo_nombre}</span>
        )}
        <h3 className="inmueble-card__titulo">{titulo}</h3>
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
