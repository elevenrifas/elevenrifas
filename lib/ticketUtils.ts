/**
 * Genera números aleatorios únicos para tickets de rifa
 * @param cantidad - Cantidad de tickets a generar
 * @param rangoMin - Rango mínimo (por defecto 1)
 * @param rangoMax - Rango máximo (por defecto 100)
 * @returns Array de números únicos
 */
export function generarNumerosTicket(cantidad: number, rangoMin: number = 1, rangoMax: number = 100): number[] {
  if (cantidad > (rangoMax - rangoMin + 1)) {
    throw new Error(`No se pueden generar ${cantidad} números únicos en el rango ${rangoMin}-${rangoMax}`);
  }

  const numeros: number[] = [];
  const numerosDisponibles = new Set<number>();

  // Llenar el set con todos los números disponibles
  for (let i = rangoMin; i <= rangoMax; i++) {
    numerosDisponibles.add(i);
  }

  // Generar números aleatorios únicos
  while (numeros.length < cantidad) {
    const numeroAleatorio = Math.floor(Math.random() * (rangoMax - rangoMin + 1)) + rangoMin;
    
    if (numerosDisponibles.has(numeroAleatorio)) {
      numeros.push(numeroAleatorio);
      numerosDisponibles.delete(numeroAleatorio);
    }
  }

  // Ordenar los números para mejor presentación
  return numeros.sort((a, b) => a - b);
}

/**
 * Genera un ID único para el ticket
 * @param rifaId - ID de la rifa
 * @param timestamp - Timestamp de generación
 * @returns ID único del ticket
 */
export function generarTicketId(rifaId: string, timestamp: number = Date.now()): string {
  const fecha = new Date(timestamp);
  const fechaStr = fecha.toISOString().slice(0, 10).replace(/-/g, '');
  const horaStr = fecha.toTimeString().slice(0, 8).replace(/:/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `${rifaId}-${fechaStr}-${horaStr}-${random}`;
}

/**
 * Formatea la fecha para mostrar en el ticket
 * @param fecha - Fecha a formatear
 * @returns Fecha formateada en español
 */
export function formatearFechaTicket(fecha: Date): string {
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
