"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Check, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  showSearch?: boolean
  searchPlaceholder?: string
  multiple?: boolean
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  showSearch = true,
  searchPlaceholder = "Buscar...",
  multiple = true,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const rawFilterValue = column?.getFilterValue()
  const selectedValues = new Set<string>(
    multiple
      ? (Array.isArray(rawFilterValue) ? (rawFilterValue as string[]) : [])
      : rawFilterValue
        ? [String(rawFilterValue)]
        : []
  )

  // Dedupe options by value to prevent duplicated selections
  const uniqueOptions = React.useMemo(() => {
    const seen = new Set<string>()
    const result: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[] = []
    for (const opt of options) {
      if (!seen.has(opt.value)) {
        seen.add(opt.value)
        result.push(opt)
      }
    }
    return result
  }, [options])

  const handleSelect = (value: string) => {
    if (multiple) {
      if (selectedValues.has(value)) {
        selectedValues.delete(value)
      } else {
        selectedValues.add(value)
      }
      column?.setFilterValue(selectedValues.size ? Array.from(selectedValues) : undefined)
    } else {
      column?.setFilterValue(selectedValues.has(value) ? undefined : value)
    }
  }

  const handleClear = () => {
    column?.setFilterValue(undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size <= 3 ? (
                  uniqueOptions
                    .filter((option) => selectedValues.has(option.value))
                    .map((option, idx) => (
                      <Badge
                        variant="secondary"
                        key={`${option.value}-${idx}`}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                ) : (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} seleccionados
                  </Badge>
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          {showSearch && (
            <CommandInput placeholder={searchPlaceholder} />
          )}
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {uniqueOptions.map((option, idx) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={`${option.value}-${idx}`}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4", isSelected ? "text-white" : undefined)} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="justify-center text-center"
                  >
                    Limpiar filtros
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
