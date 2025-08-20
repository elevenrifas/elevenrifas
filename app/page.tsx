
import { Hero } from "@/components/Hero";
import { RifaClientSection } from "@/components/RifaClientSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import { obtenerRifasActivas } from "@/lib/database";
import WithRifasLayout from "@/app/with-rifas-layout";

export default async function Home() {
  // Obtener rifas activas desde la base de datos
  const rifas = await obtenerRifasActivas();
  
  // Debug: Verificar que las rifas tengan IDs únicos
  // console.debug('🔍 Rifas obtenidas:', rifas);
  // console.debug('🔍 IDs de rifas:', rifas.map(r => r.id));
  // console.debug('🔍 IDs únicos:', [...new Set(rifas.map(r => r.id))]);
  // console.debug('🔍 Hay duplicados:', rifas.length !== [...new Set(rifas.map(r => r.id))].length);

  return (
    <WithRifasLayout rifas={rifas}>
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
    </WithRifasLayout>
  );
}
