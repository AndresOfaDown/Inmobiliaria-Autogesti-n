import AdminCrud from '../../components/AdminCrud';

const ManageTipoPagos = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre', render: (item) => <span style={{ fontWeight: 600 }}>{item.nombre}</span> },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'activo', label: 'Activo', render: (item) => (
      <span style={{ color: item.activo ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{item.activo ? 'Sí' : 'No'}</span>
    )},
  ];

  const formFields = [
    { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'ej: Efectivo, Transferencia, QR...' },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Detalle del tipo de pago...', required: false },
    { key: 'activo', label: 'Activo', type: 'boolean', defaultValue: true, required: false },
  ];

  return (
    <AdminCrud
      title="Tipo de Pago"
      subtitle="Métodos de pago disponibles en el sistema."
      endpoint="/pagos/tipos-pago/"
      columns={columns}
      formFields={formFields}
    />
  );
};

export default ManageTipoPagos;
