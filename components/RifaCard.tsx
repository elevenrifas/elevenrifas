import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVE } from "@/lib/formatters";
import type { Rifa } from "@/types";
import Link from "next/link";
import { Car, Clock, Zap } from "lucide-react";

type Props = {
  rifa: Rifa;
};

export function RifaCard({ rifa }: Props) {
  return (
    <div className="group relative">
      <Card className="card-modern hover-lift overflow-hidden border-0 bg-gradient-to-br from-white to-secondary/30">
        {/* Imagen con overlay */}
        {rifa.imagen && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image 
              src={rifa.imagen} 
              alt={rifa.titulo} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            {/* Overlay con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            
            {/* Badge de precio */}
            <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              {formatCurrencyVE(rifa.precioTicket)}
            </div>
            
            {/* Badge de estado */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              Activa
            </div>
          </div>
        )}
        
        <CardContent className="space-y-4 px-4 py-4">
          {/* Título */}
          <CardTitle className="text-2xl font-bold text-foreground leading-tight">
            {rifa.titulo}
          </CardTitle>
          
          {/* Características justo debajo del título */}
          <div className="flex items-center justify-between text-lg w-full">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Car className="w-6 h-6 text-primary" />
              <span>Vehículo</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-6 h-6 text-primary" />
              <span>15 Dic 2024</span>
            </div>
          </div>
          
          {/* Barra de progreso de la rifa */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-base">
              <span className="text-muted-foreground">Progreso de la rifa</span>
              <span className="font-semibold text-yellow-500">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-yellow-500 to-red-500 h-3 rounded-full relative" style={{width: '75%'}}>
                {/* Efecto de movimiento continuo solo sobre la parte llena */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-progress-shine" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
          
          {/* Descripción */}
          <p className="text-base text-muted-foreground leading-relaxed">
            {rifa.descripcion}
          </p>
          
          {/* Botón de acción mejorado */}
          <Button asChild className="group relative w-full px-12 py-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden bg-gradient-to-r from-primary via-red-500 to-pink-500 bg-[length:200%_100%] animate-gradient-move">
            <Link href={`/comprar?rifaId=${rifa.id}&titulo=${encodeURIComponent(rifa.titulo)}&descripcion=${encodeURIComponent(rifa.descripcion)}&precioTicket=${rifa.precioTicket}&imagen=${encodeURIComponent(rifa.imagen || '')}`}>
              {/* Contenido del botón */}
              <div className="relative flex items-center justify-center gap-3 text-white">
                <span className="text-2xl animate-cart-slide">🛒</span>
                <span className="text-xl tracking-wide">COMPRAR AHORA</span>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


