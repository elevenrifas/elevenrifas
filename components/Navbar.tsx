"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar({ 
  showBackButton = false, 
  onBack, 
  showProgress = false, 
  progress = 0 
}: { 
  showBackButton?: boolean; 
  onBack?: () => void;
  showProgress?: boolean;
  progress?: number;
}) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // No renderizar nada hasta que la hidratación esté completa
  if (!isHydrated) {
    return (
      <header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="w-32"></div>
          <div className="flex-1 flex justify-end">
            <Link href="/" className="flex items-center justify-center group">
              <Image 
                src="/logoblancorojo.png" 
                alt="Eleven Rifas Logo" 
                width={300} 
                height={90} 
                className="h-16 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Botón de volver (izquierda) */}
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-base font-semibold text-white bg-white/10 hover:bg-white/20 transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
        )}
        
        {/* Espacio vacío para balancear cuando no hay botón de volver */}
        {!showBackButton && <div className="w-32"></div>}
        
        {/* Logo a la derecha */}
        <div className="flex-1 flex justify-end">
          <Link href="/" className="flex items-center justify-center group">
            <Image 
              src="/logoblancorojo.png" 
              alt="Eleven Rifas Logo" 
              width={300} 
              height={90} 
              className="h-16 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
      </div>
      
      {/* Barra de progreso minimalista como parte del borde */}
      {showProgress && (
        <div className="w-full border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300/70">Progreso de ventas</span>
              <span className="font-medium text-amber-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800/30 rounded-full h-1 mt-1 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-red-400 h-1 rounded-full transition-all duration-700 ease-out relative" 
                style={{ width: `${progress}%` }}
              >
                {/* Efecto de brillo hacia adelante */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-progress-shine" 
                  style={{width: '100%'}}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


