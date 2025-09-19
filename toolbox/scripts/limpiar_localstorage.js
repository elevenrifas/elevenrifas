/**
 * Script para limpiar localStorage corrupto
 * Ejecutar en la consola del navegador
 */

console.log('🧹 Limpiando localStorage corrupto...');

// Limpiar localStorage
localStorage.removeItem('rifaActiva');

// Verificar que se limpió
const saved = localStorage.getItem('rifaActiva');
console.log('✅ localStorage limpiado:', saved === null ? 'SÍ' : 'NO');

// Recargar la página
console.log('🔄 Recargando página...');
window.location.reload();
