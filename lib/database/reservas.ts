import { supabase } from './supabase';
import { generateMultipleTicketNumbers, TicketNumberOptions, getTicketAvailabilityStats } from './utils/ticket-generator';
import { getVenezuelaDate } from '../utils/venezuela-date';

export interface ReservaResultado {
  success: boolean;
  reserva_id?: string;
  numeros?: string[];
  ticket_ids?: string[];
  error?: string;
  expires_at?: string;
}

const RESERVA_MINUTOS = 10;

export async function reservarTickets(
  rifa_id: string,
  cantidad: number,
  reserva_id: string,
  participante: { nombre: string; cedula: string; telefono: string; correo: string }
): Promise<ReservaResultado> {
  try {
    // 🛡️ VALIDACIÓN: Límite de 250 tickets
    if (cantidad > 250) {
      return {
        success: false,
        error: `No se pueden comprar más de 250 tickets. Cantidad solicitada: ${cantidad}`,
      };
    }
    
    // Verificar disponibilidad antes de reservar
    const stats = await getTicketAvailabilityStats(rifa_id, 4);
    if ((stats.available || 0) < cantidad) {
      return {
        success: false,
        error: `Solo hay ${stats.available} tickets disponibles en este momento.`,
      };
    }

    // Generar números disponibles
    const options: TicketNumberOptions = { rifa_id, minDigits: 4 };
    const numeros = await generateMultipleTicketNumbers(options, cantidad);

    // 🆕 INSERCIÓN CON VALIDACIÓN DE UNICIDAD EN TIEMPO REAL
    const now = getVenezuelaDate();
    const expires = new Date(now.getTime() + RESERVA_MINUTOS * 60 * 1000);
    
    console.log('🔄 INICIANDO INSERCIÓN CON VALIDACIÓN DE UNICIDAD:', {
      rifa_id,
      cantidad,
      numeros_generados: numeros.length,
      reserva_id
    });
    
    let inserted: any[] = [];
    let numerosInsertados: string[] = [];
    let intentos = 0;
    const maxIntentos = 3;
    
    while (intentos < maxIntentos && numerosInsertados.length < cantidad) {
      try {
        console.log(`🔄 INTENTO ${intentos + 1}: Verificando disponibilidad de ${numeros.length} números...`);
        
        // 🆕 VERIFICACIÓN COMPLETA: Números en BD + Números ya insertados en esta sesión
        let numerosOcupados: any[] = [];
        let checkError: any = null;
        
        // 🛡️ SISTEMA DE REINTENTOS PARA ERRORES DE CONEXIÓN
        for (let reintento = 0; reintento < 3; reintento++) {
          try {
            console.log(`🔍 Reintento ${reintento + 1}/3: Verificando números ocupados...`);
            
                    // 🆕 CONSULTA SIMPLIFICADA: Con 250 tickets máximo, no necesitamos dividir en lotes
        const resultado = await supabase
          .from('tickets')
          .select('numero_ticket')
          .eq('rifa_id', rifa_id)
          .in('numero_ticket', numeros);
        
        numerosOcupados = resultado.data || [];
        checkError = resultado.error;
        
        if (!checkError) {
          console.log(`✅ Verificación exitosa en reintento ${reintento + 1}: ${numerosOcupados.length} números ocupados encontrados`);
          break;
        }
        
        // Si es error de conexión, reintentar
        if (checkError.message?.includes('Failed to fetch') || 
            checkError.message?.includes('network') ||
            checkError.message?.includes('timeout')) {
          console.log(`⚠️ Error de conexión detectado, reintentando en ${(reintento + 1) * 2} segundos...`);
          await new Promise(resolve => setTimeout(resolve, (reintento + 1) * 2000));
          continue;
        }
        
        // Si es otro tipo de error, no reintentar
        break;
            
          } catch (error) {
            console.error(`❌ Error en reintento ${reintento + 1}:`, error);
            if (reintento === 2) {
              checkError = error;
            }
            await new Promise(resolve => setTimeout(resolve, (reintento + 1) * 1000));
          }
        }
        
        if (checkError) {
          console.error('❌ Error verificando números ocupados después de reintentos:', checkError);
          return { success: false, error: `Error verificando disponibilidad después de reintentos: ${checkError.message}` };
        }
        
        // 🆕 COMBINAR: Números ocupados en BD + Números ya insertados en esta sesión
        const numerosOcupadosBD = new Set((numerosOcupados || []).map((t: any) => t.numero_ticket));
        const numerosOcupadosSesion = new Set(numerosInsertados);
        const todosLosOcupados = new Set([...numerosOcupadosBD, ...numerosOcupadosSesion]);
        
        // Filtrar números realmente disponibles (excluyendo BD + sesión actual)
        const numerosDisponibles = numeros.filter(n => !todosLosOcupados.has(n));
        
        console.log(`🔍 VALIDACIÓN COMPLETA:`, {
          ocupados_bd: numerosOcupadosBD.size,
          ocupados_sesion: numerosOcupadosSesion.size,
          total_ocupados: todosLosOcupados.size,
          disponibles_restantes: numerosDisponibles.length
        });
        
        console.log(`📊 VERIFICACIÓN DE DISPONIBILIDAD:`, {
          total_verificados: numeros.length,
          ocupados: todosLosOcupados.size,
          disponibles: numerosDisponibles.length,
          necesarios: cantidad - numerosInsertados.length
        });
        
        if (numerosDisponibles.length === 0) {
          // Todos los números están ocupados, generar nuevos
          console.log('⚠️ Todos los números generados están ocupados, generando nuevos...');
          const nuevosNumeros = await generateMultipleTicketNumbers(options, cantidad);
          numeros.splice(0, numeros.length, ...nuevosNumeros);
          intentos++;
          continue;
        }
        
        // 🆕 CREAR TICKETS DISPONIBLES (lotes de máximo 100 para evitar conflictos)
        const maxLoteSize = 100;
        const ticketsDisponibles = numerosDisponibles.slice(0, Math.min(maxLoteSize, cantidad - numerosInsertados.length)).map((numero) => ({
      rifa_id,
      numero_ticket: numero,
      nombre: participante.nombre,
      cedula: participante.cedula,
      telefono: participante.telefono,
      correo: participante.correo,
      estado: 'reservado',
      reserva_id,
      reservado_hasta: expires.toISOString(),
    }));

        // 🆕 VALIDACIÓN FINAL: Verificar que no haya conflictos en el lote actual
        const numerosEnLoteActual = ticketsDisponibles.map((t: any) => t.numero_ticket);
        const numerosDuplicadosEnLote = numerosEnLoteActual.filter((numero: any, index: any) => 
          numerosEnLoteActual.indexOf(numero) !== index
        );
        
        if (numerosDuplicadosEnLote.length > 0) {
          console.error(`❌ CONFLICTO EN LOTE ACTUAL: Números duplicados detectados:`, numerosDuplicadosEnLote);
          // Filtrar números duplicados del lote
          const numerosUnicosEnLote = [...new Set(numerosEnLoteActual)];
          const ticketsUnicos = ticketsDisponibles.filter((t: any) => 
            numerosUnicosEnLote.includes(t.numero_ticket)
          );
          
          console.log(`🔄 FILTRANDO LOTE: ${ticketsDisponibles.length} → ${ticketsUnicos.length} tickets únicos`);
          
          if (ticketsUnicos.length === 0) {
            console.log('⚠️ No hay tickets únicos en este lote, continuando...');
            intentos++;
            continue;
          }
          
          // 🆕 VALIDACIÓN DE UNICIDAD EN TIEMPO REAL ANTES DE INSERTAR
          console.log('🔍 VALIDANDO UNICIDAD EN TIEMPO REAL ANTES DE INSERTAR...');
          let numerosOcupadosRealtime: any[] = [];
          let checkRealtimeError: any = null;
          
          // 🛡️ VALIDACIÓN EN TIEMPO REAL SIMPLIFICADA
          console.log('🔍 Validando unicidad en tiempo real...');
          
          const resultadoRealtime = await supabase
            .from('tickets')
            .select('numero_ticket')
            .eq('rifa_id', rifa_id)
            .in('numero_ticket', numerosUnicosEnLote);
          
          numerosOcupadosRealtime = resultadoRealtime.data || [];
          checkRealtimeError = resultadoRealtime.error;
          
          if (checkRealtimeError) {
            console.error('❌ Error en validación en tiempo real:', checkRealtimeError);
            intentos++;
            continue;
          }
          
          console.log(`✅ Validación en tiempo real exitosa: ${numerosOcupadosRealtime.length} números ocupados encontrados`);
          
          if (checkRealtimeError) {
            console.error('❌ Error en validación en tiempo real después de reintentos:', checkRealtimeError);
            intentos++;
            continue;
          }
          
          // Filtrar números que siguen disponibles
          const numerosOcupadosRealtimeSet = new Set((numerosOcupadosRealtime || []).map((t: any) => t.numero_ticket));
          const numerosRealmenteDisponibles = numerosUnicosEnLote.filter(n => !numerosOcupadosRealtimeSet.has(n));
          
          console.log(`📊 VALIDACIÓN EN TIEMPO REAL:`, {
            verificados: numerosUnicosEnLote.length,
            ocupados_ahora: numerosOcupadosRealtimeSet.size,
            realmente_disponibles: numerosRealmenteDisponibles.length
          });
          
          if (numerosRealmenteDisponibles.length === 0) {
            console.log('⚠️ Todos los números del lote están ocupados ahora, continuando...');
            intentos++;
            continue;
          }
          
          // Crear tickets solo con números realmente disponibles
          const ticketsRealmenteDisponibles = ticketsUnicos.filter(t => 
            numerosRealmenteDisponibles.includes(t.numero_ticket)
          );
          
          // Usar solo tickets realmente disponibles
          let loteInsertado: any[] = [];
          let insertError: any = null;
          
          // 🛡️ SISTEMA DE REINTENTOS PARA INSERCIÓN
          for (let reintentoInsert = 0; reintentoInsert < 3; reintentoInsert++) {
            try {
              console.log(`🔍 Reintento ${reintentoInsert + 1}/3: Insertando tickets...`);
              
              const resultadoInsert = await supabase
                .from('tickets')
                .insert(ticketsRealmenteDisponibles as any)
                .select('id, numero_ticket');
              
              loteInsertado = resultadoInsert.data || [];
              insertError = resultadoInsert.error;
              
              if (!insertError) {
                console.log(`✅ Inserción exitosa en reintento ${reintentoInsert + 1}`);
                break;
              }
              
              // Si es error de conexión, reintentar
              if (insertError.message?.includes('Failed to fetch') || 
                  insertError.message?.includes('network') ||
                  insertError.message?.includes('timeout')) {
                console.log(`⚠️ Error de conexión en inserción, reintentando en ${(reintentoInsert + 1) * 1} segundo...`);
                await new Promise(resolve => setTimeout(resolve, (reintentoInsert + 1) * 1000));
                continue;
              }
              
              // Si es otro tipo de error, no reintentar
              break;
              
            } catch (error) {
              console.error(`❌ Error en inserción, reintento ${reintentoInsert + 1}:`, error);
              if (reintentoInsert === 2) {
                insertError = error;
              }
              await new Promise(resolve => setTimeout(resolve, (reintentoInsert + 1) * 500));
            }
          }
          
          if (insertError) {
            console.error(`❌ Error en intento ${intentos + 1}:`, insertError);
            intentos++;
            continue;
          }
          
          console.log(`✅ LOTE INSERTADO EXITOSAMENTE: ${loteInsertado?.length || 0} tickets únicos`);
          
          // Agregar a la lista de insertados
          inserted.push(...(loteInsertado || []));
          numerosInsertados.push(...(loteInsertado || []).map((t: any) => t.numero_ticket));
          
        } else {
          // No hay duplicados, insertar normalmente
          console.log(`📝 INSERTANDO LOTE: ${ticketsDisponibles.length} tickets (máximo ${maxLoteSize} por lote)...`);
          
          // 🆕 VALIDACIÓN DE UNICIDAD EN TIEMPO REAL ANTES DE INSERTAR
          console.log('🔍 VALIDANDO UNICIDAD EN TIEMPO REAL ANTES DE INSERTAR...');
          let numerosOcupadosRealtime: any[] = [];
          let checkRealtimeError: any = null;
          
          // 🛡️ VALIDACIÓN EN TIEMPO REAL SIMPLIFICADA
          console.log('🔍 Validando unicidad en tiempo real...');
          
          const resultadoRealtime = await supabase
            .from('tickets')
            .select('numero_ticket')
            .eq('rifa_id', rifa_id)
            .in('numero_ticket', numerosEnLoteActual);
          
          numerosOcupadosRealtime = resultadoRealtime.data || [];
          checkRealtimeError = resultadoRealtime.error;
          
          if (checkRealtimeError) {
            console.error('❌ Error en validación en tiempo real:', checkRealtimeError);
            intentos++;
            continue;
          }
          
          console.log(`✅ Validación en tiempo real exitosa: ${numerosOcupadosRealtime.length} números ocupados encontrados`);
          
          if (checkRealtimeError) {
            console.error('❌ Error en validación en tiempo real después de reintentos:', checkRealtimeError);
            intentos++;
            continue;
          }
          
          // Filtrar números que siguen disponibles
          const numerosOcupadosRealtimeSet = new Set((numerosOcupadosRealtime || []).map((t: any) => t.numero_ticket));
          const numerosRealmenteDisponibles = numerosEnLoteActual.filter(n => !numerosOcupadosRealtimeSet.has(n));
          
          console.log(`📊 VALIDACIÓN EN TIEMPO REAL:`, {
            verificados: numerosEnLoteActual.length,
            ocupados_ahora: numerosOcupadosRealtimeSet.size,
            realmente_disponibles: numerosRealmenteDisponibles.length
          });
          
          if (numerosRealmenteDisponibles.length === 0) {
            console.log('⚠️ Todos los números del lote están ocupados ahora, continuando...');
            intentos++;
            continue;
          }
          
          // Crear tickets solo con números realmente disponibles
          const ticketsRealmenteDisponibles = ticketsDisponibles.filter(t => 
            numerosRealmenteDisponibles.includes(t.numero_ticket)
          );
          
          // Insertar en lotes más pequeños para evitar conflictos
          let loteInsertado: any[] = [];
          let insertError: any = null;
          
          // 🛡️ SISTEMA DE REINTENTOS PARA INSERCIÓN PRINCIPAL
          for (let reintentoInsert = 0; reintentoInsert < 3; reintentoInsert++) {
            try {
              console.log(`🔍 Reintento ${reintentoInsert + 1}/3: Insertando tickets principales...`);
              
              const resultadoInsert = await supabase
                .from('tickets')
                .insert(ticketsRealmenteDisponibles as any)
                .select('id, numero_ticket');
              
              loteInsertado = resultadoInsert.data || [];
              insertError = resultadoInsert.error;
              
              if (!insertError) {
                console.log(`✅ Inserción principal exitosa en reintento ${reintentoInsert + 1}`);
                break;
              }
              
              // Si es error de conexión, reintentar
              if (insertError.message?.includes('Failed to fetch') || 
                  insertError.message?.includes('network') ||
                  insertError.message?.includes('timeout')) {
                console.log(`⚠️ Error de conexión en inserción principal, reintentando en ${(reintentoInsert + 1) * 1} segundo...`);
                await new Promise(resolve => setTimeout(resolve, (reintentoInsert + 1) * 1000));
                continue;
              }
              
              // Si es otro tipo de error, no reintentar
              break;
              
            } catch (error) {
              console.error(`❌ Error en inserción principal, reintento ${reintentoInsert + 1}:`, error);
              if (reintentoInsert === 2) {
                insertError = error;
              }
              await new Promise(resolve => setTimeout(resolve, (reintentoInsert + 1) * 500));
            }
          }
          
          if (insertError) {
            console.error(`❌ Error en inserción principal después de reintentos:`, insertError);
            intentos++;
            continue;
          }
          
          console.log(`✅ LOTE INSERTADO EXITOSAMENTE: ${loteInsertado?.length || 0} tickets`);
          
          // Agregar a la lista de insertados
          inserted.push(...(loteInsertado || []));
          numerosInsertados.push(...(loteInsertado || []).map((t: any) => t.numero_ticket));
        }
        
        console.log(`📊 PROGRESO: ${numerosInsertados.length}/${cantidad} tickets insertados`);
        
        // Si ya tenemos todos los tickets, salir del bucle
        if (numerosInsertados.length >= cantidad) {
          console.log('🎯 TODOS LOS TICKETS INSERTADOS - Saliendo del bucle');
          break;
        }
        
        // Pequeña pausa entre intentos
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error en intento ${intentos + 1}:`, error);
        intentos++;
      }
    }
    
    if (numerosInsertados.length < cantidad) {
      console.log(`❌ RESERVA INCOMPLETA: Solo ${numerosInsertados.length}/${cantidad} tickets reservados después de ${maxIntentos} intentos`);
      return { 
        success: false, 
        error: `Solo se pudieron reservar ${numerosInsertados.length} de ${cantidad} tickets después de ${maxIntentos} intentos` 
      };
    }
    
    console.log(`🎉 RESERVA COMPLETADA EXITOSAMENTE: ${numerosInsertados.length} tickets reservados en ${intentos + 1} intentos`);
    
    if (!inserted || inserted.length === 0) {
      return { success: false, error: 'No se pudieron insertar los tickets' };
    }

    // 🆕 VERIFICACIÓN POST-RESERVA: Confirmar que realmente se reservaron todos los tickets
    const { data: verificacion, error: verError } = await supabase
      .from('tickets')
      .select('id')
      .eq('reserva_id', reserva_id)
      .eq('estado', 'reservado');

    if (verError || !verificacion || verificacion.length !== cantidad) {
      // Si la verificación falla, limpiar tickets parciales y fallar limpiamente
      if (inserted && inserted.length > 0) {
        console.log(`🧹 Limpiando ${inserted.length} tickets parciales por verificación fallida`);
        await supabase
          .from('tickets')
          .delete()
          .in('id', inserted.map(t => t.id));
      }
      
      const errorMsg = verError 
        ? `Error en verificación: ${verError.message}`
        : `Verificación fallida: se esperaban ${cantidad} tickets, se encontraron ${verificacion?.length || 0}`;
      
      return { 
        success: false, 
        error: errorMsg
      };
    }

    console.log(`✅ Reserva exitosa: ${verificacion.length} tickets verificados para reserva ${reserva_id}`);
    return { success: true, reserva_id, numeros, ticket_ids: (inserted as any[]).map(r => r.id), expires_at: expires.toISOString() };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function cancelarReservaPorIds(ticket_ids: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ticket_ids.length) return { success: true };
    const { error } = await supabase
      .from('tickets')
      .delete()
      .in('id', ticket_ids)
      .is('pago_id', null);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function liberarReservasExpiradas(): Promise<{ success: boolean; liberadas: number; error?: string }> {
  try {
    const now = getVenezuelaDate();
    const limite = new Date(now.getTime() - RESERVA_MINUTOS * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('tickets')
      .delete()
      .lt('reservado_hasta', limite)
      .eq('estado', 'reservado')
      .is('pago_id', null)
      .select('*');
    if (error) return { success: false, liberadas: 0, error: error.message };
    return { success: true, liberadas: (data as any[])?.length || 0 };
  } catch (error) {
    return { success: false, liberadas: 0, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}


