import AdminCrud from '../../components/AdminCrud';

const ManageCategorias = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre de Categoría', render: (item) => (
      <span style={{ fontWeight: 600 }}>{item.nombre}</span>
    )},
    { key: 'descripcion', label: 'Descripción' },
  ];

  const formFields = [
    { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'ej: Casa, Departamento, Terreno...' },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción de la categoría...', required: false },
  ];

  return (
    <AdminCrud
      title="Categoría"
      subtitle="Categorías o tipos de inmuebles (Casa, Departamento, Terreno, etc.)."
      endpoint="/inmuebles/panel/tipos/"
      columns={columns}
      formFields={formFields}
    />
  );
};

export default ManageCategorias;
