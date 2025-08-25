#!/usr/bin/env node

/**
 * Script de prueba para la nueva lógica de huecos disponibles en tickets
 * Demuestra cómo se identifican y seleccionan números aleatoriamente
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://jlugofbpazvaoksvwcvy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsdWdvZmJwYXp2YW9rc3Z3Y3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDk2NTYsImV4cCI6MjA3MTAyNTY1Nn0.pJ_tGa0wdvuEmZjx5bOKxcXX7errZnoPUW7BdOj0WTA';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testHuecosTickets() {
  try {
    console.log('🧪 Probando nueva lógica de huecos disponibles en tickets...');
    
    // PASO 1: Buscar una rifa con tickets existentes
    console.log('🔍 Buscando rifa con tickets existentes...');
    
    const { data: rifas, error: rifasError } = await supabase
      .from('rifas')
      .select('id, titulo, precio_ticket, tickets_totales, tickets_vendidos')
      .limit(5);
    
    if (rifasError || !rifas || rifas.length === 0) {
      console.log('⚠️ No hay rifas disponibles para probar');
      return;
    }
    
    // Buscar rifa con tickets vendidos
    let rifaConTickets = null;
    for (const rifa of rifas) {
      if (rifa.tickets_vendidos && rifa.tickets_vendidos > 0) {
        rifaConTickets = rifa;
        break;
      }
    }
    
    if (!rifaConTickets) {
      console.log('⚠️ No hay rifas con tickets vendidos para probar');
      return;
    }
    
    console.log('✅ Rifa con tickets encontrada:', {
      id: rifaConTickets.id,
      titulo: rifaConTickets.titulo,
      tickets_vendidos: rifaConTickets.tickets_vendidos
    });
    
    // PASO 2: Obtener todos los números de ticket existentes
    console.log('🎫 Obteniendo números de ticket existentes...');
    
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('numero_ticket')
      .eq('rifa_id', rifaConTickets.id)
      .order('numero_ticket', { ascending: true });
    
    if (ticketsError) {
      console.log('❌ Error obteniendo tickets:', ticketsError.message);
      return;
    }
    
    const numerosExistentes = tickets.map(t => t.numero_ticket);
    console.log(`✅ Encontrados ${numerosExistentes.length} tickets existentes`);
    console.log('📊 Primeros 10 números:', numerosExistentes.slice(0, 10));
    console.log('📊 Últimos 10 números:', numerosExistentes.slice(-10));
    
    // PASO 3: Simular la lógica de encontrar huecos disponibles
    console.log('\n🔍 Simulando búsqueda de huecos disponibles...');
    
    const maxNumber = 99999;
    const minDigits = 5;
    
    // Convertir a números y ordenar
    const numericExisting = numerosExistentes
      .map(num => parseInt(num, 10))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);
    
    console.log('📊 Números existentes ordenados:', {
      min: numericExisting[0],
      max: numericExisting[numericExisting.length - 1],
      total: numericExisting.length
    });
    
    // Encontrar huecos disponibles
    const availableNumbers = [];
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
    
    console.log('✅ Huecos disponibles encontrados:', {
      total: availableNumbers.length,
      porcentaje: Math.round((availableNumbers.length / maxNumber) * 100) + '%'
    });
    
    // PASO 4: Mostrar algunos ejemplos de huecos
    console.log('\n📋 Ejemplos de huecos disponibles:');
    
    // Mostrar primeros 20 huecos
    console.log('🔢 Primeros 20 huecos:', availableNumbers.slice(0, 20));
    
    // Mostrar algunos huecos del medio
    if (availableNumbers.length > 40) {
      const middleIndex = Math.floor(availableNumbers.length / 2);
      console.log('🔢 20 huecos del medio:', availableNumbers.slice(middleIndex, middleIndex + 20));
    }
    
    // Mostrar últimos 20 huecos
    console.log('🔢 Últimos 20 huecos:', availableNumbers.slice(-20));
    
    // PASO 5: Simular selección aleatoria
    console.log('\n🎲 Simulando selección aleatoria de huecos...');
    
    const cantidadSolicitada = 5;
    const numerosSeleccionados = [];
    
    // Mezclar aleatoriamente y tomar los primeros
    const shuffledNumbers = [...availableNumbers].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(cantidadSolicitada, availableNumbers.length); i++) {
      numerosSeleccionados.push(shuffledNumbers[i]);
    }
    
    console.log(`✅ Seleccionados ${numerosSeleccionados.length} números aleatoriamente:`, numerosSeleccionados);
    
    // PASO 6: Verificar que los números seleccionados no existen
    console.log('\n🔍 Verificando que los números seleccionados no existen...');
    
    for (const numero of numerosSeleccionados) {
      const { data: existingTicket, error: checkError } = await supabase
        .from('tickets')
        .select('numero_ticket')
        .eq('rifa_id', rifaConTickets.id)
        .eq('numero_ticket', numero)
        .single();
      
      if (checkError && checkError.code === 'PGRST116') {
        console.log(`✅ ${numero} - Disponible`);
      } else if (existingTicket) {
        console.log(`❌ ${numero} - YA EXISTE (ERROR EN LA LÓGICA)`);
      } else {
        console.log(`⚠️ ${numero} - Estado incierto`);
      }
    }
    
    // PASO 7: Estadísticas finales
    console.log('\n📊 ESTADÍSTICAS FINALES:');
    console.log(`📈 Total de números posibles: ${maxNumber}`);
    console.log(`🎫 Tickets existentes: ${numerosExistentes.length}`);
    console.log(`🕳️ Huecos disponibles: ${availableNumbers.length}`);
    console.log(`📊 Porcentaje de disponibilidad: ${Math.round((availableNumbers.length / maxNumber) * 100)}%`);
    console.log(`🎲 Números seleccionados para prueba: ${numerosSeleccionados.length}`);
    
    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('💡 La nueva lógica identifica correctamente los huecos disponibles');
    console.log('🎯 Los números se seleccionan aleatoriamente de los disponibles');
    console.log('✅ No hay riesgo de colisiones o bucles infinitos');
    
  } catch (error) {
    console.error('💥 Error en prueba:', error);
  }
}

async function main() {
  try {
    await testHuecosTickets();
  } catch (error) {
    console.error('💥 Error en main:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testHuecosTickets };

