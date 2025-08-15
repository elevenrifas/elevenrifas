"use client";

import { useSearchParams } from "next/navigation";
import { TicketGenerado } from "@/components/TicketGenerado";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

function TicketContent() {
  const searchParams = useSearchParams();
  
  // Obtener datos del ticket desde los parámetros de URL
  const nombre = searchParams.get("nombre");
  const cedula = searchParams.get("cedula");
  const numeros = searchParams.get("numeros");
  const fecha = searchParams.get("fecha");
  const rifaId = searchParams.get("rifaId");
  const titulo = searchParams.get("titulo");

  // Si no hay datos del ticket, mostrar mensaje de error
  if (!nombre || !cedula || !numeros || !fecha || !rifaId || !titulo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h1 className="title-primary">Ticket no encontrado</h1>
          <p className="subtitle-primary">No se encontró la información del ticket. Por favor, genera uno nuevo.</p>
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Parsear los números del ticket
  const numerosTicket = numeros.split(",").map(num => parseInt(num.trim()));

  const ticketData = {
    numeros: numerosTicket,
    nombre,
    cedula,
    fecha,
    rifaId,
    titulo
  };

  return (
    <main className="mx-auto max-w-screen-md px-4 py-6 relative z-10">
      {/* Solo el botón de volver */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Solo el ticket, centrado */}
      <div className="flex justify-center">
        <TicketGenerado 
          numeros={ticketData.numeros}
          nombre={ticketData.nombre}
          cedula={ticketData.cedula}
          fecha={ticketData.fecha}
          rifaId={ticketData.rifaId}
          titulo={ticketData.titulo}
          isModal={false}
        />
      </div>
    </main>
  );
}

export default function TicketPage() {
  return (
    <div className="min-h-dvh relative">
      {/* Patrón de fondo que cubre toda la página con desvanecimiento gradual */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full opacity-[0.12]"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="texture-pattern" width="69.141" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse">
              <rect width="100%" height="100%" fill="#2b2b31" fillOpacity="0"/>
              <path fill="none" stroke="#fff" d="M69.212 40H46.118L34.57 20 46.118 0h23.094l11.547 20zM69.212 40H46.118L34.57 20 46.118 0h23.095l11.547 20zM57.665 60H34.57L23.023 40 34.57 20h23.095l11.547 20zM57.665 60H34.57L23.023 40 34.57 20h23.095l11.547 20zm0-40H34.57L23.023 0 34.57-20h23.095L69.212 0zM23.023 40H-.07l-11.547-20L-.07 0h23.094L34.57 20z"/>
            </pattern>
          </defs>
          <rect width="800%" height="800%" fill="url(#texture-pattern)"/>
        </svg>
        
        {/* Gradiente de desvanecimiento más pronunciado */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-transparent to-black/80"></div>
      </div>
      
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando ticket...</p>
          </div>
        </div>
      }>
        <TicketContent />
      </Suspense>
    </div>
  );
}
