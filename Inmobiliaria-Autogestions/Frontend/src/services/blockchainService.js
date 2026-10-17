import api from './api';

/**
 * Servicio unificado para consulta de auditoría inmutable de Blockchain (Hyperledger Fabric)
 */
const blockchainService = {
  /**
   * Obtiene el historial de auditoría inmutable de Blockchain de cualquier activo.
   * @param {string} assetId - ID del activo (ej: CON-1, PAG-1, INM-1)
   * @returns {Promise<Array>} Historial de bloques de transacciones
   */
  getHistorial: async (assetId) => {
    const { data } = await api.get(`/inmuebles/blockchain/historial/${assetId}/`);
    return data;
  }
};

export default blockchainService;
