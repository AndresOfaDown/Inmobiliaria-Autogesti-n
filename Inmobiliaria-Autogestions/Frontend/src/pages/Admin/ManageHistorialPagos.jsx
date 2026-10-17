import AdminCrud from '../../components/AdminCrud';

const ManageHistorialPagos = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'pago', label: 'Pago ID', render: (item) => `#${item.pago}` },
    { key: 'estado_anterior', label: 'Estado Anterior', render: (item) => (
      <span style={{ textTransform: 'capitalize' }}>{item.estado_anterior}</span>
    )},
    { key: 'estado_nuevo', label: 'Estado Nuevo', render: (item) => (
      <span style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--color-primary)' }}>{item.estado_nuevo}</span>
    )},
    { key: 'comentario', label: 'Comentario' },
    { key: 'fecha', label: 'Fecha', render: (item) => item.fecha ? new Date(item.fecha).toLocaleString('es-BO') : '—' },
  ];

  // Historial es de solo lectura, pero forzamos formFields vacío
  const formFields = [
    { key: 'pago', label: 'ID del Pago', type: 'number', placeholder: 'ID del pago' },
    { key: 'estado_anterior', label: 'Estado Anterior', type: 'text' },
    { key: 'estado_nuevo', label: 'Estado Nuevo', type: 'text' },
    { key: 'comentario', label: 'Comentario', type: 'textarea', required: false },
  ];

  return (
    <AdminCrud
      title="Historial de Pago"
      subtitle="Registro histórico de cambios de estado en pagos."
      endpoint="/pagos/panel/historial/"
      columns={columns}
      formFields={formFields}
    />
  );
};

export default ManageHistorialPagos;
