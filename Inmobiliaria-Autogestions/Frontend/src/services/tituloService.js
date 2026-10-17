import api from './api';

const tituloService = {
  /**
   * Sube un archivo de título de propiedad y arranca la verificación por IA.
   * @param {number} inmuebleId - ID del inmueble
   * @param {File} archivo - PDF o Imagen
   * @returns {Promise<Object>} Resultado de la verificación
   */
  subirTitulo: async (inmuebleId, archivo) => {
    const formData = new FormData();
    formData.append('inmueble', inmuebleId);
    formData.append('archivo', archivo);

    const { data } = await api.post('/inmuebles/verificacion/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * Obtiene el resultado actual de la verificación de un inmueble.
   * @param {number} inmuebleId - ID del inmueble
   * @returns {Promise<Object>} Datos de verificación
   */
  getResultado: async (inmuebleId) => {
    const { data } = await api.get(`/inmuebles/verificacion/resultado/${inmuebleId}/`);
    return data;
  }
};

export default tituloService;
