"use client";
import { RifaCard } from "@/components/RifaCard";
import type { Rifa } from "@/types";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type Props = {
  rifas: Rifa[];
};

export function RifaClientSection({ rifas }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const rifasPerPage = 2;
  
  // Filtrar solo rifas activas y pausadas (las pausadas se muestran como activas)
  const rifasDisponibles = rifas.filter(rifa => 
    rifa.estado === 'activa' || rifa.estado === 'pausada'
  );
  
  // Debug: Verificar filtrado
  // console.debug('🔍 RifaClientSection - Rifas recibidas:', rifas.length);
  // console.debug('🔍 RifaClientSection - Estados recibidos:', rifas.map(r => ({ titulo: r.titulo, estado: r.estado })));
  // console.debug('🔍 RifaClientSection - Rifas disponibles después del filtro:', rifasDisponibles.length);
  // console.debug('🔍 RifaClientSection - Estados disponibles:', rifasDisponibles.map(r => ({ titulo: r.titulo, estado: r.estado })));
  
  const totalPages = Math.ceil(rifasDisponibles.length / rifasPerPage);
  
  // Obtener las rifas de la página actual
  const startIndex = (currentPage - 1) * rifasPerPage;
  const endIndex = startIndex + rifasPerPage;
  const currentRifas = rifasDisponibles.slice(startIndex, endIndex);
  

  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <section id="rifas" className="relative py-8 overflow-hidden bg-slate-200">
      
      {/* Elementos decorativos */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Header de la sección */}
        <div className="text-center mb-16">
          {/* Badge de destacado - Ajustado para mejor visibilidad */}
          <div className="inline-flex items-center gap-2 bg-amber-500/90 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
            <Trophy className="w-4 h-4 text-amber-100" />
            <span>Premios Increíbles</span>
          </div>
          
          {/* Título principal - Ajustado para fondo claro */}
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-black mb-6">
            Rifas <span className="text-[#fb0413]">Disponibles</span>
          </h2>
          
          {/* Subtítulo mejorado - Ajustado para fondo claro */}
          <p className="text-xl lg:text-2xl text-black max-w-4xl mx-auto mb-8 leading-relaxed text-justify">
            Aquí tienes nuestras rifas disponibles. Haz clic en cualquiera para participar.
          </p>
        </div>

        {/* Grid de rifas paginado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {currentRifas
            .filter((rifa, index, array) => {
              // Filtrar duplicados por ID
              const firstIndex = array.findIndex(r => r.id === rifa.id);
              return firstIndex === index;
            })
            .map((rifa, index) => (
              <RifaCard 
                key={`${rifa.id}-${index}-${currentPage}`} 
                rifa={rifa} 
                showAsActive={rifa.estado === 'pausada'} // Las pausadas se muestran como activas
              />
            ))}
        </div>

        {/* Paginador - Siempre visible */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Botón Anterior */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-amber-500 text-white hover:bg-amber-600 hover:text-white border border-amber-600 hover:border-amber-700 hover:scale-105 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          
          {/* Indicador de página */}
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-amber-500/80 backdrop-blur-sm text-white rounded-md font-medium text-sm border border-amber-400/30">
              {currentPage} de {totalPages}
            </div>
          </div>
          
          {/* Botón Siguiente */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-amber-500 text-white hover:bg-amber-600 hover:text-white border border-amber-600 hover:border-amber-700 hover:scale-105 shadow-sm'
            }`}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Información adicional */}
        <div className="text-center text-sm text-muted-foreground mb-8">
          Mostrando {startIndex + 1}-{Math.min(endIndex, rifasDisponibles.length)} de {rifasDisponibles.length} rifas disponibles
        </div>
        
        {/* Pill de Telegram integrada */}
        <div className="text-center">
          <a 
            href="https://t.me/GANACONE11EVEN" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative inline-block"
          >
            {/* Efecto de pulso sutil */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
            
            {/* Pill principal */}
            <div className="relative bg-blue-500 text-white px-12 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:bg-blue-600 group-hover:scale-105 group-active:scale-95">
              <div className="flex items-center gap-3">
                {/* Icono de Telegram */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span>Únete a nuestro canal</span>
              </div>
              
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}


