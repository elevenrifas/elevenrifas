"use client";
import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { participacionSchema, type ParticipacionForm } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { MetodoPagoSelector } from "@/components/MetodoPagoSelector";
import { PagoMovilFields } from "@/components/PagoMovilFields";
import { BinanceFields } from "@/components/BinanceFields";
import { ZelleFields } from "@/components/ZelleFields";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generarNumerosTicket, formatearFechaTicket } from "@/lib/ticketUtils";
import { RequiredInput } from "@/components/ui/required-input";
import { useRouter } from "next/navigation";

type Props = {
  rifaId: string;
  titulo?: string;
  precio?: number;
  cantidadInicial?: number;
  onSubmitSuccess?: () => void;
};

export function FormularioRifa({ rifaId, titulo, precio, cantidadInicial = 1, onSubmitSuccess }: Props) {
  const router = useRouter();
  const form = useForm<ParticipacionForm>({
    resolver: zodResolver(participacionSchema),
    mode: "onChange",
    defaultValues: {
      nombre: "", cedula: "", telefono: "", correo: "", cantidad: cantidadInicial, monto: 0, metodoPago: undefined,
      pagoMovil: { telefonoPago: "", bancoPago: "", cedulaPago: "", referencia: "", comprobante: undefined, },
      binance: { referencia: "", comprobante: undefined, },
      zelle: { correoZelle: "", referencia: "", comprobante: undefined, },
    },
  });

  // Sincronizar cantidadInicial con el formulario cuando cambie
  React.useEffect(() => {
    form.setValue("cantidad", cantidadInicial);
  }, [cantidadInicial, form]);

  const [currentStep, setCurrentStep] = React.useState<1 | 2>(1);
  
  const next = async () => {
    if (currentStep === 1) {
      // Validar paso 1 con validadores personalizados
      if (!validarPaso1()) {
        return;
      }
      
      // Si pasa la validación, continuar al siguiente paso
      setCurrentStep(2);
    }
  };
  const back = () => setCurrentStep(1);

  // Funciones de manejo para cada método de pago
  const handlePagoMovilSubmit = async () => {
    const values = form.getValues();
    const errorValidacion = validarCamposRequeridos(values);
    
    if (errorValidacion) {
      toast.error(errorValidacion);
      return;
    }
    
    if (values.metodoPago === "pago_movil" && values.pagoMovil) {
      await procesarParticipacion(values);
    }
  };

  const handleBinanceSubmit = async () => {
    const values = form.getValues();
    const errorValidacion = validarCamposRequeridos(values);
    
    if (errorValidacion) {
      toast.error(errorValidacion);
      return;
    }
    
    if (values.metodoPago === "binance" && values.binance) {
      await procesarParticipacion(values);
    }
  };

  const handleZelleSubmit = async () => {
    const values = form.getValues();
    const errorValidacion = validarCamposRequeridos(values);
    
    if (errorValidacion) {
      toast.error(errorValidacion);
      return;
    }
    
    if (values.metodoPago === "zelle" && values.zelle) {
      await procesarParticipacion(values);
    }
  };

  // Función común para procesar la participación
  const procesarParticipacion = async (values: ParticipacionForm) => {
    try {
      console.log("🎯 Procesando participación:", values);
      
      // Generar números únicos para el ticket
      const numerosTicket = generarNumerosTicket(values.cantidad, 1, 100);
      
      // Generar ticket
      const ticketData = {
        numeros: numerosTicket,
        nombre: values.nombre,
        cedula: values.cedula,
        fecha: formatearFechaTicket(new Date())
      };
      
      console.log("🎫 Ticket generado exitosamente:", { rifaId, ...values, numerosTicket });
      toast.success("¡Ticket generado exitosamente!");
      
      // Redirigir a la página del ticket con los datos
      const params = new URLSearchParams({
        nombre: values.nombre,
        cedula: values.cedula,
        numeros: numerosTicket.join(","),
        fecha: ticketData.fecha,
        rifaId: rifaId,
        titulo: titulo || "Rifa"
      });
      
      router.push(`/ticket?${params.toString()}`);
      
      form.reset();
      onSubmitSuccess?.();
    } catch (error) {
      console.error("💥 Error al procesar participación:", error);
      toast.error("Error al procesar la participación");
    }
  };

  // Validadores personalizados para campos requeridos según método de pago
  const validarCamposRequeridos = (values: ParticipacionForm): string | null => {
    if (!values.metodoPago) {
      return "Selecciona un método de pago";
    }

    if (values.metodoPago === "pago_movil") {
      if (!values.pagoMovil?.telefonoPago || !values.pagoMovil?.bancoPago || !values.pagoMovil?.cedulaPago || !values.pagoMovil?.referencia) {
        return "Completa todos los campos de Pago Móvil";
      }
    }

    if (values.metodoPago === "binance") {
      if (!values.binance?.referencia) {
        return "Completa la referencia de Binance";
      }
    }

    if (values.metodoPago === "zelle") {
      if (!values.zelle?.correoZelle || !values.zelle?.referencia) {
        return "Completa el correo Zelle y la referencia";
      }
    }

    return null;
  };

  // Validación del paso 1
  const validarPaso1 = (): boolean => {
    const values = form.getValues();
    
    // Validar campos requeridos del paso 1
    if (!values.nombre?.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }
    
    if (!values.cedula?.trim()) {
      toast.error("La cédula es requerida");
      return false;
    }
    
    if (!values.telefono?.trim()) {
      toast.error("El teléfono es requerido");
      return false;
    }
    
    if (!values.correo?.trim()) {
      toast.error("El correo es requerido");
      return false;
    }
    
    // Validaciones adicionales
    if (values.nombre.length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    
    if (values.cedula.length < 5) {
      toast.error("La cédula debe tener al menos 5 caracteres");
      return false;
    }
    
    if (values.telefono.length < 7) {
      toast.error("El teléfono debe tener al menos 7 caracteres");
      return false;
    }
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.correo)) {
      toast.error("El formato del correo no es válido");
      return false;
    }
    
    return true;
  };

  const cantidad = form.watch("cantidad");

  React.useEffect(() => {
    if (typeof precio === "number" && precio > 0 && typeof cantidad === "number") {
      const calculado = Number((cantidad * precio).toFixed(2));
      form.setValue("monto", calculado, { shouldValidate: true, shouldDirty: true });
    }
  }, [cantidad, precio, form]);

  async function onSubmit(values: ParticipacionForm) {
    console.log("🚀 onSubmit llamado con valores:", values);
    console.log("📝 Estado del formulario:", form.formState);
    
    try {
      // Validar todos los campos antes de enviar
      console.log("🔍 Iniciando validación del formulario...");
      const isValid = await form.trigger();
      console.log("✅ Validación del formulario:", isValid);
      
      if (!isValid) {
        console.log("❌ Formulario no válido");
        toast.error("Por favor completa todos los campos requeridos");
        return;
      }
      
      console.log("🎯 Todas las validaciones pasaron, generando ticket...");
      
      // Generar números únicos para el ticket
      const numerosTicket = generarNumerosTicket(values.cantidad, 1, 100);
      
      // Generar ticket
      // setTicketGenerado({
      //   numeros: numerosTicket,
      //   nombre: values.nombre,
      //   cedula: values.cedula,
      //   fecha: formatearFechaTicket(new Date())
      // });
      
      console.log("🎫 Ticket generado exitosamente:", { rifaId, ...values, numerosTicket });
      toast.success("¡Ticket generado exitosamente!");
      form.reset();
      onSubmitSuccess?.();
    } catch (error) {
      console.error("💥 Error en onSubmit:", error);
      toast.error("Error al procesar la participación");
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((values) => { console.log("📤 Formulario enviado, llamando onSubmit..."); return onSubmit(values); })} className="space-y-4">

          {/* Paso 1 */}
          <div className={cn(
            "transition-all duration-500",
            currentStep === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 h-0 overflow-hidden"
          )}>
            
            <RequiredInput
              label="Nombre completo"
              placeholder="Juan Pérez"
              value={form.watch("nombre") || ""}
              onChange={(value) => form.setValue("nombre", value)}
              error={form.formState.errors.nombre?.message}
            />

            <RequiredInput
              label="Cédula"
              placeholder="12345678"
              value={form.watch("cedula") || ""}
              onChange={(value) => form.setValue("cedula", value)}
              error={form.formState.errors.cedula?.message}
            />

            <RequiredInput
              label="Teléfono"
              placeholder="0412-1234567"
              value={form.watch("telefono") || ""}
              onChange={(value) => form.setValue("telefono", value)}
              error={form.formState.errors.telefono?.message}
            />

            <RequiredInput
              label="Correo electrónico"
              type="email"
              placeholder="juan@email.com"
              value={form.watch("correo") || ""}
              onChange={(value) => form.setValue("correo", value)}
              error={form.formState.errors.correo?.message}
            />

            <Separator className="mt-4 sm:mt-5 mb-1" />
            <Button 
              type="button" 
              className="w-full mt-1" 
              onClick={next}
              disabled={false} // Removed isValidating
            >
              {/* Removed isValidating ? "Validando..." : "Continuar" */}
              Continuar
            </Button>
          </div>

          {/* Paso 2 */}
          <div className={cn(
            "transition-all duration-500",
            currentStep === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 h-0 overflow-hidden"
          )}>
            <FormField
              control={form.control}
              name="metodoPago"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel>Método de pago <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <MetodoPagoSelector value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!form.watch("metodoPago") && (
              <div className="text-center py-8 text-muted-foreground">
                Selecciona un método de pago para continuar
              </div>
            )}

            {form.watch("metodoPago") === "pago_movil" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4 bg-secondary/20">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="font-medium">📱 Datos para Pago Móvil:</div>
                    <div>• <strong>Teléfono:</strong> 0412-555-0123</div>
                    <div>• <strong>Banco:</strong> Banco de Venezuela</div>
                    <div>• <strong>Cédula:</strong> 12.345.678</div>
                    <div>• <strong>Referencia:</strong> Tu nombre + fecha</div>
                  </div>
                </div>
                <PagoMovilFields />
                <Button type="button" className="w-full" onClick={handlePagoMovilSubmit} disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Enviando..." : "Finalizar"}
                </Button>
              </div>
            )}

            {form.watch("metodoPago") === "binance" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4 bg-secondary/20">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="font-medium">💎 Datos para Binance:</div>
                    <div>• <strong>Billetera:</strong> TRC20: TQn9Y2khDD8...</div>
                    <div>• <strong>Red:</strong> TRC20 (Tron)</div>
                    <div>• <strong>Monto:</strong> {(form.watch("cantidad") || 1) * (precio || 0)} BS</div>
                    <div>• <strong>Referencia:</strong> Tu nombre + fecha</div>
                  </div>
                </div>
                <BinanceFields />
                <Button type="button" className="w-full" onClick={handleBinanceSubmit} disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Enviando..." : "Finalizar"}
                </Button>
              </div>
            )}

            {form.watch("metodoPago") === "zelle" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4 bg-secondary/20">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="font-medium">💳 Datos para Zelle:</div>
                    <div>• <strong>Correo:</strong> pagos@elevenrifas.com</div>
                    <div>• <strong>Nombre:</strong> Eleven Rifas</div>
                    <div>• <strong>Monto:</strong> {(form.watch("cantidad") || 1) * (precio || 0)} BS</div>
                    <div>• <strong>Referencia:</strong> Tu nombre + fecha</div>
                  </div>
                </div>
                <ZelleFields />
                <Button type="button" className="w-full" onClick={handleZelleSubmit} disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Enviando..." : "Finalizar"}
              </Button>
            </div>
            )}

            <Button type="button" variant="outline" className="w-full mt-4" onClick={back}>
              Volver
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

