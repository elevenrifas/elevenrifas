// =====================================================
// 💱 CONVERSOR DE MONEDAS - ELEVEN RIFAS
// =====================================================
// Utilidad centralizada para conversión entre monedas
// Reemplaza las conversiones hardcodeadas por un sistema flexible
// =====================================================

/**
 * Convierte una cantidad entre diferentes monedas usando una tasa de cambio
 * @param amount - Cantidad a convertir
 * @param fromCurrency - Moneda origen ('USD' | 'VES')
 * @param toCurrency - Moneda destino ('USD' | 'VES')
 * @param exchangeRate - Tasa de cambio (Bs por USD)
 * @returns Cantidad convertida
 */
export function convertCurrency(
  amount: number, 
  fromCurrency: 'USD' | 'VES', 
  toCurrency: 'USD' | 'VES', 
  exchangeRate: number
): number {
  // Si las monedas son iguales, retornar la cantidad original
  if (fromCurrency === toCurrency) return amount;
  
  // Validar que la tasa sea válida
  if (exchangeRate <= 0) {
    console.warn('Tasa de cambio inválida:', exchangeRate, 'usando fallback');
    exchangeRate = getDefaultExchangeRate();
  }
  
  // Convertir de USD a VES
  if (fromCurrency === 'USD' && toCurrency === 'VES') {
    return amount * exchangeRate;
  }
  
  // Convertir de VES a USD
  if (fromCurrency === 'VES' && toCurrency === 'USD') {
    return amount / exchangeRate;
  }
  
  // Si no se puede convertir, retornar la cantidad original
  console.warn('Conversión no soportada:', fromCurrency, '->', toCurrency);
  return amount;
}

/**
 * Obtiene la tasa de cambio por defecto
 * @returns Tasa de cambio por defecto (145 Bs/USD)
 */
export function getDefaultExchangeRate(): number {
  return 145; // Fallback para rifas sin tasa configurada
}

/**
 * Obtiene la tasa de cambio para una rifa específica
 * @param rifaTasa - Tasa de la rifa (puede ser undefined)
 * @returns Tasa de la rifa o fallback
 */
export function getRifaExchangeRate(rifaTasa?: number | null): number {
  return rifaTasa && rifaTasa > 0 ? rifaTasa : getDefaultExchangeRate();
}

/**
 * Formatea un precio en bolívares venezolanos
 * @param amount - Cantidad en bolívares
 * @returns String formateado
 */
export function formatCurrencyVE(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un precio en dólares estadounidenses
 * @param amount - Cantidad en dólares
 * @returns String formateado
 */
export function formatCurrencyUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Calcula el precio total de tickets con conversión automática
 * @param precioTicket - Precio unitario del ticket (en VES)
 * @param cantidad - Cantidad de tickets
 * @param exchangeRate - Tasa de cambio (Bs/USD)
 * @returns Objeto con totales en ambas monedas
 */
export function calculateTicketTotals(
  precioTicket: number, 
  cantidad: number, 
  exchangeRate: number
): {
  totalVES: number;
  totalUSD: number;
  precioUnitarioUSD: number;
} {
  const totalVES = precioTicket * cantidad;
  const precioUnitarioUSD = convertCurrency(precioTicket, 'VES', 'USD', exchangeRate);
  const totalUSD = convertCurrency(totalVES, 'VES', 'USD', exchangeRate);
  
  return {
    totalVES,
    totalUSD,
    precioUnitarioUSD
  };
}
