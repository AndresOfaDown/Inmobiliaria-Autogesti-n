/**
 * Formatea una fecha ISO a formato legible.
 * @param {string} dateString - Fecha en formato ISO
 * @param {object} options - Opciones de Intl.DateTimeFormat
 * @returns {string}
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Date(dateString).toLocaleDateString('es-BO', defaultOptions);
};

/**
 * Formatea fecha y hora.
 */
export const formatDateTime = (dateString) => {
  return formatDate(dateString, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea un monto como moneda boliviana.
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(amount);
};
