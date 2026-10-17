import AdminCrud from '../../components/AdminCrud';

const ManageUsers = () => {
  // Los roles son TextChoices del modelo (admin/usuario), no un modelo separado
  const rolOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'usuario', label: 'Usuario' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'first_name', label: 'Nombre Completo', render: (item) => `${item.first_name || ''} ${item.last_name || ''}`.trim() || '—' },
    { key: 'email', label: 'Email' },
    { key: 'ci', label: 'CI' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'rol_nombre', label: 'Rol', render: (item) => (
      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
        {item.rol_nombre || 'Sin rol'}
      </span>
    )},
    { key: 'activo', label: 'Activo', render: (item) => (
      <span style={{ color: item.activo ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{item.activo ? 'Sí' : 'No'}</span>
    )},
  ];

  const formFields = [
    { key: 'first_name', label: 'Nombre', type: 'text', placeholder: 'Juan' },
    { key: 'last_name', label: 'Apellido', type: 'text', placeholder: 'Pérez' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'ej: juan@email.com' },
    { key: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 8 caracteres', required: false },
    { key: 'ci', label: 'CI (Cédula)', type: 'text', placeholder: 'ej: 12345678', required: false },
    { key: 'telefono', label: 'Teléfono', type: 'text', placeholder: 'ej: 70012345', required: false },
    { key: 'fecha_nacimiento', label: 'Fecha de Nacimiento', type: 'date', required: false },
    { key: 'rol', label: 'Rol', type: 'select', options: rolOptions },
    { key: 'activo', label: 'Activo', type: 'boolean', defaultValue: true, required: false },
  ];

  return (
    <AdminCrud
      title="Usuario"
      subtitle="Gestión completa de usuarios del sistema con todos sus atributos."
      endpoint="/usuarios/panel/lista/"
      columns={columns}
      formFields={formFields}
    />
  );
};

export default ManageUsers;
