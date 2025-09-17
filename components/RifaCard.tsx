"use client";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVE } from "@/lib/formatters";
import type { Rifa } from "@/types";
import { getRifaFull } from "@/lib/database/rifas";
import { convertCurrency, getRifaExchangeRate, formatCurrencyUSD } from "@/lib/utils/currency-converter";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRifas } from "@/lib/context/RifasContext";
import { Car, Clock, Zap, Building, DollarSign, CreditCard } from "lucide-react";

type Props = {
  rifa: Rifa;
};

// Función para obtener el icono de la categoría
function getCategoryIcon(iconName: string) {
  const iconMap: Record<string, React.ReactNode> = {
    'car': <Car className="w-6 h-6 text-primary" />,
    'building': <Building className="w-6 h-6 text-primary" />,
    'dollar-sign': <DollarSign className="w-6 h-6 text-primary" />,
    'zap': <Zap className="w-6 h-6 text-primary" />,
    'credit-card': <CreditCard className="w-6 h-6 text-primary" />,
    'smartphone': <Building className="w-6 h-6 text-primary" />,
    'home': <Building className="w-6 h-6 text-primary" />,
    'gamepad2': <Zap className="w-6 h-6 text-primary" />,
    'shirt': <Building className="w-6 h-6 text-primary" />,
    'bicycle': <Car className="w-6 h-6 text-primary" />,
    'coffee': <Building className="w-6 h-6 text-primary" />,
    'book-open': <Building className="w-6 h-6 text-primary" />,
    'plane': <Zap className="w-6 h-6 text-primary" />,
    'heart': <Zap className="w-6 h-6 text-primary" />
  };
  
  return iconMap[iconName] || <Car className="w-6 h-6 text-primary" />;
}

export function RifaCard({ rifa }: Props) {
  const router = useRouter();
  const { setRifaActiva } = useRifas();
  const [stats, setStats] = useState<{ progreso: number; disponibles: number } | null>(null);

  // Cargar progreso via RPC si está disponible
  useEffect(() => {
    let mounted = true;
    getRifaFull(rifa.id)
      .then((data: any) => {
        if (!mounted || !data) return;
        setStats({ progreso: data.progreso, disponibles: data.disponibles });
      })
      .catch(() => {})
    return () => { mounted = false };
  }, [rifa.id]);

  // Función para calcular el progreso de la rifa (prioriza progreso_manual si es > 0)
  const calcularProgresoRifa = () => {
    // PRIORIDAD 1: Si hay progreso_manual > 0, úsalo (permite override manual)
    if (rifa.progreso_manual && rifa.progreso_manual > 0) {
      return Math.min(Math.max(rifa.progreso_manual, 0), 100);
    }
    
    // PRIORIDAD 2: Si viene desde el server (getRifasFull), úsalo
    // @ts-ignore: algunas builds agregan estos campos por RPC
    if ((rifa as any).progreso !== undefined) {
      const p = (rifa as any).progreso as number;
      return Math.min(Math.max(p, 0), 100);
    }
    
    // PRIORIDAD 3: Si se cargó por RPC cliente, úsalo
    if (stats) return Math.min(Math.max(stats.progreso, 0), 100);
    
    // FALLBACK: Si no hay ningún progreso, retorna 0
    return 0;
  };

  // Obtener tasa de cambio individual de la rifa o usar fallback
  const exchangeRate = getRifaExchangeRate(rifa.tasa);
  
  // Calcular precio en Bs usando tasa individual
  const precioBs = convertCurrency(rifa.precio_ticket, 'USD', 'VES', exchangeRate);

  const handleComprar = () => {
    setRifaActiva(rifa);
    router.push('/comprar');
  };

  return (
    <div className="group relative">
      <Card className="card-modern hover-lift overflow-hidden border-0 bg-gradient-to-br from-white to-secondary/30">
        {/* Imagen con overlay */}
        {rifa.imagen_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image 
              src={rifa.imagen_url} 
              alt={rifa.titulo} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            {/* Overlay con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            
            {/* Badge de precio */}
            <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              {formatCurrencyUSD(rifa.precio_ticket)}
            </div>
            
            {/* Badge de estado */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              {rifa.estado === 'activa' ? 'Activa' : rifa.estado}
            </div>
          </div>
        )}
        
        <CardContent className="space-y-4 px-4 py-4">
          {/* Título */}
          <CardTitle className="text-2xl font-bold text-foreground leading-tight">
            {rifa.titulo}
          </CardTitle>
          
          {/* Características justo debajo del título */}
          <div className="flex items-center justify-between text-base w-full">
            <div className="flex items-center gap-2 text-muted-foreground">
              {rifa.categorias_rifas ? (
                <>
                  {getCategoryIcon(rifa.categorias_rifas.icono)}
                  <span className="capitalize font-medium">{rifa.categorias_rifas.nombre}</span>
                </>
              ) : (
                <>
                  <Car className="w-6 h-6 text-primary" />
                  <span className="capitalize">Vehiculo</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-6 h-6 text-primary" />
              <span>{rifa.fecha_cierre ? new Date(rifa.fecha_cierre).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Próximamente'}</span>
            </div>
          </div>
          
          {/* Barra de progreso de la rifa */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-base">
              <span className="text-muted-foreground">Progreso de la rifa</span>
              <span className="font-semibold text-amber-500">{calcularProgresoRifa()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary via-amber-500 to-red-500 h-3 rounded-full relative" 
                style={{
                  width: `${calcularProgresoRifa()}%`
                }}
              >
                {/* Efecto de movimiento continuo solo sobre la parte llena */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-progress-shine" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
          
          {/* Información de precios sutil */}
          <div className="flex flex-col space-y-2 text-sm text-muted-foreground border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatCurrencyUSD(rifa.precio_ticket)}</span>
              <span className="text-xs">USD</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatCurrencyVE(precioBs)}</span>
              <span className="text-xs">Bs</span>
            </div>
          </div>
          
          {/* Descripción */}
          <p className="text-base text-muted-foreground leading-relaxed">
            {rifa.descripcion}
          </p>
          
          {/* Botón de acción mejorado */}
          <Button 
            onClick={handleComprar}
            className="group relative w-full px-12 py-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden bg-gradient-to-r from-primary via-red-500 to-amber-500 bg-[length:200%_100%] animate-gradient-move"
          >
            {/* Contenido del botón */}
            <div className="relative flex items-center justify-center gap-3 text-white">
              <span className="text-2xl animate-cart-slide">🛒</span>
              <span className="text-xl tracking-wide">COMPRAR AHORA</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


