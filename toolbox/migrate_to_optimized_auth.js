#!/usr/bin/env node

/**
 * 🔄 MIGRACIÓN A AUTENTICACIÓN OPTIMIZADA
 * ======================================
 * Script para migrar del sistema de autenticación actual
 * al sistema optimizado que elimina verificaciones redundantes
 * ======================================
 */

const fs = require('fs')
const path = require('path')

console.log('🔄 Iniciando migración a autenticación optimizada...\n')

// Archivos a migrar
const migrations = [
  {
    file: 'app/admin/(panel)/layout.tsx',
    changes: [
      {
        from: 'import { AdminAuthProviderSimple } from "@/lib/context/AdminAuthContextSimple";',
        to: 'import { AdminAuthProviderOptimized } from "@/lib/context/AdminAuthContextOptimized";'
      },
      {
        from: 'import { ProtectedRoute } from "../components/protected-route";',
        to: 'import { ProtectedRouteOptimized } from "../components/protected-route-optimized";'
      },
      {
        from: '<AdminAuthProviderSimple>',
        to: '<AdminAuthProviderOptimized>'
      },
      {
        from: '<ProtectedRoute>',
        to: '<ProtectedRouteOptimized>'
      },
      {
        from: '</ProtectedRoute>',
        to: '</ProtectedRouteOptimized>'
      },
      {
        from: '</AdminAuthProviderSimple>',
        to: '</AdminAuthProviderOptimized>'
      }
    ]
  }
]

async function migrateFile(filePath, changes) {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Archivo no encontrado: ${filePath}`)
      return false
    }

    let content = fs.readFileSync(fullPath, 'utf8')
    let modified = false

    changes.forEach(change => {
      if (content.includes(change.from)) {
        content = content.replace(change.from, change.to)
        modified = true
        console.log(`✅ Reemplazado: ${change.from} → ${change.to}`)
      }
    })

    if (modified) {
      // Crear backup
      const backupPath = `${fullPath}.backup.${Date.now()}`
      fs.writeFileSync(backupPath, fs.readFileSync(fullPath))
      console.log(`💾 Backup creado: ${backupPath}`)

      // Escribir archivo modificado
      fs.writeFileSync(fullPath, content)
      console.log(`✅ Archivo migrado: ${filePath}`)
      return true
    } else {
      console.log(`ℹ️  No se encontraron cambios en: ${filePath}`)
      return false
    }

  } catch (error) {
    console.error(`❌ Error migrando ${filePath}:`, error.message)
    return false
  }
}

async function runMigration() {
  console.log('📋 Archivos a migrar:')
  migrations.forEach(migration => {
    console.log(`   - ${migration.file}`)
  })
  console.log('')

  let successCount = 0
  let totalCount = migrations.length

  for (const migration of migrations) {
    console.log(`🔄 Migrando ${migration.file}...`)
    const success = await migrateFile(migration.file, migration.changes)
    if (success) successCount++
    console.log('')
  }

  console.log('📊 Resumen de migración:')
  console.log(`   ✅ Archivos migrados exitosamente: ${successCount}/${totalCount}`)
  
  if (successCount === totalCount) {
    console.log('\n🎉 Migración completada exitosamente!')
    console.log('\n📈 Mejoras implementadas:')
    console.log('   ✅ Sistema de autenticación unificado')
    console.log('   ✅ Eliminación de verificaciones redundantes')
    console.log('   ✅ Cache inteligente optimizado')
    console.log('   ✅ Consultas de base de datos optimizadas')
    console.log('\n💡 Próximos pasos:')
    console.log('   1. Ejecutar: node toolbox/optimize_admin_auth_performance.js')
    console.log('   2. Probar la funcionalidad en desarrollo')
    console.log('   3. Monitorear el rendimiento en producción')
  } else {
    console.log('\n⚠️  Migración parcial. Revisar errores arriba.')
  }
}

// Ejecutar migración
runMigration()
