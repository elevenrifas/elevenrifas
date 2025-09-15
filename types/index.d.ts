// Tipos para el sistema de rifas

export interface Rifa {
  id: string;
  titulo: string;
  descripcion: string;
  precio_ticket: number;
  imagen_url: string;
  estado: 'activa' | 'cerrada' | 'finalizada';
  fecha_creacion: string;
  fecha_culminacion?: string;
  fecha_cierre?: string;
  total_tickets: number;
  tickets_disponibles: number;
  premio_principal?: string;
  condiciones?: string;
  // Campo activa no existe en el schema real, usar estado en su lugar
  tipo_rifa: string;
  categoria: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  color?: string;
  valor_estimado_usd?: number;
  destacada: boolean;
  orden: number;
  slug: string;
  numero_tickets_comprar: number[];
  categoria_id?: string;
  progreso_manual?: number;
  categorias_rifas?: {
    id: string;
    nombre: string;
    icono: string;
    descripcion?: string;
  };
}

export interface DatosPersona {
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
}

export interface DatosPago {
  telefonoPago?: string;
  bancoPago?: string;
  cedulaPago?: string;
  referencia?: string;
  idBinance?: string;
  emailZelle?: string;
  correoZelle?: string;
  bancoZelle?: string;
  usuarioZinli?: string;
  correoPaypal?: string;
  fechaVisita?: string;
  notas?: string;
  // Campos para comprobantes de pago
  comprobantePago?: File | null;
  comprobanteUrl?: string;
}

export interface RifaComprada {
  id: number;
  titulo: string;
  imagen: string;
  numerosComprados: string[];
  precioTicket: number;
  fechaCompra: string;
  estado: string;
}

// Nuevas interfaces para tickets
export interface TicketConRifa {
  id: string;
  rifa_id: string;
  numero_ticket: string;
  precio: number;
  nombre: string;
  cedula: string;
  telefono?: string;
  correo: string;
  estado: 'reservado' | 'pagado' | 'verificado' | 'cancelado';
  fecha_compra: string;
  fecha_verificacion?: string;
  bloqueado_por_pago: boolean;
  pago_bloqueante_id?: string;
  fecha_bloqueo?: string;
  estado_verificacion: string;
  pago_bloqueador_id?: string;
  pago_id?: string;
  email?: string;
  rifa: {
    id: string;
    titulo: string;
    imagen_url: string;
    estado: string;
    // Campo activa no existe en el schema real, usar estado en su lugar
  };
}

export interface RifaConTickets {
  rifa_id: string;
  titulo: string;
  imagen_url: string;
  estado: string;
  // Campo activa no existe en el schema real, usar estado en su lugar
  tickets: TicketConRifa[];
  total_tickets: number;
  precio_promedio: number;
}

export interface MetodoPago {
  id: string;
  nombre: string;
  icono: React.ReactNode;
  descripcion: string;
}

export interface BancoVenezuela {
  nombre: string;
  codigo: string;
}

export interface DatosPagoMovil {
  banco: string;
  telefono: string;
  cedula: string;
  monto: number;
}

export interface DatosPagoBinance {
  direccion: string;
  red: string;
  monto: number;
}

export interface DatosPagoZelle {
  email: string;
  banco: string;
  monto: number;
}

// Tipos para Tickets
export interface Ticket {
  id: string
  rifa_id: string | null
  numero_ticket: string
  nombre: string
  cedula: string
  telefono: string | null
  correo: string
  fecha_compra: string | null
  pago_id: string | null
  es_ticket_especial?: boolean
}

export interface AdminTicket extends Ticket {
  rifas?: {
    id: string
    titulo: string
  }
  pagos?: {
    id: string
    monto_bs: number
    monto_usd: number
    estado: 'pendiente' | 'verificado' | 'rechazado'
    tipo_pago: string
  }
  // El estado del ticket ahora es el estado del pago
  estado?: 'pendiente' | 'verificado' | 'rechazado'
}

export interface CreateTicketData {
  rifa_id: string
  numero_ticket: string
  nombre: string
  cedula: string
  telefono?: string
  correo: string
  es_ticket_especial?: boolean
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  pago_id?: string
}

// Tipos para Pagos
export interface Pago {
  id: string;
  tipo_pago: 'pago_movil' | 'binance' | 'zelle' | 'zinli' | 'paypal' | 'efectivo';
  monto_bs: number;
  monto_usd: number;
  tasa_cambio: number;
  referencia?: string;
  fecha_pago: string;
  fecha_verificacion?: string;
  telefono_pago?: string;
  banco_pago?: string;
  cedula_pago?: string;
  fecha_visita?: string;
  verificado_por?: string;
  estado?: string;
}

export interface CreatePagoData {
  tipo_pago: 'pago_movil' | 'binance' | 'zelle' | 'zinli' | 'paypal' | 'efectivo';
  monto_bs: number;
  monto_usd: number;
  tasa_cambio: number;
  referencia?: string;
  telefono_pago?: string;
  banco_pago?: string;
  cedula_pago?: string;
  fecha_visita?: string;
  estado?: string;
}

export interface UpdatePagoData extends Partial<CreatePagoData> {
  fecha_verificacion?: string;
  verificado_por?: string;
}

// Tipos para Clientes (extraídos de tickets)
export interface Cliente {
  id: string // Usaremos la cédula como ID único
  nombre: string
  cedula: string
  telefono: string | null
  correo: string
  total_tickets: number
  total_rifas: number
  primer_compra: string | null
  ultima_compra: string | null
  rifas_compradas: string[]
}

export interface AdminCliente extends Cliente {
  // Información adicional para admin
  tickets?: {
    id: string
    numero_ticket: string
    rifa_id: string
    fecha_compra: string | null
    pago_id: string | null
  }[]
  rifas_detalle?: {
    id: string
    titulo: string
    imagen_url: string
    estado: string
  }[]
}

export interface CreateClienteData {
  nombre: string
  cedula: string
  telefono?: string
  correo: string
}

export interface UpdateClienteData extends Partial<CreateClienteData> {}

// Tipos para Usuario Verificación
export interface UsuarioVerificacion {
  id: string
  usuario: string
  pin: number
  activo: boolean
  fecha_creacion: string
  ultimo_acceso?: string | null
}

export interface CreateUsuarioVerificacionData {
  usuario: string
  pin: number
  activo?: boolean
}

export interface UpdateUsuarioVerificacionData {
  usuario?: string
  pin?: number
  activo?: boolean
  ultimo_acceso?: string | null
}


