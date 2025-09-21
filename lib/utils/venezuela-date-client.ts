/**
 * 🕐 FECHA ACTUAL EN VENEZUELA - CLIENT SIDE
 * Versión para el frontend que funciona en el navegador
 * 
 * @author BEATUS - Cirugía Informática
 * @version 1.0.0
 */

/**
 * Obtiene la fecha actual en timezone de Venezuela (UTC-4) - CLIENT SIDE
 * @returns Date - Fecha actual en Venezuela
 */
export function getVenezuelaDateClient(): Date {
  const now = new Date();
  // Venezuela está en UTC-4, así que restamos 4 horas del UTC
  const venezuelaTime = new Date(now.getTime() - (4 * 60 * 60 * 1000));
  return venezuelaTime;
}

/**
 * Obtiene la fecha actual en Venezuela como string ISO - CLIENT SIDE
 * @returns string - Fecha actual en formato ISO para base de datos
 */
export function getVenezuelaISOStringClient(): string {
  return getVenezuelaDateClient().toISOString();
}
