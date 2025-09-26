/**
 * Configuración de datos de pago para Eleven Rifas
 * Centraliza todos los datos de métodos de pago para facilitar mantenimiento
 */

export interface PaymentMethodData {
  phone: string;
  bank: string;
  cedula: string;
  email?: string;
  name?: string;
  wallet?: string;
  network?: string;
  address?: string;
  schedule?: string;
  reference?: string;
}

export interface PaymentConfig {
  pago_movil: PaymentMethodData;
  binance: PaymentMethodData;
  zelle: PaymentMethodData;
  paypal: PaymentMethodData;
  efectivo: PaymentMethodData;
  zinli: PaymentMethodData;
}

export const paymentDataConfig: PaymentConfig = {
  pago_movil: {
    phone: "04141205723",
    bank: "Banesco Banco Universal",
    cedula: "V13599960",
    reference: "0134"
  },
  
  binance: {
    wallet: "902828267",
    network: "Binance Pay",
    name: "Eleven Rifas"
  },
  
  zelle: {
    email: "Ganacone11even@gmail.com",
    name: "Yolimar Meléndez"
  },
  
  paypal: {
    email: "Dilomiagroup@gmail.com"
  },
  
  efectivo: {
    address: "Calle Sanz, Santa Mónica, Caracas",
    schedule: "Lunes a Viernes 9:00 AM - 6:00 PM"
  },
  
  zinli: {
    email: "pagos@elevenrifas.com"
  }
};

/**
 * Función para obtener datos de un método de pago específico
 */
export const getPaymentMethodData = (method: keyof PaymentConfig): PaymentMethodData => {
  return paymentDataConfig[method];
};

/**
 * Función para generar el texto completo de Pago Móvil
 */
export const generatePagoMovilText = (monto: number): string => {
  const config = paymentDataConfig.pago_movil;
  return `${config.reference}\n${config.cedula}\n${config.phone}\n${monto.toFixed(2)}`;
};

/**
 * Función para formatear teléfono sin guiones
 */
export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/-/g, '');
};

/**
 * Función para formatear cédula sin puntos
 */
export const formatCedula = (cedula: string): string => {
  return cedula.replace(/\./g, '');
};

