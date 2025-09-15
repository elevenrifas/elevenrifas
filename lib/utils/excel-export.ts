import * as XLSX from 'xlsx'

// =====================================================
// 🎯 UTILIDADES DE EXPORTACIÓN EXCEL - ELEVEN RIFAS
// =====================================================
// Funciones reutilizables para exportar datos a Excel
// =====================================================

export interface ExcelExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
  dateFormat?: string
}

/**
 * Exporta un array de objetos a un archivo Excel
 * @param data Array de objetos a exportar
 * @param options Opciones de exportación
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExcelExportOptions = {}
): void {
  try {
    const {
      filename = 'export',
      sheetName = 'Datos',
      includeHeaders = true,
      dateFormat = 'DD/MM/YYYY'
    } = options

    if (!data || data.length === 0) {
      console.warn('No hay datos para exportar')
      return
    }

    // Crear un nuevo workbook
    const workbook = XLSX.utils.book_new()

    // Preparar los datos para Excel
    const excelData = data.map(item => {
      const processedItem: Record<string, any> = {}
      
      Object.keys(item).forEach(key => {
        const value = item[key]
        
        // Formatear fechas
        if (value instanceof Date) {
          processedItem[key] = value.toLocaleDateString('es-ES')
        } else if (typeof value === 'string' && isDateString(value)) {
          processedItem[key] = new Date(value).toLocaleDateString('es-ES')
        } else if (value === null || value === undefined) {
          processedItem[key] = ''
        } else {
          processedItem[key] = value
        }
      })
      
      return processedItem
    })

    // Crear worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Configurar ancho de columnas automáticamente
    const columnWidths = Object.keys(data[0]).map(key => {
      const maxLength = Math.max(
        key.length, // Longitud del header
        ...data.map(item => String(item[key] || '').length)
      )
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) }
    })
    
    worksheet['!cols'] = columnWidths

    // Agregar el worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generar el archivo Excel
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      compression: true
    })

    // Crear blob y descargar
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Limpiar URL
    URL.revokeObjectURL(url)
    
    console.log(`✅ Archivo Excel exportado exitosamente: ${filename}.xlsx`)
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    throw new Error('Error al exportar a Excel')
  }
}

/**
 * Exporta datos de clientes específicamente formateados
 * @param clientes Array de clientes
 * @param filename Nombre del archivo
 */
export function exportClientesToExcel(clientes: any[], filename: string = 'clientes'): void {
  try {
    // Mapear los datos de clientes a un formato más legible
    const excelData = clientes.map(cliente => ({
      'Cédula': cliente.cedula,
      'Nombre': cliente.nombre,
      'Correo': cliente.correo,
      'Teléfono': cliente.telefono || 'N/A',
      'Total Tickets': cliente.total_tickets,
      'Total Rifas': cliente.total_rifas,
      'Primer Compra': cliente.primer_compra ? new Date(cliente.primer_compra).toLocaleDateString('es-ES') : 'N/A',
      'Última Compra': cliente.ultima_compra ? new Date(cliente.ultima_compra).toLocaleDateString('es-ES') : 'N/A'
    }))

    exportToExcel(excelData, {
      filename,
      sheetName: 'Clientes',
      includeHeaders: true
    })
  } catch (error) {
    console.error('Error al exportar clientes a Excel:', error)
    throw error
  }
}

/**
 * Exporta datos de rifas específicamente formateados
 * @param rifas Array de rifas
 * @param filename Nombre del archivo
 */
export function exportRifasToExcel(rifas: any[], filename: string = 'rifas'): void {
  try {
    console.log('📊 [exportRifasToExcel] Iniciando exportación...')
    console.log('📊 [exportRifasToExcel] Rifas recibidas:', rifas.length)
    console.log('📊 [exportRifasToExcel] Primer rifa:', rifas[0])
    
    const excelData = rifas.map(rifa => ({
      'ID': rifa.id,
      'Título': rifa.titulo,
      'Descripción': rifa.descripcion || 'N/A',
      'Categoría': rifa.categorias_rifas?.nombre || 'N/A',
      'Precio Ticket': rifa.precio_ticket,
      'Total Tickets': rifa.total_tickets,
      'Tickets Vendidos': rifa.vendidos || 0,
      'Tickets Reservados': rifa.reservas_activas || 0,
      'Tickets Disponibles': rifa.disponibles || 0,
      'Progreso (%)': rifa.progreso || 0,
      'Estado': rifa.estado,
      'Fecha Creación': rifa.fecha_creacion ? new Date(rifa.fecha_creacion).toLocaleDateString('es-ES') : 'N/A',
      'Fecha Cierre': rifa.fecha_cierre ? new Date(rifa.fecha_cierre).toLocaleDateString('es-ES') : 'N/A',
      'Opciones de Compra': rifa.numero_tickets_comprar ? rifa.numero_tickets_comprar.join(', ') : 'N/A'
    }))

    console.log('📊 [exportRifasToExcel] Datos procesados:', excelData.length, 'filas')
    console.log('📊 [exportRifasToExcel] Primera fila procesada:', excelData[0])

    exportToExcel(excelData, {
      filename,
      sheetName: 'Rifas',
      includeHeaders: true
    })
    
    console.log('✅ [exportRifasToExcel] Exportación completada exitosamente')
  } catch (error) {
    console.error('❌ [exportRifasToExcel] Error al exportar rifas a Excel:', error)
    throw error
  }
}

/**
 * Exporta datos de pagos específicamente formateados
 * @param pagos Array de pagos
 * @param filename Nombre del archivo
 */
export function exportPagosToExcel(pagos: any[], filename: string = 'pagos'): void {
  try {
    console.log('📊 [exportPagosToExcel] Iniciando exportación...')
    console.log('📊 [exportPagosToExcel] Pagos recibidos:', pagos.length)
    console.log('📊 [exportPagosToExcel] Primer pago:', pagos[0])
    
    const excelData = pagos.map(pago => ({
      'ID': pago.id,
      'Referencia': pago.referencia || 'N/A',
      'Tipo Pago': pago.tipo_pago,
      'Estado': pago.estado,
      'Monto USD': pago.monto_usd,
      'Monto Bs': pago.monto_bs,
      'Tasa Cambio': pago.tasa_cambio,
      'Nombre del Titular': pago.nombre_titular || 'N/A',
      'Teléfono Pago': pago.telefono_pago || 'N/A',
      'Banco Pago': pago.banco_pago || 'N/A',
      'Cédula Pago': pago.cedula_pago || 'N/A',
      'Fecha Pago': pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-ES') : 'N/A',
      'Fecha Verificación': pago.fecha_verificacion ? new Date(pago.fecha_verificacion).toLocaleDateString('es-ES') : 'N/A',
      'Verificado Por': pago.verificado_por || 'N/A',
      'Fecha Visita': pago.fecha_visita ? new Date(pago.fecha_visita).toLocaleDateString('es-ES') : 'N/A',
      'Cliente': pago.tickets?.[0]?.nombre || 'N/A',
      'Cédula Cliente': pago.tickets?.[0]?.cedula || 'N/A',
      'Correo Cliente': pago.tickets?.[0]?.correo || 'N/A',
      'Teléfono Cliente': pago.tickets?.[0]?.telefono || 'N/A',
      'Rifa': pago.tickets?.[0]?.rifas?.titulo || 'N/A',
      'Cantidad Tickets': pago.tickets?.length || 0
    }))

    console.log('📊 [exportPagosToExcel] Datos procesados:', excelData.length, 'filas')
    console.log('📊 [exportPagosToExcel] Primera fila procesada:', excelData[0])

    exportToExcel(excelData, {
      filename,
      sheetName: 'Pagos',
      includeHeaders: true
    })
    
    console.log('✅ [exportPagosToExcel] Exportación completada exitosamente')
  } catch (error) {
    console.error('❌ [exportPagosToExcel] Error al exportar pagos a Excel:', error)
    throw error
  }
}

/**
 * Verifica si una cadena es una fecha válida
 * @param str Cadena a verificar
 * @returns true si es una fecha válida
 */
function isDateString(str: string): boolean {
  if (!str) return false
  const date = new Date(str)
  return !isNaN(date.getTime()) && str.includes('-')
}

/**
 * Hook personalizado para exportaciones
 */
export function useExcelExport() {
  return {
    exportToExcel,
    exportClientesToExcel,
    exportRifasToExcel,
    exportPagosToExcel
  }
}
