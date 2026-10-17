import axiosInstance from './api';

const reportesService = {
  obtenerReportes: async (filtros = {}) => {
    try {
      const response = await axiosInstance.get('/pagos/reportes/', { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Error fetching reportes:', error);
      throw error;
    }
  }
};

export default reportesService;
