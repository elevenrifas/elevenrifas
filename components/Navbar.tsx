"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function Navbar({ showBackButton = false, onBack }: { showBackButton?: boolean; onBack?: () => void }) {
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
    </header>
  );
}


