# =====================================================
# SCRIPT DE DEBUG CON VARIABLES DE ENTORNO
# =====================================================
# Este script configura las variables de entorno y ejecuta
# el debug de getRifaFull para encontrar la falla
# =====================================================

Write-Host "🚀 Iniciando debug de getRifaFull..." -ForegroundColor Green
Write-Host ""

# Leer variables de entorno del archivo .env
$envPath = Join-Path $PSScriptRoot "..\..\.env"
if (Test-Path $envPath) {
    Write-Host "📋 Leyendo variables de entorno desde .env..." -ForegroundColor Cyan
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "   ✅ $name configurado" -ForegroundColor Green
        }
    }
} else {
    Write-Host "⚠️ Archivo .env no encontrado" -ForegroundColor Yellow
}

# Verificar variables críticas
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY

Write-Host ""
Write-Host "🔍 Verificando variables de entorno:" -ForegroundColor Cyan
Write-Host "   NEXT_PUBLIC_SUPABASE_URL: $(if ($supabaseUrl) { '✅' } else { '❌' })" -ForegroundColor $(if ($supabaseUrl) { 'Green' } else { 'Red' })
Write-Host "   SUPABASE_SERVICE_ROLE_KEY: $(if ($supabaseServiceKey) { '✅' } else { '❌' })" -ForegroundColor $(if ($supabaseServiceKey) { 'Green' } else { 'Red' })

if (-not $supabaseUrl -or -not $supabaseServiceKey) {
    Write-Host ""
    Write-Host "❌ Variables de entorno faltantes" -ForegroundColor Red
    Write-Host "💡 Configura las variables en el archivo .env antes de continuar" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Variables de entorno configuradas correctamente" -ForegroundColor Green
Write-Host ""

# Ejecutar el script de debug
Write-Host "🧪 Ejecutando script de debug..." -ForegroundColor Cyan
Write-Host ""

$debugScript = Join-Path $PSScriptRoot "33_debug_get_rifa_full.js"
if (Test-Path $debugScript) {
    node $debugScript
} else {
    Write-Host "❌ Script de debug no encontrado: $debugScript" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Debug completado!" -ForegroundColor Green
