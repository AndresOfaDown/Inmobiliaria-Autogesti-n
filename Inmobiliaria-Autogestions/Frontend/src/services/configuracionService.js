import axiosInstance from './api';

const configuracionService = {
  obtenerConfiguracion: async () => {
    try {
      const response = await axiosInstance.get('/pagos/configuracion/');
      // Si es una respuesta paginada de DRF
      if (response.data && Array.isArray(response.data.results) && response.data.results.length > 0) {
        return response.data.results[0];
      }
      // Si devuelve un array directamente
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching configuracion:', error);
      throw error;
    }
  },
  actualizarConfiguracion: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/pagos/configuracion/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating configuracion:', error);
      throw error;
    }
  }
};

export default configuracionService;
