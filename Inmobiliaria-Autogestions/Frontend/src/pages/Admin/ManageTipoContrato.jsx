import AdminCrud from '../../components/AdminCrud';

const ManageTipoContrato = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre', render: (item) => (
      <span style={{ fontWeight: 600 }}>{item.nombre}</span>
    )},
    { key: 'descripcion', label: 'Descripción' },
  ];

  const formFields = [
    { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre del tipo de contrato...' },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción del tipo de contrato...', required: false },
  ];

  return (
    <AdminCrud
      title="Tipo de Contrato"
      subtitle="Gestión de tipos de contrato."
      endpoint="/inmuebles/panel/tipos-contrato/"
      columns={columns}
      formFields={formFields}
    />
  );
};

export default ManageTipoContrato;