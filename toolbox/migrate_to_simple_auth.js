#!/usr/bin/env node

/**
 * ⚡ MIGRACIÓN A AUTENTICACIÓN SÚPER SIMPLE
 * ========================================
 * Script para migrar al sistema más simple posible
 * Solo storage local, sin cache complejo, máxima velocidad
 * ========================================
 */

const fs = require('fs')
const path = require('path')

console.log('⚡ Iniciando migración a autenticación súper simple...\n')

// Archivos a migrar
const migrations = [
  {
    file: 'app/admin/(panel)/layout.tsx',
    changes: [
      {
        from: 'import { AdminAuthProviderSimple } from "@/lib/context/AdminAuthContextSimple";',
        to: 'import { AdminAuthProviderSimpleStorage } from "@/lib/context/AdminAuthContextSimpleStorage";'
      },
      {
        from: 'import { ProtectedRoute } from "../components/protected-route";',
        to: 'import { ProtectedRouteSimple } from "../components/protected-route-simple";'
      },
      {
        from: '<AdminAuthProviderSimple>',
        to: '<AdminAuthProviderSimpleStorage>'
      },
      {
        from: '<ProtectedRoute>',
        to: '<ProtectedRouteSimple>'
      },
      {
        from: '</ProtectedRoute>',
        to: '</ProtectedRouteSimple>'
      },
      {
        from: '</AdminAuthProviderSimple>',
        to: '</AdminAuthProviderSimpleStorage>'
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
    console.log('\n⚡ Características del sistema súper simple:')
    console.log('   ✅ Solo verificación de storage local')
    console.log('   ✅ Sin cache complejo que cause lentitud')
    console.log('   ✅ Verificación instantánea')
    console.log('   ✅ Sin procesos gigantes en cada navegación')
    console.log('   ✅ Máxima velocidad y simplicidad')
    console.log('\n💡 Cómo funciona:')
    console.log('   1. Primera vez: Verifica sesión de Supabase')
    console.log('   2. Guarda datos en localStorage por 24 horas')
    console.log('   3. Próximas verificaciones: Solo lee storage (instantáneo)')
    console.log('   4. Si no hay storage: Verifica Supabase una vez más')
    console.log('\n🚀 Beneficios:')
    console.log('   - Navegación instantánea')
    console.log('   - Sin "Verificando autenticación" constante')
    console.log('   - Sin procesos complejos')
    console.log('   - Máxima simplicidad')
  } else {
    console.log('\n⚠️  Migración parcial. Revisar errores arriba.')
  }
}

// Ejecutar migración
runMigration()
