import api from './api';

/**
 * Servicio para gestión de inmuebles.
 * Encapsula todas las peticiones HTTP al módulo /inmuebles/ de la API.
 */
const inmuebleService = {
  /**
   *
   * Obtiene la lista de inmuebles del usuario autenticado.
   * @returns {Promise<Array>} Lista de inmuebles
   */
  listarInmuebles: async (filters = {}) => {
    const { data } = await api.get('/inmuebles/lista/', { params: filters });
    return data;
  },

  /**
   * Obtiene el detalle de un inmueble por su ID.
   * @param {number} id - ID del inmueble
   * @returns {Promise<Object>} Detalle del inmueble
   */
  getById: async (id) => {
    const { data } = await api.get(`/inmuebles/lista/${id}/`);
    return data;
  },

  /**
   * Obtiene el catálogo de tipos de inmueble.
   * @returns {Promise<Array>} Lista de tipos
   */
  getTipos: async () => {
    const { data } = await api.get('/inmuebles/tipos/');
    return data;
  },

  /**
   * Crea un nuevo inmueble.
   * @param {Object} inmuebleData - Datos del inmueble
   * @returns {Promise<Object>} Inmueble creado
   */
  create: async (inmuebleData) => {
    const { data } = await api.post('/inmuebles/lista/', inmuebleData);
    return data;
  },

  /**
   * Actualiza un inmueble existente (parcial).
   * @param {number} id - ID del inmueble
   * @param {Object} inmuebleData - Campos a actualizar
   * @returns {Promise<Object>} Inmueble actualizado
   */
  update: async (id, inmuebleData) => {
    const { data } = await api.patch(`/inmuebles/lista/${id}/`, inmuebleData);
    return data;
  },

  /**
   * Elimina un inmueble.
   * @param {number} id - ID del inmueble
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    await api.delete(`/inmuebles/lista/${id}/`);
  },

  /**
   * Sube archivos multimedia a un inmueble.
   * @param {number} inmuebleId - ID del inmueble
   * @param {FormData} formData - FormData con archivo(s) y metadata
   * @returns {Promise<Object>} Registro multimedia creado
   */
  uploadMultimedia: async (inmuebleId, formData) => {
    const { data } = await api.post('/inmuebles/multimedia/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * Actualiza la metadata de un registro multimedia (ej: descripción u orden).
   * @param {number} id - ID del registro multimedia
   * @param {Object} payload - Campos a actualizar (ej: { orden: 2 })
   * @returns {Promise<Object>} Registro actualizado
   */
  actualizarMultimedia: async (id, payload) => {
    const { data } = await api.patch(`/inmuebles/multimedia/${id}/`, payload);
    return data;
  },

  /**
   * Gestión de Tipos de Contrato (Admin)
   */
  getTiposContrato: async () => {
    const { data } = await api.get('/inmuebles/tipos-contrato/');
    return data;
  },

  createTipoContrato: async (payload) => {
    const { data } = await api.post('/inmuebles/tipos-contrato/', payload);
    return data;
  },

  updateTipoContrato: async (id, payload) => {
    const { data } = await api.patch(`/inmuebles/tipos-contrato/${id}/`, payload);
    return data;
  },

  deleteTipoContrato: async (id) => {
    await api.delete(`/inmuebles/tipos-contrato/${id}/`);
  },

  /**
   * Descarga de Contrato en PDF
   */
  downloadContratoPdf: async (id) => {
    const response = await api.get(`/inmuebles/contratos/${id}/pdf/`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Obtiene la lista de hotspots asociados a un inmueble.
   * @param {number} inmuebleId - ID del inmueble
   * @returns {Promise<Array>} Lista de hotspots
   */
  listarHotspots: async (inmuebleId) => {
    const { data } = await api.get('/inmuebles/hotspots/', { params: { inmueble: inmuebleId } });
    return data;
  },

  /**
   * Crea un nuevo punto de transición (hotspot) bidireccional o unidireccional.
   * @param {Object} hotspotData - Datos del hotspot a crear
   * @returns {Promise<Object>} Hotspot creado
   */
  crearHotspot: async (hotspotData) => {
    const { data } = await api.post('/inmuebles/hotspots/', hotspotData);
    return data;
  },

  /**
   * Elimina un punto de transición (hotspot).
   * @param {number} id - ID del hotspot
   * @returns {Promise<void>}
   */
  eliminarHotspot: async (id) => {
    await api.delete(`/inmuebles/hotspots/${id}/`);
  },
};


export default inmuebleService;
