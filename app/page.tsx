
import type { Rifa } from "@/types";
import { Hero } from "@/components/Hero";
import { RifaClientSection } from "@/components/RifaClientSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";

const rifas: Rifa[] = [
  {
    id: "toyota-4runner-2022",
    titulo: "Rifa: Toyota 4Runner 2022",
    descripcion: "Participa por un Toyota 4Runner 2022. SUV robusto y confiable para cualquier terreno.",
    precioTicket: 752,
    imagen: "/images/2022_Toyota_4Runner_TRD_Pro_Lime_Rush_001.jpeg",
    activa: true,
  },
  {
    id: "toyota-camry-2014",
    titulo: "Rifa: Toyota Camry 2014",
    descripcion: "Elegancia y confort en un sedán confiable. Perfecto para el día a día.",
    precioTicket: 5,
    imagen: "/images/camry.jpeg",
    activa: true,
  },
  {
    id: "ford-raptor-2023",
    titulo: "Rifa: Ford Raptor 2023",
    descripcion: "Potencia y aventura en su máxima expresión. Pickup de alto rendimiento.",
    precioTicket: 1200,
    imagen: "/images/2022_Toyota_4Runner_TRD_Pro_Lime_Rush_001.jpeg",
    activa: true,
  },
  {
    id: "bmw-x5-2022",
    titulo: "Rifa: BMW X5 2022",
    descripcion: "Lujo y tecnología alemana en un SUV premium de alta gama.",
    precioTicket: 2500,
    imagen: "/images/camry.jpeg",
    activa: true,
  },
  {
    id: "mercedes-c63-2023",
    titulo: "Rifa: Mercedes C63 AMG 2023",
    descripcion: "Deportividad y elegancia en un sedán de alto rendimiento.",
    precioTicket: 3500,
    imagen: "/images/2022_Toyota_4Runner_TRD_Pro_Lime_Rush_001.jpeg",
    activa: true,
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Página completa sin navbar */}
      <Hero />
      
      {/* Sección de rifas activas */}
      <RifaClientSection rifas={rifas} />
      
      {/* Sección de características - ¿Por qué Eleven Rifas? */}
      <FeaturesSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
