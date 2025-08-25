"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Search, Grid3X3, Check } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"

// =====================================================
// 🎯 ICON PICKER - ELEVEN RIFAS
// =====================================================
// Selector visual de iconos de Lucide React
// Permite buscar y seleccionar iconos de manera intuitiva
// =====================================================

interface IconPickerProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// Lista de iconos populares y útiles para categorías
const POPULAR_ICONS = [
  'tag', 'car', 'home', 'gift', 'star', 'heart', 'dollar-sign', 'shopping-cart',
  'smartphone', 'laptop', 'camera', 'headphones', 'gamepad2', 'book-open',
  'palette', 'music', 'film', 'coffee', 'utensils', 'shirt', 'shoe',
  'carrot', 'leaf', 'tree', 'sun', 'moon', 'cloud', 'umbrella',
  'bicycle', 'motorcycle', 'truck', 'plane', 'ship', 'train',
  'building', 'store', 'bank', 'hospital', 'school', 'graduation-cap',
  'briefcase', 'wrench', 'hammer', 'screwdriver', 'paintbrush', 'scissors'
]

export function IconPicker({
  value = '',
  onValueChange,
  placeholder = "Seleccionar icono...",
  disabled = false,
  className
}: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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

  // Filtrar iconos basado en la búsqueda
  const filteredIcons = useMemo(() => {
    const allIcons = Object.keys(LucideIcons).filter(key => 
      typeof (LucideIcons as any)[key] === 'function' && 
      key !== 'createLucideIcon'
    )

    if (!searchQuery) {
      // Si no hay búsqueda, mostrar iconos populares primero
      const popularIcons = POPULAR_ICONS.filter(icon => {
        const pascalCaseName = icon
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('')
        return allIcons.includes(pascalCaseName)
      })
      
      const otherIcons = allIcons.filter(icon => 
        !popularIcons.some(popular => {
          const pascalCaseName = popular
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('')
          return icon === pascalCaseName
        })
      )
      
      return [...popularIcons, ...otherIcons.slice(0, 100)] // Limitar a 100 iconos adicionales
    }

    // Filtrar por búsqueda
    return allIcons
      .filter(icon => 
        icon.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 200) // Limitar resultados de búsqueda
  }, [searchQuery])

  // Función para obtener el icono de Lucide
  const getLucideIcon = (iconName: string) => {
    const pascalCaseName = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
    
    return (LucideIcons as any)[pascalCaseName] || null
  }

  // Función para convertir PascalCase a kebab-case
  const toKebabCase = (str: string) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
  }

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
            
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No se encontraron iconos.</CommandEmpty>
              
              {!searchQuery && (
                <CommandGroup heading="Iconos Populares">
                  <div className="grid grid-cols-8 gap-1 p-2">
                    {POPULAR_ICONS.slice(0, 24).map((iconName) => {
                      const IconComponent = getLucideIcon(iconName)
                      if (!IconComponent) return null
                      
                      const isSelected = value === iconName
                      
                      return (
                        <Button
                          key={iconName}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-12 w-12 p-0 flex items-center justify-center",
                            isSelected && "bg-primary text-primary-foreground"
                          )}
                          onClick={() => handleSelectIcon(iconName)}
                        >
                          <IconComponent className="h-5 w-5" />
                        </Button>
                      )
                    })}
                  </div>
                </CommandGroup>
              )}
              
              <CommandGroup heading={searchQuery ? "Resultados de búsqueda" : "Todos los iconos"}>
                <div className="grid grid-cols-8 gap-1 p-2">
                  {filteredIcons.map((iconName) => {
                    const IconComponent = getLucideIcon(iconName)
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
