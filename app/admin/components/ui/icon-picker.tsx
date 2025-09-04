"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Search, Grid3X3, Check } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"

interface IconPickerProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function IconPicker({
  value = '',
  onValueChange,
  placeholder = "Seleccionar icono...",
  disabled = false,
  className
}: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Función para convertir PascalCase a kebab-case
  const toKebabCase = (str: string) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
  }

  // Obtener el icono seleccionado actualmente
  const SelectedIcon = useMemo(() => {
    if (!value) return null
    
    // Convertir el nombre del icono a PascalCase
    const pascalCaseName = value
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
    
    return (LucideIcons as any)[pascalCaseName] || null
  }, [value])

  // Lista enfocada en casa, autos, dinero y motos (35 iconos en total)
  const specificIcons = [
    // 🚗 Vehículos y transporte (10 iconos)
    'Car', 'Truck', 'Bus', 'Bike', 'Ship', 'Plane', 'Train', 'CarFront', 'TruckIcon', 'BusIcon',
    
    // 💰 Dinero y finanzas (14 iconos)
    'DollarSign', 'Euro', 'PoundSterling', 'Banknote', 'Coins', 'CreditCard', 'Wallet', 
    'PiggyBank', 'Receipt', 'Calculator', 'TrendingUp', 'TrendingDown', 'BarChart', 'PieChart',
    
    // 🏠 Casa y hogar (11 iconos)
    'Home', 'Building', 'Store', 'Bed', 'Table', 'Lamp', 'Flower', 'Leaf', 'Sun', 'Moon', 'Cloud'
  ]

  // Obtener solo los iconos específicos que existen en Lucide
  const allIcons = useMemo(() => {
    return specificIcons.filter(iconName => {
      const icon = (LucideIcons as any)[iconName]
      return icon && typeof icon === 'object' && icon.$$typeof
    })
  }, [])

  // Filtrar iconos basado en la búsqueda
  const filteredIcons = useMemo(() => {
    if (!searchQuery) {
      return allIcons
    }

    return allIcons.filter(icon => {
      const pascalCaseName = icon.toLowerCase()
      const kebabCaseName = toKebabCase(icon).toLowerCase()
      const searchLower = searchQuery.toLowerCase()
      
      return pascalCaseName.includes(searchLower) || kebabCaseName.includes(searchLower)
    }).slice(0, 500)
  }, [allIcons, searchQuery])

  const handleSelectIcon = (iconName: string) => {
    const kebabCaseName = toKebabCase(iconName)
    onValueChange(kebabCaseName)
    setOpen(false)
    setSearchQuery("")
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Icono de la Categoría</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              {SelectedIcon ? (
                <>
                  <SelectedIcon className="h-4 w-4" />
                  <span className="font-medium">{value}</span>
                </>
              ) : (
                <>
                  <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{placeholder}</span>
                </>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Buscar iconos..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="border-0 focus:ring-0 px-0 py-0"
              />
            </div>
            
            <CommandList className="max-h-[400px] overflow-y-auto">
              <CommandEmpty>No se encontraron iconos.</CommandEmpty>
              
              <CommandGroup heading={searchQuery ? "Resultados de búsqueda" : "Iconos disponibles"}>
                <div className="grid grid-cols-8 gap-1 p-2">
                  {filteredIcons.map((iconName) => {
                    const IconComponent = (LucideIcons as any)[iconName]
                    if (!IconComponent) return null
                    
                    const kebabCaseName = toKebabCase(iconName)
                    const isSelected = value === kebabCaseName
                    
                    return (
                      <Button
                        key={iconName}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-12 w-12 p-0 flex items-center justify-center relative",
                          isSelected && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => handleSelectIcon(iconName)}
                      >
                        <IconComponent className="h-5 w-5" />
                        {isSelected && (
                          <Check className="absolute top-1 right-1 h-3 w-3" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {value && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Icono seleccionado:</span>
          <Badge variant="outline" className="font-mono">
            {value}
          </Badge>
        </div>
      )}
    </div>
  )
}
