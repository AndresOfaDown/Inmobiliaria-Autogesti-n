import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminCrud from '../../components/AdminCrud';

const ManageAgenda = () => {
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
    { key: 'descripcion', label: 'Descripción' },
    { key: 'fecha_inicio', label: 'Fecha/Hora Inicio', render: (item) => item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleString('es-BO') : '—' },
    { key: 'fecha_fin', label: 'Fecha/Hora Fin', render: (item) => item.fecha_fin ? new Date(item.fecha_fin).toLocaleString('es-BO') : '—' },
    { key: 'ubicacion', label: 'Ubicación' },
    { key: 'completado', label: 'Estado', render: (item) => (
      <span style={{ color: item.completado ? '#16a34a' : '#f59e0b', fontWeight: 600 }}>
        {item.completado ? 'Completado' : 'Pendiente'}
      </span>
    )},
  ];

  const formFields = [
    { key: 'titulo', label: 'Título', type: 'text', placeholder: 'ej: Visita al inmueble' },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Detalles del evento...', required: false },
    { key: 'fecha_inicio', label: 'Fecha/Hora de Inicio', type: 'datetime-local' },
    { key: 'fecha_fin', label: 'Fecha/Hora de Fin', type: 'datetime-local', required: false },
    { key: 'ubicacion', label: 'Ubicación', type: 'text', placeholder: 'ej: Oficina Central', required: false },
    { key: 'usuario', label: 'Usuario', type: 'select', options: usuarios },
    { key: 'completado', label: 'Completado', type: 'boolean', defaultValue: false, required: false },
  ];

  return (
    <AdminCrud
      title="Agenda"
      subtitle="Eventos, citas y recordatorios del sistema."
      endpoint="/usuarios/panel/agenda/"
      columns={columns}
      formFields={formFields}
    />
  );
};

export default ManageAgenda;
