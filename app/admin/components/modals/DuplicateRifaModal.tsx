"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Copy, DollarSign, Tag, Settings, RefreshCw } from "lucide-react"
import type { AdminRifa } from "@/lib/database/admin_database/rifas"
import type { CrudRifaData } from "@/hooks/use-crud-rifas"

// Schema de validación para duplicación
const duplicateRifaSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres").max(255, "El título no puede exceder 255 caracteres"),
  descripcion: z.string().optional(),
  precio_ticket: z.number().min(0.01, "El precio del ticket debe ser mayor a 0"),
  imagen_url: z.string().optional(),
  estado: z.enum(["activa", "cerrada", "finalizada"]),
  total_tickets: z.number().min(1, "Debe haber al menos 1 ticket"),
  tickets_disponibles: z.number().min(0, "Los tickets disponibles no pueden ser negativos"),
  premio_principal: z.string().optional(),
  condiciones: z.string().optional(),
  activa: z.boolean().default(true),
  categoria_id: z.string().optional(),
  cantidad_tickets: z.number().optional(),
  numero_tickets_comprar: z.array(z.number()).optional(),
  tipo_rifa: z.string().optional(),
  categoria: z.string().min(1, "Debe seleccionar una categoría"),
  destacada: z.boolean().default(false),
})

type DuplicateRifaValues = z.infer<typeof duplicateRifaSchema>

interface DuplicateRifaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CrudRifaData) => Promise<{ success: boolean; error?: string }>
  rifa: AdminRifa | null
  isSubmitting?: boolean
}

export function DuplicateRifaModal({
  isOpen,
  onClose,
  onSubmit,
  rifa,
  isSubmitting = false
}: DuplicateRifaModalProps) {
  // Formulario con react-hook-form
  const form = useForm<DuplicateRifaValues>({
    resolver: zodResolver(duplicateRifaSchema),
    defaultValues: {
      titulo: rifa ? `${rifa.titulo} (Copia)` : "",
      descripcion: rifa?.descripcion || "",
      precio_ticket: rifa?.precio_ticket || 0,
      imagen_url: rifa?.imagen_url || "",
      estado: "activa", // Siempre activa al duplicar
      total_tickets: rifa?.total_tickets || 100,
      tickets_disponibles: rifa?.total_tickets || 100, // Mismo que total al duplicar
      premio_principal: rifa?.premio_principal || "",
      condiciones: rifa?.condiciones || "",
      activa: true, // Siempre activa al duplicar
      categoria_id: rifa?.categoria_id || "",
      cantidad_tickets: rifa?.cantidad_tickets || 100,
      numero_tickets_comprar: rifa?.numero_tickets_comprar || [1, 2, 3, 5, 10],
      tipo_rifa: rifa?.tipo_rifa || "vehiculo",
      categoria: rifa?.categoria || "automovil",
      destacada: false, // No destacada por defecto
    },
  })

  // Resetear formulario cuando cambie la rifa
  React.useEffect(() => {
    if (rifa) {
      form.reset({
        titulo: `${rifa.titulo} (Copia)`,
        descripcion: rifa.descripcion || "",
        precio_ticket: rifa.precio_ticket || 0,
        imagen_url: rifa.imagen_url || "",
        estado: "activa",
        total_tickets: rifa.total_tickets || 100,
        tickets_disponibles: rifa.total_tickets || 100,
        premio_principal: rifa.premio_principal || "",
        condiciones: rifa.condiciones || "",
        activa: true,
        categoria_id: rifa.categoria_id || "",
        cantidad_tickets: rifa.cantidad_tickets || 100,
        numero_tickets_comprar: rifa.numero_tickets_comprar || [1, 2, 3, 5, 10],
        tipo_rifa: rifa.tipo_rifa || "vehiculo",
        categoria: rifa.categoria || "automovil",
        destacada: false,
      })
    }
  }, [rifa, form])

  // Manejar envío del formulario
  const handleSubmit = async (data: DuplicateRifaValues) => {
    try {
      const result = await onSubmit(data)
      if (result.success) {
        form.reset()
        onClose()
      } else {
        console.error("Error al duplicar:", result.error)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
    }
  }

  if (!rifa) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicar Rifa
          </DialogTitle>
          <DialogDescription>
            Crea una copia de "{rifa.titulo}" y modifica los campos necesarios
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Tag className="h-4 w-4" />
                Información Básica
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Toyota 4Runner TRD Pro 2024 (Copia)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="automovil">Automóvil</SelectItem>
                          <SelectItem value="electronico">Electrónico</SelectItem>
                          <SelectItem value="inmueble">Inmueble</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precio_ticket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio del Ticket *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total_tickets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total de Tickets *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tickets_disponibles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tickets Disponibles *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activa">Activa</SelectItem>
                          <SelectItem value="cerrada">Cerrada</SelectItem>
                          <SelectItem value="finalizada">Finalizada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe los detalles de la rifa..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imagen_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Imagen</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://ejemplo.com/imagen.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enlace a la imagen de la rifa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Configuración de Tickets */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Tag className="h-4 w-4" />
                Configuración de Tickets
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cantidad_tickets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad de Tickets</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Cantidad total de tickets disponibles
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo_rifa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Rifa</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vehiculo">Vehículo</SelectItem>
                          <SelectItem value="electronico">Electrónico</SelectItem>
                          <SelectItem value="inmueble">Inmueble</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Configuración Avanzada */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Settings className="h-4 w-4" />
                Configuración Avanzada
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="premio_principal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Premio Principal</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Descripción del premio principal" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destacada"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Rifa Destacada</FormLabel>
                        <FormDescription>
                          Mostrar en posiciones destacadas
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activa"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Rifa Activa</FormLabel>
                        <FormDescription>
                          La rifa estará disponible para compra
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="condiciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condiciones</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Condiciones para participar en la rifa..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Duplicando...
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar Rifa
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

