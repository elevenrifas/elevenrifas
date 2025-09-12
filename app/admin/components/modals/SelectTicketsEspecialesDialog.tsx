"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Ticket, ArrowLeftRight, PlusCircle } from "lucide-react"
import { adminListSpecialTicketsByRifa } from "@/lib/database/admin_database/tickets"

interface SelectTicketsEspecialesDialogProps {
  isOpen: boolean
  onClose: () => void
  rifaId: string
  onConfirm: (params: { selectedIds: string[]; mode: 'agregar' | 'reemplazar' }) => void
}

export function SelectTicketsEspecialesDialog({ isOpen, onClose, rifaId, onConfirm }: SelectTicketsEspecialesDialogProps) {
  const [tickets, setTickets] = React.useState<Array<{ id: string; numero_ticket: string }>>([])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [mode, setMode] = React.useState<'agregar' | 'reemplazar'>('agregar')
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (isOpen && rifaId) {
      ;(async () => {
        setLoading(true)
        try {
          const result = await adminListSpecialTicketsByRifa(rifaId)
          if (result.success && result.data) {
            setTickets(result.data)
          }
        } finally {
          setLoading(false)
        }
      })()
      setSelected(new Set())
      setMode('agregar')
      setSearch('')
    }
  }, [isOpen, rifaId])

  const filtered = React.useMemo(() => {
    const term = search.trim()
    if (!term) return tickets
    return tickets.filter(t => t.numero_ticket.includes(term))
  }, [tickets, search])

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const confirm = () => {
    if (selected.size === 0) {
      alert('⚠️ Debes seleccionar al menos un ticket especial para continuar')
      return
    }
    onConfirm({ selectedIds: Array.from(selected), mode })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-purple-600" />
            Seleccionar Tickets Especiales
          </DialogTitle>
          <DialogDescription>
            Elige uno o varios tickets especiales disponibles para esta rifa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por número (ej. 0042)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-global"
            />
          </div>

          <div className="flex items-center gap-4">
            <label htmlFor="mode-replace" className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="mode-replace"
                type="checkbox"
                checked={mode === 'reemplazar'}
                onChange={(e) => setMode(e.target.checked ? 'reemplazar' : 'agregar')}
                className="h-4 w-4 rounded border border-gray-300 accent-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <span className="flex items-center gap-1 text-gray-800">
                <ArrowLeftRight className="h-4 w-4 text-gray-500" />
                Reemplazar en lugar de agregar
              </span>
            </label>
          </div>

          <div className="border rounded-md">
            <div className="h-64 overflow-auto p-2">
              {loading ? (
                <div className="text-sm text-muted-foreground">Cargando...</div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground">No hay tickets especiales disponibles</div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {filtered.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggle(t.id)}
                      className={`border rounded px-2 py-1 text-sm font-mono ${selected.has(t.id) ? 'bg-purple-100 border-purple-300' : 'bg-white'}`}
                    >
                      {t.numero_ticket}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selected.size === 0 && filtered.length > 0 && (
              <div className="p-3 bg-yellow-50 border-t border-yellow-200 text-center">
                <p className="text-sm text-yellow-700">
                  ⚠️ Debes seleccionar al menos un ticket especial para continuar
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={confirm} 
            disabled={selected.size === 0}
            className={selected.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {selected.size === 0 ? 'Selecciona al menos un ticket' : `Confirmar (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


