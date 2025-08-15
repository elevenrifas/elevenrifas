"use client";

import { Shield, Zap, Gift, Users, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Todas nuestras rifas están garantizadas y supervisadas por profesionales."
  },
  {
    icon: Zap,
    title: "Rápido y Fácil",
    description: "Participa en segundos con nuestro proceso simplificado de compra."
  },
  {
    icon: Gift,
    title: "Premios Increíbles",
    description: "Desde vehículos de lujo hasta experiencias únicas y memorables."
  },
  {
    icon: Users,
    title: "Comunidad Activa",
    description: "Únete a miles de participantes en nuestra plataforma confiable."
  },
  {
    icon: Clock,
    title: "Sorteos Regulares",
    description: "Nuevas oportunidades cada semana con premios siempre disponibles."
  }
];

export function FeaturesSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Fondo blanco para la tercera sección */}
      <div className="absolute inset-0 bg-white"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            ¿Por qué
            <span className="block text-primary">Eleven Rifas?</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed text-justify">
            Nuestra plataforma está diseñada para ofrecerte la mejor experiencia 
            en rifas online con total transparencia y seguridad.
          </p>
        </div>

        {/* Grid de características - Cards más pequeñas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative p-4 bg-white rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Layout horizontal: icono al lado del contenido */}
              <div className="flex items-start gap-3">
                {/* Icono más pequeño */}
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                
                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              {/* Efecto de hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* CTA adicional */}
        <div className="text-center mt-16">
          <a 
            href="#rifas" 
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('rifas')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
            className="inline-flex items-center gap-4 bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-2xl shadow-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <Gift className="w-5 h-5" />
            <span className="text-lg font-semibold">
              ¡Únete a la experiencia Eleven Rifas!
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
