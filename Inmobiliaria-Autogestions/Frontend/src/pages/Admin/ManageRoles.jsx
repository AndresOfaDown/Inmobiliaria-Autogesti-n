import AdminCrud from '../../components/AdminCrud';

const ManageRoles = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre del Rol', render: (item) => (
      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{item.nombre}</span>
    )},
    { key: 'descripcion', label: 'Descripción' },
  ];

  const formFields = [
    { key: 'nombre', label: 'Nombre del Rol', type: 'text', placeholder: 'ej: Propietario' },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción del rol...', required: false },
  ];

  return (
    <AdminCrud
      title="Rol"
      subtitle="Gestión de roles y permisos del sistema."
      endpoint="/usuarios/panel/roles/"
      columns={columns}
      formFields={formFields}
    />
  );
};

export default ManageRoles;
