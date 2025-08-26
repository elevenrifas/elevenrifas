import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
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
    <footer className="relative bg-gradient-to-br from-foreground to-foreground/90 text-white overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-primary"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16">
        {/* Logo y descripción */}
        <div className="md:col-span-2 text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image 
              src="/E_LOGOb.png" 
              alt="Eleven Motors Logo" 
              width={200} 
              height={80} 
              className="h-16 w-auto"
            />
          </div>
        </div>

        {/* Partners Oficiales - Solo iconos */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
            {partners.map((partner, index) => (
              <div key={index} className="group text-center">
                <div className="w-20 h-20 lg:w-28 lg:h-28 mx-auto bg-white rounded-xl p-3 flex items-center justify-center hover:bg-slate-50 transition-all duration-300 mb-2 shadow-md">
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
                <span>+58 412-123-4567</span>
              </li>
              <li className="flex items-center justify-center gap-3 text-white/80">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Caracas, Venezuela</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Redes sociales y copyright */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
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
