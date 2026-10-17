import api from './api';

/**
 * Servicio para gestión de contratos.
 */
const contratoService = {
  /**
   * Obtiene la lista de contratos del usuario.
   */
  getAll: async () => {
    const { data } = await api.get('/inmuebles/contratos/');
    return data.results || data;
  },

  /**
   * Aceptar un contrato.
   */
  aceptar: async (id) => {
    const { data } = await api.post(`/inmuebles/contratos/${id}/aceptar/`);
    return data;
  },

  /**
   * Rechazar un contrato.
   */
  rechazar: async (id, motivo) => {
    const { data } = await api.post(`/inmuebles/contratos/${id}/rechazar/`, { motivo });
    return data;
  },

  /**
   * Descarga de Contrato en PDF.
   */
  downloadPdf: async (id) => {
    const response = await api.get(`/inmuebles/contratos/${id}/pdf/`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Genera un Contrato en PDF usando IA.
   * @param {number} id - ID del contrato
   * @param {string} instrucciones - Texto libre del usuario (escrito o transcrito de audio)
   */
  generarContratoIA: async (id, instrucciones = '') => {
    const response = await api.post(`/inmuebles/contratos/${id}/generar-ia/`, 
      { instrucciones },
      { responseType: 'blob' } // Crítico para no corromper el binario
    );
    return response.data;
  },

  /**
   * Chat con el asistente IA de contratos (abogado virtual).
   * @param {number} id - ID del contrato
   * @param {Array} mensajes - Historial completo [{role: 'user'|'assistant', content: string}]
   * @returns {Promise<string>} Respuesta del asistente
   */
  chatIA: async (id, mensajes) => {
    const { data } = await api.post(`/inmuebles/contratos/${id}/chat-ia/`, { mensajes });
    return data.respuesta;
  },

  /**
   * Crea un contrato con ayuda de la IA y lo envía al cliente directamente.
   * El backend extrae las cláusulas del historial de chat con la IA.
   *
   * @param {Object} params
   * @param {number} params.inmueble_id
   * @param {number} params.inquilino_id
   * @param {number} params.chat_id
   * @param {number} params.tipo_contrato_id
   * @param {string} params.monto
   * @param {string} params.moneda
   * @param {string} params.inicio       - YYYY-MM-DD
   * @param {string} [params.fin]        - YYYY-MM-DD (opcional)
   * @param {string} [params.deposito]
   * @param {number} [params.dia_pago]
   * @param {Array}  params.historial_chat - [{role, content}]
   * @returns {Promise<Object>} Contrato creado
   */
  crearConIA: async (params) => {
    const { data } = await api.post('/inmuebles/contratos/crear-con-ia/', params);
    return data;
  },

  /**
   * Actualiza un contrato existente con ayuda de la IA.
   */
  editarConIA: async (id, params) => {
    const { data } = await api.post(`/inmuebles/contratos/${id}/editar-con-ia/`, params);
    return data;
  },
};

export default contratoService;
