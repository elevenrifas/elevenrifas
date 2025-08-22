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
  activa: boolean;
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
  numero_tickets_comprar?: number[];
  categorias_rifas?: {
    id: string;
    nombre: string;
    icono: string;
    color: string;
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
    activa: boolean;
  };
}

export interface RifaConTickets {
  rifa_id: string;
  titulo: string;
  imagen_url: string;
  estado: string;
  activa: boolean;
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
  precio: number
  nombre: string
  cedula: string
  telefono: string | null
  correo: string
  estado: 'reservado' | 'pagado' | 'verificado' | 'cancelado'
  fecha_compra: string | null
  fecha_verificacion: string | null
  bloqueado_por_pago: boolean | null
  pago_bloqueante_id: string | null
  fecha_bloqueo: string | null
  estado_verificacion: 'pendiente' | 'verificado' | 'rechazado' | null
  pago_bloqueador_id: string | null
  pago_id: string | null
  email: string | null
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
    estado: string
    tipo_pago: string
  }
}

export interface CreateTicketData {
  rifa_id: string
  numero_ticket: string
  precio: number
  nombre: string
  cedula: string
  telefono?: string
  correo: string
  estado?: 'reservado' | 'pagado' | 'verificado' | 'cancelado'
  email?: string
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  estado_verificacion?: 'pendiente' | 'verificado' | 'rechazado'
  bloqueado_por_pago?: boolean
  fecha_verificacion?: string
}


