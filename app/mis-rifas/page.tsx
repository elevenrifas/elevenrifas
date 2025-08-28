"use client";
import { useState, useEffect } from "react";
import { RifaConTickets } from "@/lib/database/tickets";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, User, Mail, Ticket, Calendar, DollarSign, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { formatCurrencyVE } from "@/lib/formatters";
import { obtenerRifasConTickets } from "@/lib/database/tickets";

export default function MisRifasPage() {
  const [tipoBusqueda, setTipoBusqueda] = useState<"cedula" | "email">("cedula");
  const [valorBusqueda, setValorBusqueda] = useState("");
  const [rifasEncontradas, setRifasEncontradas] = useState<RifaConTickets[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const buscarRifas = async () => {
    if (!valorBusqueda.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    
    try {
      const rifas = await obtenerRifasConTickets(tipoBusqueda, valorBusqueda.trim());
      setRifasEncontradas(rifas);
    } catch (err) {
      console.error('Error al buscar rifas:', err);
      setError('Error al conectar con la base de datos. Intenta nuevamente.');
      setRifasEncontradas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarBusqueda = () => {
    setValorBusqueda("");
    setRifasEncontradas([]);
    setHasSearched(false);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscarRifas();
    }
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-700 via-slate-500 to-slate-200">
      <Navbar showBackButton={true} onBack={() => window.location.href = '/'} />
      
      {/* Elementos decorativos sutiles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-20 left-10 w-32 h-32 bg-[#fb0413]/5 rounded-full blur-3xl transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
        <div className={`absolute top-40 right-20 w-24 h-24 bg-[#fb0413]/3 rounded-full blur-2xl transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
        <div className={`absolute bottom-40 left-20 w-20 h-20 bg-[#fb0413]/4 rounded-full blur-2xl transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
      </div>
      
      <main className="relative z-10 pt-4 pb-32">
        <div className="container mx-auto px-4 sm:px-6 py-2">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                Mis <span className="text-[#fb0413]">Tickets</span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
                Consulta tus números comprados en todas las rifas y mantén un control total de tu participación
              </p>
            </div>

            {/* Formulario de búsqueda */}
            <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Card className="mb-8 border-white/20 bg-white/10 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Search className="h-5 w-5 text-[#fb0413]" />
                    Buscar mis rifas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Selector de tipo de búsqueda */}
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant={tipoBusqueda === "cedula" ? "default" : "outline"}
                      onClick={() => setTipoBusqueda("cedula")}
                      className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
                        tipoBusqueda === "cedula"
                          ? "bg-[#fb0413] hover:bg-[#fb0413]/90 text-white"
                          : "border-white text-white hover:bg-white/10"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      Cédula
                    </Button>
                    <Button
                      variant={tipoBusqueda === "email" ? "default" : "outline"}
                      onClick={() => setTipoBusqueda("email")}
                      className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
                        tipoBusqueda === "email"
                          ? "bg-[#fb0413] hover:bg-[#fb0413]/90 text-white"
                          : "border-white text-white hover:bg-white/10"
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      Correo
                    </Button>
                  </div>

                  {/* Campo de entrada */}
                  <div className="space-y-3">
                    <Label htmlFor="busqueda" className="text-white font-medium">
                      {tipoBusqueda === "cedula" ? "Número de Cédula" : "Correo Electrónico"}
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="busqueda"
                        type={tipoBusqueda === "cedula" ? "text" : "email"}
                        placeholder={tipoBusqueda === "cedula" ? "Ej: 12345678" : "Ej: usuario@email.com"}
                        value={valorBusqueda}
                        onChange={(e) => setValorBusqueda(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-slate-300 focus:border-[#fb0413] focus:ring-[#fb0413]/20"
                      />
                      <Button 
                        onClick={buscarRifas}
                        disabled={!valorBusqueda.trim() || isLoading}
                        className="px-8 py-2 bg-[#fb0413] hover:bg-[#fb0413]/90 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                      >
                        {isLoading ? "Buscando..." : "Buscar"}
                      </Button>
                    </div>
                  </div>

                  {/* Botón limpiar */}
                  {hasSearched && (
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        onClick={limpiarBusqueda}
                        className="text-sm border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
                      >
                        Nueva búsqueda
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Error */}
            {error && (
              <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <Card className="mb-6 border-red-400/30 bg-red-500/10 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-red-300">
                      <AlertCircle className="h-5 w-5" />
                      <p>{error}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Resultados */}
            {hasSearched && (
              <div className={`space-y-6 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fb0413] mx-auto mb-4"></div>
                    <p className="text-slate-200">Buscando tus rifas...</p>
                  </div>
                ) : rifasEncontradas.length > 0 ? (
                  <>
                    <h2 className="text-3xl font-bold text-white mb-6 text-center">
                      Rifas encontradas ({rifasEncontradas.length})
                    </h2>
                    <div className="grid gap-6">
                      {rifasEncontradas.map((rifa, index) => (
                        <Card key={rifa.rifa_id} className="overflow-hidden border-white/20 bg-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                          <div className="md:flex">
                            {/* Imagen */}
                            <div className="md:w-48 md:h-32 flex-shrink-0">
                              <Image
                                src={rifa.imagen_url}
                                alt={rifa.titulo}
                                width={192}
                                height={128}
                                className="w-full h-32 md:h-full object-cover"
                              />
                            </div>
                            
                            {/* Contenido */}
                            <div className="flex-1 p-6">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-white mb-3">
                                    {rifa.titulo}
                                  </h3>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-200 mb-4">
                                    <div className="flex items-center gap-2">
                                      <Ticket className="h-4 w-4 text-[#fb0413]" />
                                      <span>{rifa.total_tickets} tickets</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-[#fb0413]" />
                                      <span>{formatCurrencyVE(rifa.precio_promedio)} c/u</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-[#fb0413]" />
                                      <span>{new Date(rifa.tickets[0]?.fecha_compra || '').toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${rifa.activa ? 'bg-green-400' : 'bg-slate-400'}`}></div>
                                      <span className="capitalize">{rifa.estado}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Números comprados */}
                              <div className="border-t border-white/20 pt-4">
                                <h4 className="font-semibold text-white mb-3">
                                  Números comprados:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {rifa.tickets.map((ticket) => (
                                    <div
                                      key={ticket.id}
                                      className="px-3 py-1 bg-[#fb0413]/20 text-[#fb0413] font-mono text-sm rounded-lg border border-[#fb0413]/30 hover:bg-[#fb0413]/30 transition-all duration-300"
                                    >
                                      {ticket.numero_ticket.padStart(4, '0')}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card className="text-center py-12 border-white/20 bg-white/10 backdrop-blur-sm">
                    <div className="text-slate-300 text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No se encontraron rifas
                    </h3>
                    <p className="text-slate-200 mb-4">
                      No se encontraron rifas asociadas a este {tipoBusqueda === "cedula" ? "número de cédula" : "correo electrónico"}.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={limpiarBusqueda}
                      className="border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
                    >
                      Intentar con otro dato
                    </Button>
                  </Card>
                )}
              </div>
            )}

            {/* Estado inicial */}
            {!hasSearched && (
              <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <Card className="text-center py-12 border-white/20 bg-white/10 backdrop-blur-sm">
                  <div className="text-[#fb0413] text-6xl mb-4">🎫</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Consulta tus rifas
                  </h3>
                  <p className="text-slate-200">
                    Ingresa tu cédula o correo electrónico para ver todas las rifas en las que has participado.
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}