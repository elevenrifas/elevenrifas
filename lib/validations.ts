import { z } from "zod";

export const pagoMovilSchema = z.object({
  telefonoPago: z.string().min(7, "Teléfono de pago inválido").optional(),
  bancoPago: z.string().min(2, "Banco requerido").optional(),
  cedulaPago: z.string().min(5, "Cédula inválida").optional(),
  referencia: z.string().min(4, "Referencia inválida").optional(),
  comprobante: z
    .instanceof(File)
    .optional()
    .or(z.any().refine((v) => v === undefined, "Formato de archivo inválido")),
});

export const binanceSchema = z.object({
  referencia: z.string().min(4, "Referencia inválida").optional(),
  comprobante: z
    .instanceof(File)
    .optional()
    .or(z.any().refine((v) => v === undefined, "Formato de archivo inválido")),
});

export const zelleSchema = z.object({
  correoZelle: z.string().email("Correo inválido").optional(),
  referencia: z.string().min(4, "Referencia inválida").optional(),
  comprobante: z
    .instanceof(File)
    .optional()
    .or(z.any().refine((v) => v === undefined, "Formato de archivo inválido")),
});

export const participacionSchema = z.object({
  // Paso 1
  nombre: z.string().min(2, "Nombre muy corto"),
  cedula: z.string().min(5, "Cédula inválida"),
  telefono: z.string().min(7, "Teléfono inválido"),
  correo: z.string().email("Correo inválido"),
  cantidad: z.number().int().min(1, "Mínimo 1 ticket").max(25, "Máximo 25 tickets"),
  monto: z.number().positive("Monto inválido"),

  // Paso 2 - Todos los campos de pago son opcionales a nivel de schema
  metodoPago: z.enum(["pago_movil", "zelle", "binance"]).optional(),
  pagoMovil: pagoMovilSchema.optional(),
  binance: binanceSchema.optional(),
  zelle: zelleSchema.optional(),
});

export type ParticipacionForm = z.infer<typeof participacionSchema>;


