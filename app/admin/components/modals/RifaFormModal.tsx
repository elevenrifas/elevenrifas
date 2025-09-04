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
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, Edit, Plus } from "lucide-react"
import * as LucideIcons from "lucide-react"
import type { AdminRifa } from "@/lib/database/admin_database/rifas"
import type { CrudRifaData } from "@/hooks/use-crud-rifas"
import { ImageUpload } from '../ui/image-upload'
import { useCategorias } from '@/hooks/use-categorias'
import { showCreateSuccessToast, showUpdateSuccessToast, showCreateErrorToast, showUpdateErrorToast } from "@/components/ui/toast-notifications"

// Función simple para obtener iconos de Lucide React (igual que en la tabla)
const getCategoryIcon = (iconName: string) => {
  // Convertir el nombre del icono a PascalCase (ej: "dollar-sign" -> "DollarSign")
  const pascalCaseName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  // Buscar el icono en la librería completa de Lucide
  const IconComponent = (LucideIcons as any)[pascalCaseName];
  
  // Si no se encuentra, devolver Tag como fallback
  return IconComponent || LucideIcons.Tag;
};

// Schema de validación actualizado según la estructura real de la BD
const rifaFormSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres").max(255, "El título no puede exceder 255 caracteres"),
  descripcion: z.string().optional(),
  precio_ticket: z.number().min(0.01, "El precio del ticket debe ser mayor a 0"),
  imagen_url: z.string().optional(),
  estado: z.enum(["activa", "cerrada"]),
  total_tickets: z.number().min(1, "Debe haber al menos 1 ticket"),
  tickets_disponibles: z.number().optional(), // Opcional ya que es un campo calculado
  categoria_id: z.string().optional(),
  numero_tickets_comprar: z.array(z.number()).optional(),
  progreso_manual: z.number().min(0).max(100).optional().nullable(),
  fecha_cierre: z.string().optional().nullable(), // Se establece automáticamente según el estado
})

type RifaFormValues = z.infer<typeof rifaFormSchema>

interface RifaFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CrudRifaData) => Promise<{ success: boolean; error?: string }>
  rifa?: AdminRifa | null
  isSubmitting?: boolean
}

// Componente personalizado para los 9 inputs de opciones de compra
const TicketOptionsInput = ({ value, onChange }: { value: number[] | undefined, onChange: (value: number[]) => void }) => {
  const handleInputChange = (index: number, newValue: number) => {
    const currentArray = [...(value || [1, 2, 3, 5, 10, 15, 20, 25, 50])];
    
    // Validar que el valor no esté duplicado en otras posiciones
    if (newValue > 0) {
      // Verificar si el valor ya existe en otra posición
      const isDuplicate = currentArray.some((val, i) => i !== index && val === newValue);
      
      if (isDuplicate) {
        // Si es duplicado, limpiar la posición actual
        currentArray[index] = 0;
      } else {
        // Si no es duplicado, asignar el valor
        currentArray[index] = newValue;
      }
    } else {
      currentArray[index] = 0;
    }
    
    // NO ordenar automáticamente - solo filtrar duplicados y valores 0
    const filteredArray = [...new Set(currentArray)]
      .filter(val => val > 0);
    
    onChange(filteredArray);
  };

  const handleInputBlur = () => {
    // Al perder el foco, NO ordenar - solo limpiar duplicados y valores 0
    const currentArray = value || [1, 2, 3, 5, 10, 15, 20, 25, 50];
    const cleanArray = [...new Set(currentArray)]
      .filter(val => val > 0);
    
    if (JSON.stringify(cleanArray) !== JSON.stringify(currentArray)) {
      onChange(cleanArray);
    }
  };

  const resetToDefaults = () => {
    onChange([1, 2, 3, 5, 10, 15, 20, 25, 50]);
  };

  // Obtener el valor actual para cada input
  const getCurrentValue = (index: number) => {
    const currentArray = value || [1, 2, 3, 5, 10, 15, 20, 25, 50];
    return currentArray[index] || '';
  };

  // Verificar si un valor está duplicado
  const isValueDuplicate = (index: number, inputValue: number) => {
    if (inputValue === 0) return false;
    const currentArray = (value || [1, 2, 3, 5, 10, 15, 20, 25, 50]) as number[];
    return currentArray.some((val: number, i: number) => i !== index && val === inputValue);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
          const currentValue = getCurrentValue(index);
          const isDuplicate = isValueDuplicate(index, currentValue as number);
          
          return (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium text-gray-700 text-center block">
                Opción {index + 1}
              </label>
              <Input
                type="number"
                min="1"
                placeholder="0"
                className={`text-center h-11 border-2 transition-all duration-200 ${
                  isDuplicate 
                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
                value={currentValue}
                onChange={(e) => handleInputChange(index, parseInt(e.target.value) || 0)}
                onBlur={handleInputBlur}
              />
              {isDuplicate && (
                <p className="text-xs text-red-500 text-center">
                  Número duplicado
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Indicador y controles */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {value?.length || 0} opciones configuradas
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="text-xs hover:scale-105 transition-all duration-200"
        >
          Restaurar valores por defecto
        </Button>
      </div>
    </div>
  );
};

export function RifaFormModal({
  isOpen,
  onClose,
  onSubmit,
  rifa,
  isSubmitting = false
}: RifaFormModalProps) {
  const isEditing = !!rifa
  const { categorias, loading: categoriasLoading } = useCategorias()

  // Formulario con react-hook-form
  const form = useForm<RifaFormValues>({
    resolver: zodResolver(rifaFormSchema),
    defaultValues: {
      titulo: rifa?.titulo || "",
      descripcion: rifa?.descripcion || "",
      precio_ticket: rifa?.precio_ticket || 0,
      imagen_url: rifa?.imagen_url || "",
      estado: (rifa?.estado as "activa" | "cerrada") || "activa",
      total_tickets: rifa?.total_tickets || 100,
      tickets_disponibles: rifa?.tickets_disponibles || 100,
      categoria_id: rifa?.categoria_id || "none",
      numero_tickets_comprar: rifa?.numero_tickets_comprar || [1, 2, 3, 5, 10, 15, 20, 25, 50],
      progreso_manual: rifa?.progreso_manual || null,
      fecha_cierre: rifa?.fecha_cierre || "",
    },
  })

  // Resetear formulario cuando cambie la rifa
  React.useEffect(() => {
    if (rifa) {
      form.reset({
        titulo: rifa?.titulo || "",
        descripcion: rifa?.descripcion || "",
        precio_ticket: rifa?.precio_ticket || 0,
        imagen_url: rifa?.imagen_url || "",
        estado: (rifa?.estado as "activa" | "cerrada") || "activa",
        total_tickets: rifa?.total_tickets || 100,
        tickets_disponibles: rifa?.tickets_disponibles || 100,
        categoria_id: rifa?.categoria_id || "none",
        numero_tickets_comprar: rifa?.numero_tickets_comprar || [1, 2, 3, 5, 10, 15, 20, 25, 50],
        progreso_manual: rifa?.progreso_manual || null,
        fecha_cierre: rifa?.fecha_cierre || "",
      })
    } else {
      form.reset({
        titulo: "",
        descripcion: "",
        precio_ticket: 0,
        imagen_url: "",
        estado: "activa",
        total_tickets: 100,
        tickets_disponibles: 100,
        categoria_id: "none",
        numero_tickets_comprar: [1, 2, 3, 5, 10, 15, 20, 25, 50],
        progreso_manual: null,
        fecha_cierre: "",
      })
    }
  }, [rifa, form])

  const handleSubmit = async (data: RifaFormValues) => {
    try {
      // Ordenar opciones de compra solo antes de enviar
      let numeroTicketsComprar = data.numero_tickets_comprar;
      if (numeroTicketsComprar && Array.isArray(numeroTicketsComprar)) {
        numeroTicketsComprar = [...new Set(numeroTicketsComprar)]
          .filter(val => val > 0)
          .sort((a, b) => a - b);
      }
      
      // Limpiar datos antes de enviar
      const datosLimpios = {
        ...data,
        numero_tickets_comprar: numeroTicketsComprar,
        categoria_id: data.categoria_id === "none" ? null : data.categoria_id,
        fecha_cierre: data.fecha_cierre === "" ? null : data.fecha_cierre
      };
      
      const result = await onSubmit(datosLimpios)
      if (result.success) {
        // Mostrar toast de éxito y cerrar modal
        if (isEditing) {
          showUpdateSuccessToast('rifa')
        } else {
          showCreateSuccessToast('rifa')
        }
        onClose()
        form.reset()
      } else {
        // Mostrar toast de error
        if (isEditing) {
          showUpdateErrorToast('rifa', result.error)
        } else {
          showCreateErrorToast('rifa', result.error)
        }
      }
      return result
    } catch (error) {
      const errorMessage = 'Error inesperado al procesar el formulario'
      if (isEditing) {
        showUpdateErrorToast('rifa', errorMessage)
      } else {
        showCreateErrorToast('rifa', errorMessage)
      }
      return { success: false, error: errorMessage }
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Solo permitir cerrar si NO se está enviando
        if (!isSubmitting) {
          onClose()
        }
      }}
    >
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        // Prevenir cierre con ESC durante envío
        onEscapeKeyDown={(e) => {
          if (isSubmitting) {
            e.preventDefault()
          }
        }}
        // Prevenir cierre con click fuera durante envío
        onPointerDownOutside={(e) => {
          if (isSubmitting) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
                            {isEditing ? (
                  <>
                    <Edit className="h-5 w-5" />
                    {isSubmitting ? 'Actualizando Rifa...' : 'Editar Rifa'}
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    {isSubmitting ? 'Creando Rifa...' : 'Crear Nueva Rifa'}
                  </>
                )}
          </DialogTitle>
                      <DialogDescription>
              {isSubmitting ? (
                <span className="text-amber-600 font-medium">
                  ⏳ Procesando... Por favor espera, no cierres este modal
                </span>
              ) : (
                isEditing 
                  ? "Modifica los datos de la rifa seleccionada"
                  : "Completa la información para crear una nueva rifa"
              )}
            </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Información Básica - Título y Descripción */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-900">Título *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Toyota 4Runner TRD Pro 2024"
                          className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-900">Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada de la rifa..."
                          className="min-h-[100px] border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Estado y Categoría */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-900">Estado *</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                            <SelectValue placeholder="Seleccionar estado">
                              {field.value && (
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${field.value === 'activa' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  <span className="capitalize">{field.value}</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="activa">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Activa</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="cerrada">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>Cerrada</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-900">Categoría</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => {
                          // Convertir "none" a null para la base de datos
                          const categoriaValue = value === "none" ? null : value;
                          field.onChange(categoriaValue);
                        }} defaultValue={field.value || "none"}>
                          <SelectTrigger className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin categoría</SelectItem>
                            {categoriasLoading ? (
                              <SelectItem value="loading" disabled>
                                Cargando categorías...
                              </SelectItem>
                            ) : (
                              categorias.map((categoria) => {
                                const IconComponent = getCategoryIcon(categoria.icono);
                                return (
                                  <SelectItem key={categoria.id} value={categoria.id}>
                                    <div className="flex items-center gap-2">
                                      <IconComponent className="h-4 w-4 text-red-600" />
                                      <span>{categoria.nombre}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Fecha de Cierre - Campo independiente debajo del grid */}
              <FormField
                control={form.control}
                name="fecha_cierre"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-gray-900">Fecha de Cierre</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="datetime-local"
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              // Convertir la fecha local a ISO string
                              const date = new Date(value);
                              field.onChange(date.toISOString());
                            } else {
                              field.onChange(null);
                            }
                          }}
                          disabled={isSubmitting}
                          className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-base"
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(null)}
                            disabled={isSubmitting}
                            className="h-11 px-3"
                          >
                            Limpiar
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    
                    {/* Indicador visual de fecha establecida */}
                    {field.value && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Fecha de cierre establecida:</span>
                          <span>{new Date(field.value).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                    )}
                    
                    <FormDescription className="text-sm text-gray-600">
                      Fecha y hora cuando se cerrará la rifa. Deja vacío si no quieres establecer una fecha específica.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Imagen de la Rifa */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="imagen_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-gray-900">Imagen</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        rifaId={rifa?.id || 'new'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Configuración de Tickets */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="precio_ticket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-900">Precio por Ticket *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-base pl-8"
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
                      <FormLabel className="text-base font-semibold text-gray-900">Total de Tickets *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="100"
                          className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-base"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Progreso Manual */}
              <FormField
                control={form.control}
                name="progreso_manual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-gray-900">Progreso Manual</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">0%</span>
                          <span className="text-sm font-medium text-gray-900">
                            {field.value || 0}%
                          </span>
                          <span className="text-sm text-gray-600">100%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={field.value || 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm text-gray-600">
                      {field.value === 0 || field.value === null 
                        ? "En 0% significa que no se utilizará progreso manual. El progreso se calculará automáticamente."
                        : "Ajusta el progreso manual de la rifa. 0% = automático, 100% = completado."
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Configuración Adicional */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="numero_tickets_comprar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-gray-900">Cantidades de Tickets Disponibles</FormLabel>
                    <FormControl>
                      <TicketOptionsInput
                        value={field.value || [1, 2, 3, 5, 10, 15, 20, 25, 50]}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-gray-600">
                      Configura las cantidades de tickets que los usuarios pueden comprar. Los números se ordenarán automáticamente al guardar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
                className="h-11 px-6 hover:scale-105 transition-all duration-200"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2 h-11 px-6 bg-red-600 hover:bg-red-700 hover:scale-105 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    {isEditing ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isEditing ? 'Actualizar Rifa' : 'Crear Rifa'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      
      {/* Estilos personalizados para el slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }
        
        .slider::-ms-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-webkit-slider-track {
          background: #e5e7eb;
          border-radius: 8px;
          height: 8px;
        }
        
        .slider::-moz-range-track {
          background: #e5e7eb;
          border-radius: 8px;
          height: 8px;
        }
        
        .slider::-ms-track {
          background: #e5e7eb;
          border-radius: 8px;
          height: 8px;
        }
      `}</style>
    </Dialog>
  )
}
