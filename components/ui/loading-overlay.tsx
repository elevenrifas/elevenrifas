import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingOverlay - Componente reutilizable para mostrar loading con overlay
 * 
 * EJEMPLO DE USO:
 * 
 * // Opción 1: Uso directo del componente
 * const [loading, setLoading] = useState(false);
 * <LoadingOverlay isVisible={loading} message="Cargando..." submessage="Espere por favor" />
 * 
 * // Opción 2: Uso del hook (recomendado)
 * const { showLoading, hideLoading, updateMessage, LoadingComponent } = useLoadingOverlay();
 * 
 * const handleAction = async () => {
 *   showLoading("Procesando...", "Esto puede tomar unos segundos");
 *   try {
 *     updateMessage("Guardando datos...", "Casi listo");
 *     await someAsyncOperation();
 *     hideLoading();
 *   } catch (error) {
 *     hideLoading();
 *   }
 * };
 * 
 * return (
 *   <div>
 *     <button onClick={handleAction}>Ejecutar</button>
 *     <LoadingComponent />
 *   </div>
 * );
 */

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  submessage?: string;
}

export function LoadingOverlay({ isVisible, message = "Procesando...", submessage }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay semi-transparente */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Contenido del loading */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 max-w-sm mx-auto shadow-2xl">
        <div className="text-center space-y-4">
          {/* Spinner animado */}
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 text-[#fb0413] animate-spin" />
          </div>
          
          {/* Mensaje principal */}
          <div className="text-lg font-semibold text-gray-800">
            {message}
          </div>
          
          {/* Submensaje opcional */}
          {submessage && (
            <div className="text-sm text-gray-600">
              {submessage}
            </div>
          )}
          
          {/* Indicador de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-[#fb0413] via-red-500 to-amber-500 h-2 rounded-full animate-pulse bg-[length:200%_100%] animate-gradient-move"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook personalizado para manejar el loading
export function useLoadingOverlay() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState("Procesando...");
  const [submessage, setSubmessage] = React.useState<string | undefined>();

  const showLoading = React.useCallback((msg?: string, submsg?: string) => {
    if (msg) setMessage(msg);
    if (submsg !== undefined) setSubmessage(submsg);
    setIsLoading(true);
  }, []);

  const hideLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const updateMessage = React.useCallback((msg: string, submsg?: string) => {
    setMessage(msg);
    if (submsg !== undefined) setSubmessage(submsg);
  }, []);

  return {
    isLoading,
    message,
    submessage,
    showLoading,
    hideLoading,
    updateMessage,
    LoadingComponent: () => (
      <LoadingOverlay 
        isVisible={isLoading} 
        message={message} 
        submessage={submessage} 
      />
    )
  };
}
