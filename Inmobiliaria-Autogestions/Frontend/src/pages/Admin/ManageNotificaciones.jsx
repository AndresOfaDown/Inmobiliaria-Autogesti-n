import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminCrud from '../../components/AdminCrud';

const ManageNotificaciones = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    api.get('/usuarios/panel/lista/').then(res => {
      const data = res.data.results || res.data;
      setUsuarios(data.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name} (${u.username})` })));
    }).catch(() => {});
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'titulo', label: 'Título', render: (item) => <span style={{ fontWeight: 600 }}>{item.titulo}</span> },
    { key: 'tipo', label: 'Tipo', render: (item) => {
      const colors = { info: '#3b82f6', alerta: '#f59e0b', recordatorio: '#8b5cf6', pago: '#16a34a' };
      return <span style={{ background: `${colors[item.tipo]}20`, color: colors[item.tipo], padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{item.tipo}</span>;
    }},
    { key: 'mensaje', label: 'Mensaje', render: (item) => (item.mensaje?.length > 50 ? item.mensaje.substring(0, 50) + '...' : item.mensaje) },
    { key: 'leida', label: 'Leída', render: (item) => (
      <span style={{ color: item.leida ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{item.leida ? 'Sí' : 'No'}</span>
    )},
    { key: 'creada', label: 'Creada', render: (item) => item.creada ? new Date(item.creada).toLocaleString('es-BO') : '—' },
  ];

  const formFields = [
    { key: 'titulo', label: 'Título', type: 'text', placeholder: 'ej: Pago pendiente' },
    { key: 'mensaje', label: 'Mensaje', type: 'textarea', placeholder: 'Contenido de la notificación...' },
    { key: 'tipo', label: 'Tipo', type: 'select', options: [
      { value: 'info', label: 'Información' },
      { value: 'alerta', label: 'Alerta' },
      { value: 'recordatorio', label: 'Recordatorio' },
      { value: 'pago', label: 'Pago' },
    ]},
    { key: 'usuario', label: 'Usuario', type: 'select', options: usuarios },
    { key: 'leida', label: 'Leída', type: 'boolean', defaultValue: false, required: false },
  ];

  return (
    <AdminCrud
      title="Notificación"
      subtitle="Gestión de notificaciones del sistema para los usuarios."
      endpoint="/usuarios/panel/notificaciones/"
      columns={columns}
      formFields={formFields}
    />
  );
};

export default ManageNotificaciones;
