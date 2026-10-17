
import AdminCrud from '../../components/AdminCrud';

const ManageFavoritos = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'inmueble_data_inmueble', 
      label: 'Inmueble', 
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {item.inmueble_data?.imagen_principal && (
            <img 
              src={item.inmueble_data.imagen_principal} 
              alt="" 
              style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} 
            />
          )}
          <span style={{ fontWeight: 600 }}>{item.inmueble_data?.titulo}</span>
        </div>
      ) 
    },
    { key: 'inmueble_data_ubicacion', label: 'Ubicación', render: (item) => `${item.inmueble_data?.ciudad}, ${item.inmueble_data?.zona || ''}` },
    { key: 'inmueble_data_precio', label: 'Precio', render: (item) => `Bs. ${parseFloat(item.inmueble_data?.precio || 0).toLocaleString()}` },
    { 
      key: 'inmueble_data_estado', 
      label: 'Estado', 
      render: (item) => {
        const colors = { disponible: '#16a34a', ocupado: '#dc2626', mantenimiento: '#f59e0b', reservado: '#3b82f6' };
        const status = item.inmueble_data?.estado;
        return <span style={{ color: colors[status] || '#666', fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>;
      }
    },
    { key: 'creado', label: 'Agregado el', render: (item) => new Date(item.creado).toLocaleDateString() },
  ];

  return (
    <AdminCrud
      title="Mis Favoritos"
      subtitle="Propiedades que has marcado como preferidas."
      endpoint="/inmuebles/favoritos/"
      columns={columns}
      formFields={[]} // No se crean favoritos desde aquí, solo se listan/eliminan
      canCreate={false}
    />
  );
};

export default ManageFavoritos;
