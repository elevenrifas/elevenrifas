#!/usr/bin/env node

/**
 * Script de verificación para builds de Vercel
 * Verifica que no haya imports problemáticos antes del build
 */

const fs = require('fs');
const path = require('path');

// Archivos y directorios a verificar
const CHECK_PATHS = [
  'app',
  'components',
  'hooks',
  'lib',
  'types'
];

// Patrones de import problemáticos
const PROBLEMATIC_IMPORTS = [
  '@/toolbox',
  '@/scripts',
  'toolbox/',
  'scripts/'
];

// Colores para la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      PROBLEMATIC_IMPORTS.forEach(pattern => {
        if (line.includes(pattern)) {
          issues.push({
            line: lineNum,
            content: line.trim(),
            pattern
          });
        }
      });
    });

    return issues;
  } catch (error) {
    return [{ error: error.message }];
  }
}

function checkDirectory(dirPath) {
  const issues = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Ignorar node_modules y .next
        if (item !== 'node_modules' && item !== '.next' && !item.startsWith('.')) {
          issues.push(...checkDirectory(fullPath));
        }
      } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
        const fileIssues = checkFile(fullPath);
        if (fileIssues.length > 0) {
          issues.push({
            file: fullPath,
            issues: fileIssues
          });
        }
      }
    });
  } catch (error) {
    // Ignorar directorios que no se pueden leer
  }
  
  return issues;
}

function main() {
  log('🔍 Verificando imports problemáticos para build de Vercel...', 'blue');
  
  const allIssues = [];
  
  CHECK_PATHS.forEach(checkPath => {
    if (fs.existsSync(checkPath)) {
      log(`\n📁 Verificando: ${checkPath}`, 'blue');
      const issues = checkDirectory(checkPath);
      if (issues.length > 0) {
        allIssues.push(...issues);
      } else {
        log(`✅ ${checkPath} - Sin problemas`, 'green');
      }
    }
  });
  
  if (allIssues.length === 0) {
    log('\n🎉 ¡Todos los archivos están listos para el build!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Se encontraron imports problemáticos:', 'red');
    
    allIssues.forEach(fileIssue => {
      if (fileIssue.error) {
        log(`\n📄 Error al leer archivo: ${fileIssue.error}`, 'red');
      } else {
        log(`\n📄 ${fileIssue.file}:`, 'yellow');
        fileIssue.issues.forEach(issue => {
          if (issue.line) {
            log(`   Línea ${issue.line}: ${issue.content}`, 'red');
            log(`   Problema: Import de ${issue.pattern}`, 'red');
          }
        });
      }
    });
    
    log('\n💡 Soluciones:', 'blue');
    log('1. Reemplaza imports de @/toolbox con @/lib/utils/logger', 'yellow');
    log('2. Asegúrate de que todos los imports apunten a archivos existentes', 'yellow');
    log('3. Verifica que no haya imports de carpetas excluidas', 'yellow');
    
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { checkFile, checkDirectory };
