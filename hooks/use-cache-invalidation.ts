"use client"

import { useCallback } from 'react';

interface CacheInvalidationOptions {
  type: 'rifa_created' | 'rifa_updated' | 'rifa_deleted' | 'rifa_state_changed' | 'pago_verified' | 'pago_rejected' | 'full_revalidate';
  data?: any;
}

/**
 * Hook profesional para invalidación de caché en Vercel
 * Optimizado para el ecosistema Vercel + Next.js
 */
export function useCacheInvalidation() {
  const invalidateCache = useCallback(async (options: CacheInvalidationOptions) => {
    try {
      // Verificar si estamos en el cliente y si hay secret disponible
      if (typeof window === 'undefined') {
        console.log('⚠️ Cache invalidation skipped: Server-side execution');
        return { success: true, message: 'Skipped on server' };
      }

      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'dev-secret'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('⚠️ Cache invalidation failed:', errorData.error || 'Error invalidando caché');
        // No lanzar error para no interrumpir el flujo del usuario
        return { success: false, error: errorData.error || 'Error invalidando caché' };
      }

      const result = await response.json();
      console.log('✅ Caché invalidado exitosamente:', result);
      
      return result;
    } catch (error) {
      console.warn('⚠️ Error invalidando caché:', error);
      // No lanzar error para no interrumpir el flujo del usuario
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }, []);

  // Función específica para rifas
  const invalidateRifasCache = useCallback(async (type: 'created' | 'updated' | 'deleted' | 'state_changed', data?: any) => {
    return invalidateCache({ 
      type: `rifa_${type}` as any, 
      data 
    });
  }, [invalidateCache]);

  // Función específica para pagos
  const invalidatePagosCache = useCallback(async (type: 'verified' | 'rejected', data?: any) => {
    return invalidateCache({ 
      type: `pago_${type}` as any, 
      data 
    });
  }, [invalidateCache]);

  // Función para invalidación completa
  const invalidateAllCache = useCallback(async () => {
    return invalidateCache({ 
      type: 'full_revalidate' 
    });
  }, [invalidateCache]);

  return {
    invalidateCache,
    invalidateRifasCache,
    invalidatePagosCache,
    invalidateAllCache
  };
}
