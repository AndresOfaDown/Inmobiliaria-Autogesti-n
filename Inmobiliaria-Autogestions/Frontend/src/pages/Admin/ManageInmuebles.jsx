import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff, Filter } from 'lucide-react';
import api from '../../services/api';
import AdminCrud from '../../components/AdminCrud';

const ManageInmuebles = () => {
  const [tipos, setTipos] = useState([]);
  const [filtroVerificacion, setFiltroVerificacion] = useState('todos');

  useEffect(() => {
    api.get('/inmuebles/panel/tipos/').then(res => {
      const data = res.data.results || res.data;
      setTipos(data.map(t => ({ value: t.id, label: t.nombre })));
    }).catch(() => {});
  }, []);

  const filterPredicate = (item) => {
    if (filtroVerificacion === 'todos') return true;
    if (filtroVerificacion === 'verificado') return item.verificacion_estado === 'verificado';
    if (filtroVerificacion === 'observado') return item.verificacion_estado === 'observado';
    if (filtroVerificacion === 'rechazado') return item.verificacion_estado === 'rechazado';
    if (filtroVerificacion === 'pendiente') {
      return !item.verificacion_estado || item.verificacion_estado === 'no_solicitado' || item.verificacion_estado === 'pendiente';
    }
    return true;
  };

  const extraHeaderControls = (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '14px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.12)', color: '#10b981',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ShieldCheck size={18} />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', display: 'block' }}>
            Filtro de Verificación Legal (OCR/NLP)
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
            Filtra inmuebles según su dictamen jurídico oficial y análisis de Folio Real
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'todos', label: 'Todos', icon: Filter, color: '#64748b', bg: '#f1f5f9' },
          { id: 'verificado', label: 'Verificados Oficialmente', icon: ShieldCheck, color: '#15803d', bg: '#dcfce7' },
          { id: 'observado', label: 'Con Observaciones', icon: ShieldAlert, color: '#b45309', bg: '#fef3c7' },
          { id: 'pendiente', label: 'Pendientes / Sin Título', icon: ShieldOff, color: '#475569', bg: '#f1f5f9' },
          { id: 'rechazado', label: 'Rechazados', icon: ShieldX, color: '#b91c1c', bg: '#fee2e2' },
        ].map(btn => {
          const isActive = filtroVerificacion === btn.id;
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => setFiltroVerificacion(btn.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                border: isActive ? `1.5px solid ${btn.color}` : '1px solid var(--color-border)',
                background: isActive ? btn.bg : 'var(--color-bg-secondary)',
                color: isActive ? btn.color : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <Icon size={14} />
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'titulo', label: 'Título', render: (item) => <span style={{ fontWeight: 600 }}>{item.titulo}</span> },
    { key: 'tipo_nombre', label: 'Categoría', render: (item) => (
      <span style={{ background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
        {item.tipo_nombre || 'N/A'}
      </span>
    )},
    {
      key: 'verificacion_legal',
      label: 'Dictamen Legal (OCR/NLP)',
      render: (item) => {
        const estado = item.verificacion_estado || 'no_solicitado';
        const score = item.verificacion_datos?.score_confianza;
        if (estado === 'verificado') {
          return (
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: '#dcfce7', color: '#15803d',
                padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700
              }}>
                <ShieldCheck size={14} color="#16a34a" /> Verificado Oficial
              </span>
              {score && (
                <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>
                  Score IA: {score}/100
                </span>
              )}
            </div>
          );
        }
        if (estado === 'observado') {
          return (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: '#fef3c7', color: '#b45309',
              padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700
            }}>
              <ShieldAlert size={14} color="#d97706" /> Observado
            </span>
          );
        }
        if (estado === 'rechazado') {
          return (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: '#fee2e2', color: '#b91c1c',
              padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700
            }}>
              <ShieldX size={14} color="#dc2626" /> Rechazado
            </span>
          );
        }
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: '#f1f5f9', color: '#64748b',
            padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600
          }}>
            <ShieldOff size={14} color="#94a3b8" /> Pendiente
          </span>
        );
      }
    },
    { key: 'ciudad', label: 'Ciudad', render: (item) => item.direccion_fk?.ciudad || item.ciudad || 'N/A' },
    { key: 'precio', label: 'Precio (Bs)', render: (item) => item.precio ? `Bs. ${parseFloat(item.precio).toLocaleString()}` : 'A consultar' },
    { key: 'habitaciones', label: 'Hab.' },
    { key: 'banos', label: 'Baños' },
    { key: 'estado', label: 'Estado', render: (item) => {
      const colors = { disponible: '#16a34a', ocupado: '#dc2626', mantenimiento: '#f59e0b', reservado: '#3b82f6' };
      return <span style={{ color: colors[item.estado] || '#666', fontWeight: 600, textTransform: 'capitalize' }}>{item.estado}</span>;
    }},
  ];

  const transformPayload = (data) => {
    const payload = { ...data };
    payload.direccion_fk = {
      ciudad: data.ciudad || '',
      zona: data.zona || '',
      calle: data.calle || '',
      referencia: data.referencia || '',
    };
    delete payload.ciudad;
    delete payload.zona;
    delete payload.calle;
    delete payload.referencia;
    delete payload.direccion;

    if (payload.largo === '') payload.largo = null;
    if (payload.ancho === '') payload.ancho = null;
    if (payload.superficie === '') payload.superficie = null;
    if (payload.precio === '') payload.precio = null;

    return payload;
  };

  const transformEditItem = (item) => {
    const processed = { ...item };
    if (item.direccion_fk) {
      processed.ciudad = item.direccion_fk.ciudad;
      processed.zona = item.direccion_fk.zona;
      processed.calle = item.direccion_fk.calle;
      processed.referencia = item.direccion_fk.referencia;
    }
    return processed;
  };

  const formFields = [
    { key: 'titulo', label: 'Título', type: 'text', placeholder: 'ej: Casa en Zona Sur' },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción del inmueble...', required: false },
    { key: 'tipo', label: 'Categoría', type: 'select', options: tipos },
    { key: 'verificacion_estado', label: 'Estado Verificación Legal', type: 'select', options: [
      { value: 'verificado', label: 'Verificado Oficialmente (Valor Legal)' },
      { value: 'observado', label: 'Con Observaciones Legales' },
      { value: 'rechazado', label: 'Documentación Rechazada' },
      { value: 'no_solicitado', label: 'Pendiente / No Solicitado' },
    ]},
    { key: 'ciudad', label: 'Ciudad', type: 'text', placeholder: 'ej: La Paz' },
    { key: 'zona', label: 'Zona', type: 'text', placeholder: 'ej: Sur' },
    { key: 'calle', label: 'Calle', type: 'text', placeholder: 'ej: Av. Principal 123' },
    { key: 'referencia', label: 'Referencia', type: 'text', required: false },
    { key: 'precio', label: 'Precio (Bs)', type: 'number', placeholder: '0.00' },
    { key: 'largo', label: 'Largo (m)', type: 'number', placeholder: '0.00' },
    { key: 'ancho', label: 'Ancho (m)', type: 'number', placeholder: '0.00' },
    { key: 'superficie', label: 'Superficie (m²)', type: 'number', placeholder: 'Calculado auto.', required: false },
    { key: 'habitaciones', label: 'Habitaciones', type: 'number', placeholder: '0', defaultValue: 0 },
    { key: 'banos', label: 'Baños', type: 'number', placeholder: '0', defaultValue: 0 },
    { key: 'garaje', label: 'Garaje', type: 'boolean', defaultValue: false, required: false },
    { key: 'estado', label: 'Estado', type: 'select', options: [
      { value: 'disponible', label: 'Disponible' },
      { value: 'ocupado', label: 'Ocupado' },
      { value: 'mantenimiento', label: 'En Mantenimiento' },
      { value: 'reservado', label: 'Reservado' },
    ]},
  ];

  return (
    <AdminCrud
      title="Inmueble"
      subtitle="Gestión completa de propiedades inmobiliarias."
      endpoint="/inmuebles/panel/lista/"
      columns={columns}
      formFields={formFields}
      transformPayload={transformPayload}
      transformEditItem={transformEditItem}
      extraHeaderControls={extraHeaderControls}
      filterPredicate={filterPredicate}
    />
  );
};

export default ManageInmuebles;
