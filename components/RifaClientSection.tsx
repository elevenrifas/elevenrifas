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
  const totalPages = Math.ceil(rifas.length / rifasPerPage);
  
  // Obtener las rifas de la página actual
  const startIndex = (currentPage - 1) * rifasPerPage;
  const endIndex = startIndex + rifasPerPage;
  const currentRifas = rifas.slice(startIndex, endIndex);
  
  // Debug: Verificar que no hay duplicados
  console.log('🔍 Rifas totales:', rifas.length);
  console.log('🔍 Rifas actuales:', currentRifas.length);
  console.log('🔍 IDs de rifas actuales:', currentRifas.map(r => r.id));
  console.log('🔍 IDs únicos de rifas actuales:', [...new Set(currentRifas.map(r => r.id))]);
  console.log('🔍 Hay duplicados en currentRifas:', currentRifas.length !== [...new Set(currentRifas.map(r => r.id))].length);
  
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
    <section id="rifas" className="relative py-20 overflow-hidden">
      {/* Fondo azul claro para la segunda sección */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/40 to-indigo-50"></div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Header de la sección */}
        <div className="text-center mb-16">
          {/* Badge de destacado */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" />
            <span>Premios Increíbles</span>
          </div>
          
          {/* Título principal */}
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Rifas <span className="text-primary">Disponibles</span>
          </h2>
          
          {/* Subtítulo mejorado */}
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed text-justify">
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
              <RifaCard key={`${rifa.id}-${index}-${currentPage}`} rifa={rifa} />
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
                : 'bg-white text-primary hover:bg-gray-50 hover:text-primary/80 border border-primary/30 hover:border-primary/50 hover:scale-105 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          
          {/* Indicador de página */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Página</span>
            <div className="px-2 py-1 bg-white/80 backdrop-blur-sm text-primary rounded-md font-medium text-sm border border-primary/20">
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
                : 'bg-white text-primary hover:bg-gray-50 hover:text-primary/80 border border-primary/30 hover:border-primary/50 hover:scale-105 shadow-sm'
            }`}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Información adicional */}
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {startIndex + 1}-{Math.min(endIndex, rifas.length)} de {rifas.length} rifas disponibles
        </div>
      </div>
    </section>
  );
}


