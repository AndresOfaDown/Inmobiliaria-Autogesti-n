import api from './api';

/**
 * Servicio de pagos con Stripe
 * RF-24: Gestionar Pago
 * RF-25: Integración de pasarela de pagos
 * RF-26: Gestión de historial de transacciones y emisión de comprobantes
 */
const pagoService = {
  /**
   * Crear sesión de pago Stripe (solo propietario).
   * Envía el enlace de pago como mensaje en el chat.
   */
  crearSesionPago: async ({ contrato_id, monto, tipo_operacion, descripcion, chat_id, moneda }) => {
    const { data } = await api.post('/pagos/stripe/crear-sesion/', {
      contrato_id,
      monto,
      tipo_operacion: tipo_operacion || 'mensualidad',
      descripcion: descripcion || '',
      chat_id,
      moneda: moneda || 'usd',
    });
    return data;
  },

  /**
   * Confirmar estado de un pago tras redirección de Stripe.
   */
  confirmarPago: async (sessionId) => {
    const { data } = await api.get(`/pagos/stripe/confirmar/?session_id=${sessionId}`);
    return data;
  },

  /**
   * Obtener contratos disponibles para cobrar desde un chat.
   */
  obtenerContratosParaPago: async ({ chat_id, inmueble_id }) => {
    const params = new URLSearchParams();
    if (chat_id) params.append('chat_id', chat_id);
    if (inmueble_id) params.append('inmueble_id', inmueble_id);
    const { data } = await api.get(`/pagos/stripe/contratos/?${params.toString()}`);
    return data;
  },

  /**
   * Obtener historial de transacciones Stripe.
   */
  obtenerTransacciones: async () => {
    const { data } = await api.get('/pagos/transacciones/');
    return data.results || data;
  },

  /**
   * Obtener detalle de una transacción.
   */
  obtenerTransaccion: async (id) => {
    const { data } = await api.get(`/pagos/transacciones/${id}/`);
    return data;
  },

  /**
   * Obtener URL del comprobante de una transacción.
   */
  obtenerComprobante: async (id) => {
    const { data } = await api.get(`/pagos/transacciones/${id}/comprobante/`);
    return data;
  },
};

export default pagoService;
