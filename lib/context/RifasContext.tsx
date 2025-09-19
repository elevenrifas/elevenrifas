"use client";

import { createContext, useContext, ReactNode } from 'react';
import type { Rifa } from '@/types';
import { useState } from 'react';

interface RifasContextType {
  rifas: Rifa[];
  rifaActiva: Rifa | null;
  setRifaActiva: (rifa: Rifa | null) => void;
  getRifaById: (id: string) => Rifa | undefined;
  loading: boolean;
  error: string | null;
}

const RifasContext = createContext<RifasContextType | undefined>(undefined);

interface RifasProviderProps {
  children: ReactNode;
  rifas: Rifa[];
}

export function RifasProvider({ children, rifas }: RifasProviderProps) {
  const [rifaActiva, setRifaActiva] = useState<Rifa | null>(() => {
    // Intentar recuperar rifa activa del localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rifaActiva');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          // Validar que los datos estén correctos
          if (parsed && typeof parsed === 'object' && parsed.id) {
            // Verificar que la rifa existe en la lista actual
            const rifaEncontrada = rifas.find(r => r.id === parsed.id);
            if (rifaEncontrada) {
              // Usar la rifa de la lista actual para asegurar datos correctos
              return rifaEncontrada;
            }
          }
          
          // Si los datos están corruptos, limpiar localStorage
          console.log('Datos de rifa corruptos en localStorage, limpiando...');
          localStorage.removeItem('rifaActiva');
        } catch (error) {
          console.log('Error al parsear rifa activa del localStorage:', error);
          localStorage.removeItem('rifaActiva');
        }
      }
    }
    return null;
  });

  const getRifaById = (id: string): Rifa | undefined => {
    return rifas.find(rifa => rifa.id === id);
  };

  // Función para establecer rifa activa con persistencia
  const setRifaActivaPersistente = (rifa: Rifa | null) => {
    setRifaActiva(rifa);
    if (typeof window !== 'undefined') {
      if (rifa) {
        localStorage.setItem('rifaActiva', JSON.stringify(rifa));
      } else {
        localStorage.removeItem('rifaActiva');
      }
    }
  };

  const value: RifasContextType = {
    rifas,
    rifaActiva,
    setRifaActiva: setRifaActivaPersistente,
    getRifaById,
    loading: false,
    error: null
  };

  return (
    <RifasContext.Provider value={value}>
      {children}
    </RifasContext.Provider>
  );
}

export function useRifas() {
  const context = useContext(RifasContext);
  if (context === undefined) {
    throw new Error('useRifas debe ser usado dentro de un RifasProvider');
  }
  return context;
}

// Hook específico para obtener opciones de tickets
export function useTicketNumbersFromContext(rifaId?: string) {
  const { getRifaById } = useRifas();
  
  if (!rifaId) {
    return {
      ticketNumbers: [],
      loading: false,
      error: 'ID de rifa no proporcionado'
    };
  }

  const rifa = getRifaById(rifaId);
  
  if (!rifa) {
    return {
      ticketNumbers: [],
      loading: false,
      error: 'Rifa no encontrada'
    };
  }

  if (!rifa.numero_tickets_comprar || !Array.isArray(rifa.numero_tickets_comprar)) {
    return {
      ticketNumbers: [],
      loading: false,
      error: 'No hay opciones de tickets configuradas para esta rifa'
    };
  }

  return {
    ticketNumbers: rifa.numero_tickets_comprar,
    loading: false,
    error: null
  };
}
