/**
 * 🎫 GENERADOR DE NÚMEROS DE TICKET ÚNICOS
 * 
 * Implementación en TypeScript de la lógica de generación de tickets
 * Estrategia: Identificar huecos disponibles y seleccionar aleatoriamente
 */

import { supabase } from '../supabase';

export interface TicketNumberOptions {
  rifa_id: string;
  minDigits?: number; // Número mínimo de dígitos (por defecto 5)
  maxNumber?: number; // Número máximo de ticket (por defecto 99999)
}

/**
 * Obtiene todos los números de ticket existentes para una rifa
 * 
 * @param rifa_id - ID de la rifa
 * @returns Array de números de ticket existentes ordenados
 */
export async function getExistingTicketNumbers(rifa_id: string): Promise<string[]> {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('numero_ticket')
    .eq('rifa_id', rifa_id)
    .order('numero_ticket', { ascending: true });

  if (error) {
    console.error('Error obteniendo tickets existentes:', error);
    return [];
  }

  return tickets.map(ticket => ticket.numero_ticket);
}

/**
 * Encuentra los números de ticket disponibles (huecos) en una rifa
 * 
 * @param rifa_id - ID de la rifa
 * @param minDigits - Número mínimo de dígitos
 * @param maxNumber - Número máximo de ticket
 * @returns Array de números disponibles
 */
export async function findAvailableTicketNumbers(
  rifa_id: string, 
  minDigits: number = 5,
  maxNumber: number = 99999
): Promise<string[]> {
  const existingNumbers = await getExistingTicketNumbers(rifa_id);
  
  // Si no hay tickets existentes, todos los números están disponibles
  if (existingNumbers.length === 0) {
    const availableNumbers: string[] = [];
    for (let i = 1; i <= maxNumber; i++) {
      availableNumbers.push(i.toString().padStart(minDigits, '0'));
    }
    return availableNumbers;
  }

  // Convertir a números y ordenar
  const numericExisting = existingNumbers
    .map(num => parseInt(num, 10))
    .filter(num => !isNaN(num))
    .sort((a, b) => a - b);

  // Encontrar huecos disponibles
  const availableNumbers: string[] = [];
  let currentNumber = 1;

  for (const existingNum of numericExisting) {
    // Agregar todos los números desde currentNumber hasta existingNum - 1
    while (currentNumber < existingNum) {
      if (currentNumber <= maxNumber) {
        availableNumbers.push(currentNumber.toString().padStart(minDigits, '0'));
      }
      currentNumber++;
    }
    currentNumber = existingNum + 1;
  }

  // Agregar números restantes después del último existente
  while (currentNumber <= maxNumber) {
    availableNumbers.push(currentNumber.toString().padStart(minDigits, '0'));
    currentNumber++;
  }

  return availableNumbers;
}

/**
 * Genera un número de ticket único seleccionando aleatoriamente de los disponibles
 * 
 * @param options - Opciones de configuración
 * @returns Número de ticket único como string
 */
export async function generateUniqueTicketNumber(options: TicketNumberOptions): Promise<string> {
  const { rifa_id, minDigits = 5, maxNumber = 99999 } = options;
  
  try {
    // Obtener números disponibles
    const availableNumbers = await findAvailableTicketNumbers(rifa_id, minDigits, maxNumber);
    
    if (availableNumbers.length === 0) {
      throw new Error('No hay números de ticket disponibles');
    }

    // Seleccionar aleatoriamente de los disponibles
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const selectedNumber = availableNumbers[randomIndex];

    console.log(`🎫 Número seleccionado aleatoriamente: ${selectedNumber} de ${availableNumbers.length} disponibles`);
    
    return selectedNumber;
    
  } catch (error) {
    console.error('Error generando número único:', error);
    
    // Fallback: usar timestamp + random
    const timestamp = Math.floor(Date.now() / 1000);
    const fallbackNumber = (100000 + (timestamp % 900000)).toString().padStart(minDigits, '0');
    
    console.warn(`⚠️ Usando número de fallback: ${fallbackNumber}`);
    return fallbackNumber;
  }
}

/**
 * Genera múltiples números de ticket únicos para una rifa
 * 
 * @param options - Opciones de configuración
 * @param count - Cantidad de tickets a generar
 * @returns Array de números de ticket únicos
 */
export async function generateMultipleTicketNumbers(
  options: TicketNumberOptions, 
  count: number
): Promise<string[]> {
  const { rifa_id, minDigits = 5, maxNumber = 99999 } = options;
  
  try {
    // Obtener todos los números disponibles de una vez
    const availableNumbers = await findAvailableTicketNumbers(rifa_id, minDigits, maxNumber);
    
    if (availableNumbers.length < count) {
      throw new Error(`Solo hay ${availableNumbers.length} números disponibles, se solicitaron ${count}`);
    }

    // Mezclar aleatoriamente los números disponibles
    const shuffledNumbers = [...availableNumbers].sort(() => Math.random() - 0.5);
    
    // Tomar los primeros 'count' números
    const selectedNumbers = shuffledNumbers.slice(0, count);
    
    console.log(`🎫 Generados ${count} números únicos de ${availableNumbers.length} disponibles`);
    
    return selectedNumbers;
    
  } catch (error) {
    console.error('Error generando múltiples números:', error);
    
    // Fallback: generar uno por uno
    const ticketNumbers: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const ticketNumber = await generateUniqueTicketNumber(options);
      ticketNumbers.push(ticketNumber);
      
      // Pequeña pausa para evitar colisiones
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return ticketNumbers;
  }
}

/**
 * Obtiene estadísticas de disponibilidad de tickets para una rifa
 * 
 * @param rifa_id - ID de la rifa
 * @param minDigits - Número mínimo de dígitos
 * @param maxNumber - Número máximo de ticket
 * @returns Estadísticas de disponibilidad
 */
export async function getTicketAvailabilityStats(
  rifa_id: string, 
  minDigits: number = 5,
  maxNumber: number = 99999
): Promise<{
  total: number;
  existing: number;
  available: number;
  percentage: number;
}> {
  const existingNumbers = await getExistingTicketNumbers(rifa_id);
  const availableNumbers = await findAvailableTicketNumbers(rifa_id, minDigits, maxNumber);
  
  const total = maxNumber;
  const existing = existingNumbers.length;
  const available = availableNumbers.length;
  const percentage = Math.round((available / total) * 100);
  
  return { total, existing, available, percentage };
}

/**
 * Verifica si un número de ticket está disponible
 * 
 * @param rifa_id - ID de la rifa
 * @param numero_ticket - Número de ticket a verificar
 * @returns true si está disponible, false si ya existe
 */
export async function isTicketNumberAvailable(
  rifa_id: string, 
  numero_ticket: string
): Promise<boolean> {
  const { data: existingTicket, error } = await supabase
    .from('tickets')
    .select('numero_ticket')
    .eq('rifa_id', rifa_id)
    .eq('numero_ticket', numero_ticket)
    .single();
  
  if (error && error.code === 'PGRST116') {
    return true; // No existe, está disponible
  }
  
  return false; // Existe, no está disponible
}

/**
 * Obtiene un rango de números de ticket disponibles
 * 
 * @param rifa_id - ID de la rifa
 * @param start - Número de inicio
 * @param end - Número de fin
 * @param minDigits - Número mínimo de dígitos
 * @returns Array de números disponibles en el rango
 */
export async function getAvailableTicketRange(
  rifa_id: string,
  start: number,
  end: number,
  minDigits: number = 5
): Promise<string[]> {
  const availableNumbers = await findAvailableTicketNumbers(rifa_id, minDigits, end);
  
  return availableNumbers
    .map(num => parseInt(num, 10))
    .filter(num => num >= start && num <= end)
    .map(num => num.toString().padStart(minDigits, '0'));
}
