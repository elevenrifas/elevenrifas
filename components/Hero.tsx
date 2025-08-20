"use client";
import { Button } from "@/components/ui/button";
import { Star, Trophy, Sparkles, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const scrollToRifas = () => {
  const rifasSection = document.getElementById('rifas');
  if (rifasSection) {
    rifasSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Efecto de pulso para el texto "GANA GANA GANA!"
    const pulseInterval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 3);
    }, 800);
    
    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo blanco para el Hero - Primera sección */}
      <div className="absolute inset-0 bg-white"></div>
      
      {/* Elementos decorativos sutiles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-20 left-10 w-32 h-32 bg-[#fb0413]/5 rounded-full blur-3xl transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
        <div className={`absolute top-40 right-20 w-24 h-24 bg-[#fb0413]/3 rounded-full blur-2xl transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12">
        <div className="text-center space-y-0">
          {/* Badge personalizado "Rifas Premium" */}
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-[#fb0413] to-[#fb0413]/80 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Star className="w-5 h-5 text-yellow-300" />
            <span>RIFAS PREMIUM</span>
          </div>

          {/* Logo principal - E_LOGO.png como protagonista */}
          <div className={`flex justify-center transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo principal sin decoraciones */}
            <div className="relative w-80 h-64 lg:w-96 lg:h-80 overflow-hidden">
              <Image
                src="/E_LOGO.png"
                alt="Eleven Rifas Logo"
                fill
                priority
                sizes="(max-width: 1024px) 320px, 384px"
                className="object-contain object-top drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Subtítulo - MÁS PEGADO AL LOGO */}
          <p className={`subtitle-hero max-w-2xl mx-auto transition-all duration-1000 delay-400 -mt-20 text-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            ¡Tu boleto puede cambiar tu vida hoy!
          </p>
        </div>

        {/* Recuadro rojo curvo MUCHO MÁS ALTO que se extiende más allá del viewport */}
        <div className={`relative mt-8 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Recuadro principal rojo - MUCHO MÁS ALTO */}
          <div className="relative bg-[#fb0413] rounded-3xl p-6 lg:p-8 shadow-2xl min-h-[600px] lg:min-h-[800px] flex flex-col items-center justify-start">
            {/* Contenido dentro del recuadro rojo - MÁS PEGADO AL TOPE */}
            <div className="text-center text-white space-y-6 mt-8 lg:mt-12">
              {/* Texto animado "¿LISTO PARA GANAR?" */}
              <div className="my-6">
                <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4 text-4xl lg:text-6xl font-black text-yellow-100">
                  {['¿LISTO', 'PARA', 'GANAR?'].map((word, index) => (
                    <span
                      key={index}
                      className={`inline-block transition-all duration-300 ${
                        pulseIndex === index 
                          ? 'scale-125 text-yellow-300 drop-shadow-lg' 
                          : 'scale-100'
                      }`}
                      style={{
                        animation: pulseIndex === index ? 'bounce 0.6s ease-in-out' : 'none'
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-xl lg:text-2xl text-white font-medium max-w-4xl mx-auto leading-relaxed px-2 text-justify">
                  En solo <span className="font-bold text-yellow-300">4 pasos</span> simples gana premios increíbles: carros, lanchas, apartamentos y más. <span className="font-bold text-yellow-300">¡Tu oportunidad está aquí!</span>
                </div>
              </div>
              
              {/* Botones CTA dentro del recuadro */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20">
                {/* Botón principal con efectos mejorados */}
                <Button 
                  onClick={scrollToRifas}
                  className="group relative bg-white text-[#fb0413] hover:bg-white/90 px-12 py-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  {/* Efecto de brillo que se mueve */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Contenido del botón */}
                  <div className="relative flex items-center gap-2">
                    <Trophy className="w-5 h-5 animate-pulse" />
                    <span>¡Participa Ahora!</span>
                    <Sparkles className="w-5 h-5 animate-bounce" />
                  </div>
                </Button>
                
                {/* Botón secundario transparente con líneas */}
                <Link href="/mis-rifas">
                  <Button 
                    variant="outline"
                    className="group bg-transparent border-2 border-white text-white hover:bg-white/10 px-12 py-6 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm relative overflow-hidden z-10"
                  >
                    {/* Efecto de borde brillante */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-[2px] rounded-2xl bg-[#fb0413]"></div>
                    
                    {/* Contenido del botón */}
                    <div className="relative flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      <span>Ver mis rifas</span>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Imagen del coche regalo - MOVIDA A LA IZQUIERDA Y 7% MÁS GRANDE */}
            <div className="relative w-full max-w-5xl mx-auto mt-4 lg:mt-6 flex-1 flex items-center justify-center">
              <div className="relative w-full h-[400px] lg:h-[500px] max-w-2xl -ml-5 -mr-16 lg:-mr-32">
                <Image
                  src="/car-gift-with-red-ribbon-bqxzgz2ttsvm4e9a (1).png"
                  alt="Coche premio envuelto como regalo"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 80vw"
                  className="object-contain drop-shadow-2xl scale-[1.34] lg:scale-[1.2] animate-float lg:animate-float-lg"
                />
                
                {/* Efecto de brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fb0413]/10 rounded-3xl"></div>
                
                {/* Efecto de partículas brillantes */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
                      style={{
                        top: `${20 + i * 15}%`,
                        left: `${30 + i * 10}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS personalizados para las animaciones */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1.34); }
          50% { transform: translateY(-10px) scale(1.34); }
        }
        @keyframes float-lg {
          0%, 100% { transform: translateY(0px) scale(1.2); }
          50% { transform: translateY(-10px) scale(1.2); }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-30px,0); }
          70% { transform: translate3d(0,-15px,0); }
          90% { transform: translate3d(0,-4px,0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
