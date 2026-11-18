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
    { key: 'contrato', label: 'Contrato', render: (item) => `#${item.contrato_id || item.contrato}` },
    { key: 'inmueble', label: 'Inmueble', render: (item) => item.inmueble?.titulo || 'Inmueble' },
    { key: 'monto', label: 'Monto Bruto', render: (item) => `Bs. ${parseFloat(item.monto || 0).toLocaleString()}` },
    { key: 'comision', label: 'Comisión (5%)', render: (item) => (
      <span style={{ color: '#0284c7', fontWeight: 700 }}>
        Bs. {parseFloat(item.comision_plataforma || (item.monto * 0.05) || 0).toLocaleString()}
      </span>
    )},
    { key: 'monto_neto', label: 'Neto Dueño', render: (item) => (
      <span style={{ color: '#16a34a', fontWeight: 700 }}>
        Bs. {parseFloat(item.monto_neto || (item.monto * 0.95) || 0).toLocaleString()}
      </span>
    )},
    { key: 'fecha_pago', label: 'Fecha', render: (item) => item.fecha_pago ? new Date(item.fecha_pago).toLocaleDateString('es-BO') : '—' },
    { key: 'referencia', label: 'Auditoría Blockchain', render: (item) => (
      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>
        {item.blockchain_block ? `Bloque #${item.blockchain_block}` : (item.referencia || item.transaccion_id || 'Registrado')}
      </span>
    )},
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
