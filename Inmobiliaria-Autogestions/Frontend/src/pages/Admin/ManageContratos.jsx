import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminCrud from '../../components/AdminCrud';

const ManageContratos = () => {
  const [inmuebles, setInmuebles] = useState([]);
  const [tiposContrato, setTiposContrato] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    api.get('/inmuebles/panel/lista/').then(res => {
      const data = res.data.results || res.data;
      setInmuebles(data.map(i => ({ value: i.id, label: i.titulo })));
    }).catch(() => {});
    api.get('/inmuebles/tipos-contrato/').then(res => {
      const data = res.data.results || res.data;
      setTiposContrato(data.map(t => ({ value: t.id, label: t.nombre })));
    }).catch(() => {});
    api.get('/usuarios/panel/lista/').then(res => {
      const data = res.data.results || res.data;
      setUsuarios(data.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name} (${u.username})` })));
    }).catch(() => {});
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'inmueble_titulo', label: 'Inmueble' },
    { key: 'inquilino_nombre', label: 'Inquilino' },
    { key: 'tipo_contrato_nombre', label: 'Tipo', render: (item) => (
      <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
        {item.tipo_contrato_nombre || 'N/A'}
      </span>
    )},
    { key: 'fecha_inicio', label: 'Inicio' },
    { key: 'fecha_fin', label: 'Fin' },
    { key: 'monto', label: 'Monto (Bs)', render: (item) => `Bs. ${parseFloat(item.monto || 0).toLocaleString()}` },
    { key: 'estado', label: 'Estado', render: (item) => {
      const colors = { activo: '#16a34a', finalizado: '#6b7280', cancelado: '#dc2626', pendiente: '#f59e0b' };
      return <span style={{ color: colors[item.estado] || '#666', fontWeight: 600, textTransform: 'capitalize' }}>{item.estado}</span>;
    }},
  ];

  const formFields = [
    { key: 'inmueble', label: 'Inmueble', type: 'select', options: inmuebles },
    { key: 'inquilino', label: 'Inquilino', type: 'select', options: usuarios },
    { key: 'tipo_contrato', label: 'Tipo de Contrato', type: 'select', options: tiposContrato },
    { key: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
    { key: 'fecha_fin', label: 'Fecha de Fin', type: 'date', required: false },
    { key: 'monto', label: 'Monto (Bs)', type: 'number', placeholder: '0.00' },
    { key: 'deposito', label: 'Depósito (Bs)', type: 'number', placeholder: '0.00', required: false, defaultValue: 0 },
    { key: 'estado', label: 'Estado', type: 'select', options: [
      { value: 'activo', label: 'Activo' },
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'finalizado', label: 'Finalizado' },
      { value: 'cancelado', label: 'Cancelado' },
    ]},
    { key: 'observaciones', label: 'Observaciones', type: 'textarea', placeholder: 'Detalles adicionales...', required: false },
  ];

  return (
    <AdminCrud
      title="Contrato"
      subtitle="Gestión de contratos entre inmuebles e inquilinos."
      endpoint="/inmuebles/panel/contratos/"
      columns={columns}
      formFields={formFields}
    />
  );
};

export default ManageContratos;
