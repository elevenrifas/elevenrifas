import { Heart, Mail, Phone, MapPin, Instagram, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const partners = [
    {
      name: "Super Gana",
      logo: "/super.png",
      description: "Plataforma líder en sorteos"
    },
    {
      name: "Táchira Su Lotería",
      logo: "/tachira.png", 
      description: "Lotería oficial del estado"
    },
    {
      name: "CONALOT",
      logo: "/conalot.png",
      description: "Comisión Nacional de Lotería"
    }
  ];

  return (
    <footer className="relative backdrop-blur-md bg-black/95 text-white overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-primary"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gray-600/70"></div>
      
      {/* Efectos de partículas brillantes */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
      
      {/* Efectos adicionales cool */}
      <div className="absolute top-40 left-20 w-16 h-16 bg-primary/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 right-20 w-20 h-20 bg-primary/8 rounded-full blur-2xl animate-pulse delay-500"></div>
      
      {/* Líneas de energía sutiles */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16">
        {/* Logo y descripción */}
        <div className="md:col-span-2 text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image 
              src="/logoblancorojo.png" 
              alt="Eleven Motors Logo" 
              width={400} 
              height={160} 
              className="h-32 w-auto"
            />
          </div>
        </div>

        {/* Partners Oficiales - Solo iconos */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
            {partners.map((partner, index) => (
              <div key={index} className="group text-center">
                <div className="w-20 h-20 lg:w-28 lg:h-28 mx-auto bg-white rounded-xl p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 mb-2 shadow-md">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full"
                  />
                </div>
                <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-300 font-medium">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Descripción */}
          <div className="md:col-span-2 text-center">
            <p className="text-white/80 leading-relaxed max-w-2xl mx-auto">
              Tu plataforma de confianza para participar en rifas exclusivas y ganar 
              premios increíbles. Seguridad, transparencia y diversión garantizada.
            </p>
          </div>

          {/* Contacto */}
          <div className="md:col-span-2 text-center">
            <h3 className="text-lg font-semibold mb-6">Contacto</h3>
            <ul className="space-y-3 max-w-md mx-auto">
              <li className="flex items-center justify-center gap-3 text-white/80">
                <Mail className="w-4 h-4 text-primary" />
                <span>info@elevenrifas.com</span>
              </li>
              <li className="flex items-center justify-center gap-3 text-white/80">
                <Phone className="w-4 h-4 text-primary" />
                <span>0424-1876325</span>
              </li>
              <li className="flex items-center justify-center gap-3 text-white/80">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Calle Sanz, Santa Mónica, Caracas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Redes sociales y copyright */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="https://www.instagram.com/ganacone11even/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="https://t.me/GANACONE11EVEN" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </Link>
              <Link href="https://www.tiktok.com/@ganacone11even" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </Link>
            </div>
            
            <div className="flex flex-col items-center gap-2 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <span>© 2024 ElevenRifas. Hecho con</span>
                <Heart className="w-4 h-4 text-primary" />
                <span>en Venezuela</span>
              </div>
              <Link href="/terminos-condiciones" className="text-white/60 hover:text-primary transition-colors text-sm">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

