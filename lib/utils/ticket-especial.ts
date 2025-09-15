/**
 * Utilidades para manejo de tickets especiales
 * Centraliza toda la lógica de identificación y manejo de tickets especiales
 */

export interface TicketData {
  nombre: string
  cedula: string
  telefono?: string
  correo?: string
  es_ticket_especial?: boolean
}

/**
 * Determina si un ticket es especial basado en sus datos
 * @param ticket Datos del ticket
 * @returns true si es especial, false si no
 */
export function esTicketEspecial(ticket: TicketData): boolean {
  // Usar solo el campo es_ticket_especial
  return ticket.es_ticket_especial === true
}

/**
 * Crea los datos por defecto para un ticket especial
 * @returns Objeto con los datos por defecto para tickets especiales
 */
export function crearDatosTicketEspecial(): Partial<TicketData> {
  return {
    nombre: 'TICKET RESERVADO',
    cedula: '000000000',
    telefono: '000000000',
    correo: 'N/A',
    es_ticket_especial: true
  }
}

/**
 * Marca un ticket como especial sin cambiar otros datos
 * @param ticket Datos del ticket
 * @returns Datos del ticket con es_ticket_especial = true
 */
export function marcarComoEspecial(ticket: TicketData): TicketData {
  return {
    ...ticket,
    es_ticket_especial: true
  }
}

/**
 * Verifica si un ticket debe mantener su identidad especial al ser asignado
 * @param ticket Datos del ticket
 * @returns true si debe mantener identidad especial
 */
export function debeMantenerIdentidadEspecial(ticket: TicketData): boolean {
  return esTicketEspecial(ticket)
}

/**
 * Obtiene los datos del cliente para un ticket especial asignado
 * Actualiza datos del cliente pero mantiene solo es_ticket_especial
 * @param ticketEspecial Datos del ticket especial
 * @param datosCliente Datos del cliente real
 * @returns Datos combinados con datos del cliente real y es_ticket_especial
 */
export function combinarDatosTicketEspecialAsignado(
  ticketEspecial: TicketData,
  datosCliente: { nombre: string; cedula: string; telefono?: string; correo?: string }
): TicketData {
  return {
    // Usar datos del cliente real
    nombre: datosCliente.nombre,
    cedula: datosCliente.cedula,
    telefono: datosCliente.telefono || '000000000',
    correo: datosCliente.correo || 'N/A',
    // Mantener solo la identidad especial
    es_ticket_especial: true
  }
}
