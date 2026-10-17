import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminCrud from '../../components/AdminCrud';

const ManagePagos = () => {
  const [tiposPago, setTiposPago] = useState([]);
  const [contratos, setContratos] = useState([]);

  useEffect(() => {
    api.get('/pagos/tipos-pago/').then(res => {
      const data = res.data.results || res.data;
      setTiposPago(data.map(t => ({ value: t.id, label: t.nombre })));
    }).catch(() => {});
    api.get('/inmuebles/panel/contratos/').then(res => {
      const data = res.data.results || res.data;
      setContratos(data.map(c => ({ value: c.id, label: `Contrato #${c.id} — ${c.inmueble_titulo || 'Inmueble'}` })));
    }).catch(() => {});
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'contrato', label: 'Contrato', render: (item) => `#${item.contrato}` },
    { key: 'monto', label: 'Monto (Bs)', render: (item) => `Bs. ${parseFloat(item.monto || 0).toLocaleString()}` },
    { key: 'fecha_pago', label: 'Fecha de Pago' },
    { key: 'referencia', label: 'Referencia' },
    { key: 'estado', label: 'Estado', render: (item) => {
      const colors = { completado: '#16a34a', pendiente: '#f59e0b', anulado: '#dc2626', parcial: '#3b82f6' };
      return <span style={{ color: colors[item.estado] || '#666', fontWeight: 600, textTransform: 'capitalize' }}>{item.estado}</span>;
    }},
  ];

  const formFields = [
    { key: 'contrato', label: 'Contrato', type: 'select', options: contratos },
    { key: 'tipo_pago', label: 'Tipo de Pago', type: 'select', options: tiposPago },
    { key: 'monto', label: 'Monto (Bs)', type: 'number', placeholder: '0.00' },
    { key: 'fecha_pago', label: 'Fecha de Pago', type: 'date' },
    { key: 'referencia', label: 'Referencia', type: 'text', placeholder: 'Nro. de transacción...', required: false },
    { key: 'estado', label: 'Estado', type: 'select', options: [
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'completado', label: 'Completado' },
      { value: 'parcial', label: 'Parcial' },
      { value: 'anulado', label: 'Anulado' },
    ]},
    { key: 'observaciones', label: 'Observaciones', type: 'textarea', placeholder: 'Notas...', required: false },
  ];

  return (
    <AdminCrud
      title="Pago"
      subtitle="Registro y gestión de pagos vinculados a contratos."
      endpoint="/pagos/panel/lista/"
      columns={columns}
      formFields={formFields}
    />
  );
};

export default ManagePagos;
