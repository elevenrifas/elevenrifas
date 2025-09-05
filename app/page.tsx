
import { Hero } from "@/components/Hero";
import { RifaClientSection } from "@/components/RifaClientSection";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getRifasFull } from "@/lib/database/rifas";
import WithRifasLayout from "@/app/with-rifas-layout";

export default async function Home() {
  // Obtener rifas con estadísticas calculadas desde la base de datos
  const rifas = await getRifasFull();
  
  // Debug: Verificar que las rifas tengan IDs únicos
  // console.debug('🔍 Rifas obtenidas:', rifas);
  // console.debug('🔍 IDs de rifas:', rifas.map(r => r.id));
  // console.debug('🔍 IDs únicos:', [...new Set(rifas.map(r => r.id))]);
  // console.debug('🔍 Hay duplicados:', rifas.length !== [...new Set(rifas.map(r => r.id))].length);

  return (
    <WithRifasLayout rifas={rifas}>
      <div className="min-h-screen relative">
        {/* Hero Section - Página completa sin navbar */}
        <Hero />
        
        {/* Sección de rifas activas */}
        <RifaClientSection rifas={rifas} />
        
        {/* Footer */}
        <Footer />
        
        {/* Botón de WhatsApp flotante */}
        <WhatsAppButton 
          phoneNumber="584241876325"
          message="Hola! estoy interesad@ en participar en la rifa 0km de Gana con E11even Me gustaría recibir más información para saber cómo puedo jugar y tener la oportunidad de ganar ¡Gracias!"
        />
      </div>
    </WithRifasLayout>
  );
}
