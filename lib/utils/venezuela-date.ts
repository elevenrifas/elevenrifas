/**
 * 🕐 FECHA ACTUAL EN VENEZUELA
 * Solución mínima para forzar timezone
 * 
 * @author BEATUS - Cirugía Informática
 * @version 1.0.0
 */

/**
 * Obtiene la fecha actual en timezone de Venezuela (UTC-4)
 * @returns Date - Fecha actual en Venezuela
 */
export function getVenezuelaDate(): Date {
  const now = new Date();
  // Venezuela está en UTC-4, así que restamos 4 horas del UTC
  // UTC-4 significa que Venezuela está 4 horas detrás de UTC
  const venezuelaTime = new Date(now.getTime() - (4 * 60 * 60 * 1000));
  return venezuelaTime;
}

/**
 * Obtiene la fecha actual en Venezuela como string ISO
 * @returns string - Fecha actual en formato ISO para base de datos
 */
export function getVenezuelaISOString(): string {
  return getVenezuelaDate().toISOString();
}
