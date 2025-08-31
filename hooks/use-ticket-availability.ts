import { useState, useEffect } from 'react';
import { getTicketAvailabilityStats } from '@/lib/database/utils/ticket-generator';

interface TicketAvailability {
  total: number;
  existing: number;
  available: number;
  percentage: number;
}

export function useTicketAvailability(rifaId: string, refreshInterval: number = 30000) {
  const [availability, setAvailability] = useState<TicketAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    try {
      setError(null);
      const stats = await getTicketAvailabilityStats(rifaId, 5, 99999);
      setAvailability(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener disponibilidad');
      console.error('Error fetching ticket availability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rifaId) return;

    // Fetch inicial
    fetchAvailability();

    // Configurar intervalo para actualizar automáticamente
    const interval = setInterval(fetchAvailability, refreshInterval);

    return () => clearInterval(interval);
  }, [rifaId, refreshInterval]);

  return {
    availability,
    loading,
    error,
    refetch: fetchAvailability
  };
}
