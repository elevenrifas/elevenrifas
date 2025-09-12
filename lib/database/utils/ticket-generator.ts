/**
 * 🎫 GENERADOR DE NÚMEROS DE TICKET ÚNICOS
 * 
 * Implementación en TypeScript de la lógica de generación de tickets
 * Estrategia: Identificar huecos disponibles y seleccionar aleatoriamente
 */

import { supabase } from '../supabase';

export interface TicketNumberOptions {
  rifa_id: string;
  minDigits?: number; // Número mínimo de dígitos (por defecto 4)
  maxNumber?: number; // Número máximo de ticket (opcional, se obtiene de la rifa si no se proporciona)
}

/**
 * Obtiene todos los números de ticket existentes para una rifa
 * 
 * @param rifa_id - ID de la rifa
 * @returns Array de números de ticket existentes ordenados
 */
export async function getExistingTicketNumbers(rifa_id: string): Promise<string[]> {
  console.log('🔍 OBTENIENDO TICKETS EXISTENTES:', { rifa_id });
  
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('numero_ticket, estado, reservado_hasta')
    .eq('rifa_id', rifa_id)
    .order('numero_ticket', { ascending: true });

  if (error) {
    console.error('❌ ERROR OBTENIENDO TICKETS EXISTENTES:', error);
    return [];
  }
  
  console.log('📊 TICKETS ENCONTRADOS EN BD:', {
    total: tickets?.length || 0,
    primeros_5: tickets?.slice(0, 5) || [],
    ultimos_5: tickets?.slice(-5) || []
  });
  
  const now = Date.now();
  const filteredTickets = (tickets as any[])
    .filter((t) => {
      // Tickets PAGADOS ocupan números definitivamente
      if (t.estado === 'pagado') return true;
      
      // Tickets RESERVADOS activos (no expirados) SÍ ocupan números
      // Esto evita que dos personas reserven los mismos números
      if (t.estado === 'reservado' && t.reservado_hasta) {
        const reservadoHasta = new Date(t.reservado_hasta).getTime();
        if (now < reservadoHasta) {
          return true; // ✅ Reserva activa = ocupa número
        }
        // Reserva expirada = no ocupa número
        console.log(`⏰ Reserva expirada para ticket ${t.numero_ticket}, liberando número`);
        return false;
      }
      
      // pendiente/liberado no ocupan
      return false;
    });
  
  const result = filteredTickets.map((t) => t.numero_ticket);
  
  console.log('✅ TICKETS FILTRADOS (OCUPAN NÚMEROS):', {
    total_filtrados: result.length,
    primeros_5: result.slice(0, 5),
    ultimos_5: result.slice(-5),
    estados_originales: tickets?.map(t => ({ numero: t.numero_ticket, estado: t.estado, reservado_hasta: t.reservado_hasta })).slice(0, 5)
  });
  
  // LOGGING DETALLADO PARA DEBUGGEAR EL PROBLEMA
  console.log('🔍 ANÁLISIS DETALLADO DE ESTADOS:', {
    total_tickets: tickets?.length || 0,
    por_estado: tickets?.reduce((acc, t) => {
      acc[t.estado] = (acc[t.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    reservados_con_tiempo: tickets?.filter(t => t.estado === 'reservado' && t.reservado_hasta).length || 0,
    reservados_sin_tiempo: tickets?.filter(t => t.estado === 'reservado' && !t.reservado_hasta).length || 0
  });
  
  return result;
}

/**
 * Encuentra los números de ticket disponibles (huecos) en una rifa
 * 
 * @param rifa_id - ID de la rifa
 * @param minDigits - Número mínimo de dígitos
 * @param maxNumber - Número máximo de ticket (opcional, se obtiene de la rifa si no se proporciona)
 * @returns Array de números disponibles
 */
export async function findAvailableTicketNumbers(
  rifa_id: string, 
  minDigits: number = 4,
  maxNumber?: number
): Promise<string[]> {
  console.log('🔍 BUSCANDO NÚMEROS DISPONIBLES:', {
    rifa_id,
    minDigits,
    maxNumber: maxNumber || 'obtener_de_rifa'
  });
  
  // 🆕 OBTENER TOTAL_TICKETS DE LA RIFA SI NO SE PROPORCIONA
  let actualMaxNumber = maxNumber;
  if (!actualMaxNumber) {
    console.log('🔍 OBTENIENDO TOTAL_TICKETS DE LA RIFA...');
    const { data: rifa, error: rifaError } = await supabase
      .from('rifas')
      .select('total_tickets')
      .eq('id', rifa_id)
      .single();
    
    if (rifaError || !rifa || !rifa.total_tickets) {
      console.error('❌ Error obteniendo total_tickets de la rifa:', rifaError);
      throw new Error(`Error obteniendo total_tickets de la rifa: ${rifaError?.message || 'Rifa no encontrada'}`);
    }
    
    actualMaxNumber = rifa.total_tickets;
    console.log(`📊 TOTAL_TICKETS DE LA RIFA: ${actualMaxNumber}`);
  }
  
  const existingNumbers = await getExistingTicketNumbers(rifa_id);
  console.log('📊 TICKETS EXISTENTES ENCONTRADOS:', {
    cantidad: existingNumbers.length,
    primeros_5: existingNumbers.slice(0, 5),
    ultimos_5: existingNumbers.slice(-5)
  });
  
  // Si no hay tickets existentes, todos los números están disponibles
  if (existingNumbers.length === 0) {
    console.log('✅ NO HAY TICKETS EXISTENTES, TODOS DISPONIBLES');
    const availableNumbers: string[] = [];
    for (let i = 1; i <= actualMaxNumber; i++) {
      availableNumbers.push(i.toString().padStart(minDigits, '0'));
    }
    console.log('📋 NÚMEROS DISPONIBLES GENERADOS:', {
      total: availableNumbers.length,
      primer_numero: availableNumbers[0],
      ultimo_numero: availableNumbers[availableNumbers.length - 1]
    });
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
      if (currentNumber <= actualMaxNumber) {
        availableNumbers.push(currentNumber.toString().padStart(minDigits, '0'));
      }
      currentNumber++;
    }
    currentNumber = existingNum + 1;
  }

  // Agregar números restantes después del último existente
  while (currentNumber <= actualMaxNumber) {
    availableNumbers.push(currentNumber.toString().padStart(minDigits, '0'));
    currentNumber++;
  }

  console.log('📋 NÚMEROS DISPONIBLES CALCULADOS:', {
    total_disponibles: availableNumbers.length,
    primer_disponible: availableNumbers[0],
    ultimo_disponible: availableNumbers[availableNumbers.length - 1],
    rango: `${availableNumbers[0]} - ${availableNumbers[availableNumbers.length - 1]}`
  });

  return availableNumbers;
}

/**
 * Genera un número de ticket único seleccionando aleatoriamente de los disponibles
 * 
 * @param options - Opciones de configuración
 * @returns Número de ticket único como string
 */
export async function generateUniqueTicketNumber(options: TicketNumberOptions): Promise<string> {
  const { rifa_id, minDigits = 4 } = options;
  
  try {
    // Obtener números disponibles (sin maxNumber, se obtiene de la rifa)
    const availableNumbers = await findAvailableTicketNumbers(rifa_id, minDigits);
    
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
    
    // Fallback: usar timestamp + random (ajustado para 4 dígitos)
    const timestamp = Math.floor(Date.now() / 1000);
    const fallbackNumber = (1000 + (timestamp % 9000)).toString().padStart(minDigits, '0');
    
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
  const { rifa_id, minDigits = 4 } = options;
  
  console.log('🎲 GENERANDO MÚLTIPLES NÚMEROS:', {
    rifa_id,
    cantidad: count,
    minDigits
  });
  
  try {
    // 🆕 OBTENER TOTAL_TICKETS DE LA RIFA
    console.log('🔍 OBTENIENDO TOTAL_TICKETS DE LA RIFA...');
    const { data: rifa, error: rifaError } = await supabase
      .from('rifas')
      .select('total_tickets')
      .eq('id', rifa_id)
      .single();
    
    if (rifaError || !rifa || !rifa.total_tickets) {
      console.error('❌ Error obteniendo total_tickets de la rifa:', rifaError);
      throw new Error(`Error obteniendo total_tickets de la rifa: ${rifaError?.message || 'Rifa no encontrada'}`);
    }
    
    const maxNumber = rifa.total_tickets;
    console.log(`📊 TOTAL_TICKETS DE LA RIFA: ${maxNumber}`);
    
    // 🎲 GENERACIÓN ALEATORIA INTELIGENTE: Obtener números disponibles y seleccionar aleatoriamente
    console.log('🔍 OBTENIENDO NÚMEROS DISPONIBLES PARA SELECCIÓN ALEATORIA...');
    
    // 🆕 OPTIMIZACIÓN: Obtener números ocupados de una vez
    const { data: numerosOcupados, error: ocupadosError } = await supabase
      .from('tickets')
      .select('numero_ticket')
      .eq('rifa_id', rifa_id)
      .order('numero_ticket', { ascending: true });
    
    if (ocupadosError) {
      console.error('❌ Error obteniendo números ocupados:', ocupadosError);
      throw new Error(`Error obteniendo números ocupados: ${ocupadosError.message}`);
    }
    
    const numerosOcupadosSet = new Set((numerosOcupados || []).map(t => t.numero_ticket));
    console.log(`📊 NÚMEROS OCUPADOS ENCONTRADOS: ${numerosOcupadosSet.size}`);
    
    // 🎯 GENERAR LISTA COMPLETA DE NÚMEROS DISPONIBLES (1 a total_tickets)
    const numerosDisponibles: string[] = [];
    for (let i = 1; i <= maxNumber; i++) {
      const numeroFormateado = i.toString().padStart(minDigits, '0');
      if (!numerosOcupadosSet.has(numeroFormateado)) {
        numerosDisponibles.push(numeroFormateado);
      }
    }
    
    console.log(`📋 NÚMEROS DISPONIBLES CALCULADOS: ${numerosDisponibles.length}`);
    
    // ✅ VERIFICAR DISPONIBILIDAD
    if (numerosDisponibles.length < count) {
      const error = `Solo hay ${numerosDisponibles.length} números disponibles, se solicitaron ${count}`;
      console.error('❌ ERROR DE DISPONIBILIDAD:', error);
      throw new Error(error);
    }
    
    // 🎲 SELECCIÓN ALEATORIA DE NÚMEROS DISPONIBLES
    console.log('🎲 SELECCIONANDO NÚMEROS ALEATORIAMENTE DE LOS DISPONIBLES...');
    
    // Mezclar aleatoriamente la lista de números disponibles
    const numerosMezclados = [...numerosDisponibles].sort(() => Math.random() - 0.5);
    
    // Tomar los primeros 'count' números de la lista mezclada
    const selectedNumbers = numerosMezclados.slice(0, count);
    
    console.log('✅ NÚMEROS SELECCIONADOS ALEATORIAMENTE:', {
      cantidad_seleccionada: selectedNumbers.length,
      primeros_5: selectedNumbers.slice(0, 5),
      ultimos_5: selectedNumbers.slice(-5),
      total_disponibles: numerosDisponibles.length
    });
    
    return selectedNumbers;
    

    
  } catch (error) {
    console.error('Error generando múltiples números:', error);
    
    // Fallback: generar uno por uno con validación individual
    console.log('🔄 FALLBACK: Generando números uno por uno...');
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
 * @param maxNumber - Número máximo de ticket (opcional, se obtiene de la rifa si no se proporciona)
 * @returns Estadísticas de disponibilidad
 */
export async function getTicketAvailabilityStats(
  rifa_id: string, 
  minDigits: number = 4,
  maxNumber?: number
): Promise<{
  total: number;
  existing: number;
  available: number;
  percentage: number;
}> {
  // Obtener el total real de tickets de la rifa
  const { data: rifa, error: rifaError } = await supabase
    .from('rifas')
    .select('total_tickets')
    .eq('id', rifa_id)
    .single();

  if (rifaError || !rifa || !rifa.total_tickets) {
    throw new Error(`Error al obtener datos de la rifa: ${rifaError?.message || 'Rifa no encontrada'}`);
  }

  const totalRealRifa = rifa.total_tickets;
  const existingNumbers = await getExistingTicketNumbers(rifa_id);
  
  console.log('📊 Calculando disponibilidad:', {
    rifa_id,
    totalRealRifa,
    existingCount: existingNumbers.length,
    existingNumbers: existingNumbers.slice(0, 5) // Solo mostrar primeros 5
  });
  
  // Usar el total real de la rifa en lugar de maxNumber
  const total = totalRealRifa;
  const existing = existingNumbers.length;
  const available = Math.max(0, total - existing); // Asegurar que no sea negativo
  const percentage = Math.round((existing / total) * 100);
  
  console.log('📊 Resultado:', { total, existing, available, percentage });
  
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
  minDigits: number = 4
): Promise<string[]> {
  const availableNumbers = await findAvailableTicketNumbers(rifa_id, minDigits, end);
  
  return availableNumbers
    .map(num => parseInt(num, 10))
    .filter(num => num >= start && num <= end)
    .map(num => num.toString().padStart(minDigits, '0'));
}
