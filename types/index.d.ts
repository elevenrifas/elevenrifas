// Tipos para el sistema de rifas

export interface Rifa {
  id: string | number;
  titulo: string;
  descripcion: string;
  precioTicket: number;
  imagen: string;
  estado?: string;
  activa?: boolean;
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


