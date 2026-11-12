import api from './api';

const iotService = {
  // Obtener dispositivos de un inmueble (Propietario / Admin)
  getDispositivosPorInmueble: async (inmuebleId) => {
    const { data } = await api.get(`/iot/inmuebles/${inmuebleId}/dispositivos`);
    return data;
  },

  // Registrar nuevo dispositivo IoT
  crearDispositivo: async (payload) => {
    const { data } = await api.post('/iot/dispositivos', payload);
    return data;
  },

  // Obtener detalle de un dispositivo
  getDispositivo: async (id) => {
    const { data } = await api.get(`/iot/dispositivos/${id}`);
    return data;
  },

  // Actualizar dispositivo
  actualizarDispositivo: async (id, payload) => {
    const { data } = await api.put(`/iot/dispositivos/${id}`, payload);
    return data;
  },

  // Eliminar dispositivo
  eliminarDispositivo: async (id) => {
    const { data } = await api.delete(`/iot/dispositivos/${id}`);
    return data;
  },

  // Mis llaves digitales autorizadas (Inquilino / Visitante / Propietario)
  getMisLlaves: async () => {
    const { data } = await api.get('/iot/mis-llaves');
    return data;
  },

  // Ejecutar acción (desbloquear / bloquear / generar_pin)
  ejecutarAccion: async (id, accion, metodo = 'app', pin = null) => {
    const { data } = await api.post(`/iot/dispositivos/${id}/accion`, {
      accion,
      metodo,
      pin,
    });
    return data;
  },

  // Obtener historial de aperturas y accesos
  getHistorial: async (id) => {
    const { data } = await api.get(`/iot/dispositivos/${id}/historial`);
    return data;
  },

  // Crear regla de acceso
  crearReglaAcceso: async (payload) => {
    const { data } = await api.post('/iot/reglas-acceso', payload);
    return data;
  },

  // Revocar regla de acceso
  revocarReglaAcceso: async (id) => {
    const { data } = await api.delete(`/iot/reglas-acceso/${id}`);
    return data;
  },
};

export default iotService;
