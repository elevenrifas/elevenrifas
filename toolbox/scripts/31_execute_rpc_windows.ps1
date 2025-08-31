# =====================================================
# SCRIPT POWERSHELL PARA FUNCIONES RPC - ELEVEN RIFAS
# =====================================================
# Este script ejecuta las funciones SQL RPC necesarias
# para el sistema de rifas en Windows
# =====================================================

Write-Host "Iniciando creacion de funciones RPC para Eleven Rifas..." -ForegroundColor Green

# Verificar si las variables de entorno estan configuradas
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseServiceKey) {
    Write-Host "Variables de entorno faltantes:" -ForegroundColor Red
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL: $(if ($supabaseUrl) { 'OK' } else { 'FALTA' })" -ForegroundColor Red
    Write-Host "   SUPABASE_SERVICE_ROLE_KEY: $(if ($supabaseServiceKey) { 'OK' } else { 'FALTA' })" -ForegroundColor Red
    Write-Host ""
    Write-Host "Configura las variables de entorno antes de ejecutar este script" -ForegroundColor Yellow
    exit 1
}

Write-Host "Variables de entorno configuradas correctamente" -ForegroundColor Green

# Leer el archivo SQL
$sqlPath = Join-Path $PSScriptRoot "..\..\lib\database\Schemas\get_rifa_full.sql"
$sqlContent = Get-Content $sqlPath -Raw

Write-Host "Contenido del archivo SQL:" -ForegroundColor Cyan
Write-Host $sqlContent -ForegroundColor White

Write-Host ""
Write-Host "INSTRUCCIONES PARA EJECUTAR:" -ForegroundColor Yellow
Write-Host "1. Ve a tu panel de Supabase" -ForegroundColor White
Write-Host "2. Abre la consola SQL" -ForegroundColor White
Write-Host "3. Copia y pega el contenido del archivo SQL mostrado arriba" -ForegroundColor White
Write-Host "4. Ejecuta el SQL" -ForegroundColor White
Write-Host ""
Write-Host "Archivo SQL ubicado en: $sqlPath" -ForegroundColor Cyan
Write-Host ""

# Tambien mostrar el archivo get_rifas_full.sql
$sqlPath2 = Join-Path $PSScriptRoot "..\..\lib\database\Schemas\get_rifas_full.sql"
if (Test-Path $sqlPath2) {
    Write-Host "Contenido del archivo get_rifas_full.sql:" -ForegroundColor Cyan
    $sqlContent2 = Get-Content $sqlPath2 -Raw
    Write-Host $sqlContent2 -ForegroundColor White
    Write-Host ""
    Write-Host "Archivo SQL ubicado en: $sqlPath2" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host "Resumen:" -ForegroundColor White
Write-Host "   - Se mostraron los archivos SQL necesarios" -ForegroundColor White
Write-Host "   - Ejecuta manualmente en la consola SQL de Supabase" -ForegroundColor White
Write-Host "   - Las funciones RPC estaran disponibles despues de la ejecucion" -ForegroundColor White
