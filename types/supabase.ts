export interface Database {
  public: {
    Tables: {
      categorias_rifas: {
        Row: {
          id: string
          nombre: string
          icono: string
          descripcion?: string
          color: string
          activa: boolean
          orden: number
          fecha_creacion: string
        }
        Insert: {
          id?: string
          nombre: string
          icono: string
          descripcion?: string
          color?: string
          activa?: boolean
          orden?: number
          fecha_creacion?: string
        }
        Update: {
          id?: string
          nombre?: string
          icono?: string
          descripcion?: string
          color?: string
          activa?: boolean
          orden?: number
          fecha_creacion?: string
        }
      }
      rifas: {
        Row: {
          id: string
          titulo: string
          descripcion?: string
          precio_ticket: number
          imagen_url?: string
          estado: 'activa' | 'cerrada' | 'finalizada'
          fecha_creacion: string
          fecha_cierre?: string
          total_tickets: number
          tickets_disponibles: number
          premio_principal?: string
          condiciones?: string
          activa: boolean
          categoria_id?: string
          cantidad_tickets?: number
          numero_tickets_comprar?: any
          tipo_rifa?: string
          fecha_culminacion?: string
          categoria?: string
          marca?: string
          modelo?: string
          ano?: number
          color?: string
          valor_estimado_usd?: number
          destacada: boolean
          orden: number
          slug?: string
          categorias_rifas?: {
            id: string
            nombre: string
            icono: string
            color: string
          }
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string
          precio_ticket: number
          imagen_url?: string
          estado?: 'activa' | 'cerrada' | 'finalizada'
          fecha_creacion?: string
          fecha_cierre?: string
          total_tickets?: number
          tickets_disponibles?: number
          premio_principal?: string
          condiciones?: string
          activa?: boolean
          categoria_id?: string
          cantidad_tickets?: number
          numero_tickets_comprar?: any
          tipo_rifa?: string
          fecha_culminacion?: string
          categoria?: string
          marca?: string
          modelo?: string
          ano?: number
          color?: string
          valor_estimado_usd?: number
          destacada?: boolean
          orden?: number
          slug?: string
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string
          precio_ticket?: number
          imagen_url?: string
          estado?: 'activa' | 'cerrada' | 'finalizada'
          fecha_creacion?: string
          fecha_cierre?: string
          total_tickets?: number
          tickets_disponibles?: number
          premio_principal?: string
          condiciones?: string
          activa?: boolean
          categoria_id?: string
          cantidad_tickets?: number
          numero_tickets_comprar?: any
          tipo_rifa?: string
          fecha_culminacion?: string
          categoria?: string
          marca?: string
          modelo?: string
          ano?: number
          color?: string
          valor_estimado_usd?: number
          destacada?: boolean
          orden?: number
          slug?: string
        }
      }
      tickets: {
        Row: {
          id: string
          rifa_id?: string
          numero_ticket: string
          precio: number
          nombre: string
          cedula: string
          telefono?: string
          correo: string
          estado: 'reservado' | 'pagado' | 'verificado' | 'cancelado'
          fecha_compra: string
          fecha_verificacion?: string
          bloqueado_por_pago: boolean
          pago_bloqueante_id?: string
          fecha_bloqueo?: string
          estado_verificacion: string
          pago_bloqueador_id?: string
          pago_id?: string
          email?: string
          rifas?: {
            id: string
            titulo: string
            precio_ticket: number
          }
        }
        Insert: {
          id?: string
          rifa_id?: string
          numero_ticket: string
          precio: number
          nombre: string
          cedula: string
          telefono?: string
          correo: string
          estado?: 'reservado' | 'pagado' | 'verificado' | 'cancelado'
          fecha_compra?: string
          fecha_verificacion?: string
          bloqueado_por_pago?: boolean
          pago_bloqueante_id?: string
          fecha_bloqueo?: string
          estado_verificacion?: string
          pago_bloqueador_id?: string
          pago_id?: string
          email?: string
        }
        Update: {
          id?: string
          rifa_id?: string
          numero_ticket?: string
          precio?: number
          nombre?: string
          cedula?: string
          telefono?: string
          correo?: string
          estado?: 'reservado' | 'pagado' | 'verificado' | 'cancelado'
          fecha_compra?: string
          fecha_verificacion?: string
          bloqueado_por_pago?: boolean
          pago_bloqueante_id?: string
          fecha_bloqueo?: string
          estado_verificacion?: string
          pago_bloqueador_id?: string
          pago_id?: string
          email?: string
        }
      }
      pagos: {
        Row: {
          id: string
          ticket_id?: string
          tipo_pago: 'pago_movil' | 'binance' | 'zelle' | 'zinli' | 'paypal' | 'efectivo'
          estado: 'pendiente' | 'verificado' | 'rechazado'
          monto_bs: number
          monto_usd: number
          tasa_cambio: number
          referencia?: string
          fecha_pago: string
          fecha_verificacion?: string
          telefono_pago?: string
          banco_pago?: string
          cedula_pago?: string
          id_binance?: string
          correo_zelle?: string
          banco_zelle?: string
          usuario_zinli?: string
          correo_paypal?: string
          fecha_visita?: string
          verificado_por?: string
          notas?: string
          tickets?: {
            id: string
            numero_ticket: string
            nombre: string
            correo: string
          }
        }
        Insert: {
          id?: string
          ticket_id?: string
          tipo_pago: 'pago_movil' | 'binance' | 'zelle' | 'zinli' | 'paypal' | 'efectivo'
          estado?: 'pendiente' | 'verificado' | 'rechazado'
          monto_bs: number
          monto_usd: number
          tasa_cambio: number
          referencia?: string
          fecha_pago?: string
          fecha_verificacion?: string
          telefono_pago?: string
          banco_pago?: string
          cedula_pago?: string
          id_binance?: string
          correo_zelle?: string
          banco_zelle?: string
          usuario_zinli?: string
          correo_paypal?: string
          fecha_visita?: string
          verificado_por?: string
          notas?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          tipo_pago?: 'pago_movil' | 'binance' | 'zelle' | 'zinli' | 'paypal' | 'efectivo'
          estado?: 'pendiente' | 'verificado' | 'rechazado'
          monto_bs?: number
          monto_usd?: number
          tasa_cambio?: number
          referencia?: string
          fecha_pago?: string
          fecha_verificacion?: string
          telefono_pago?: string
          banco_pago?: string
          cedula_pago?: string
          id_binance?: string
          correo_zelle?: string
          banco_zelle?: string
          usuario_zinli?: string
          correo_paypal?: string
          fecha_visita?: string
          verificado_por?: string
          notas?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email?: string
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email?: string
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'admin'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
