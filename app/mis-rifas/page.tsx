"use client";
import { useState } from "react";
import { RifaConTickets } from "@/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, User, Mail, Ticket, Calendar, DollarSign, AlertCircle } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar showBackButton={true} onBack={() => window.location.href = '/'} />
      
      <main className="pt-4 pb-32">
        <div className="container mx-auto px-4 sm:px-6 py-2">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Mis Rifas
              </h1>
              <p className="text-xl text-muted-foreground">
                Consulta tus números comprados en todas las rifas
              </p>
            </div>

            {/* Formulario de búsqueda */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Buscar mis rifas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Selector de tipo de búsqueda */}
                <div className="flex gap-4 justify-center">
                  <Button
                    variant={tipoBusqueda === "cedula" ? "default" : "outline"}
                    onClick={() => setTipoBusqueda("cedula")}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Cédula
                  </Button>
                  <Button
                    variant={tipoBusqueda === "email" ? "default" : "outline"}
                    onClick={() => setTipoBusqueda("email")}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Correo
                  </Button>
                </div>

                {/* Campo de entrada */}
                <div className="space-y-2">
                  <Label htmlFor="busqueda">
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
                      className="flex-1"
                    />
                    <Button 
                      onClick={buscarRifas}
                      disabled={!valorBusqueda.trim() || isLoading}
                      className="px-6"
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
                      className="text-sm"
                    >
                      Nueva búsqueda
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resultados */}
            {hasSearched && (
              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Buscando tus rifas...</p>
                  </div>
                ) : rifasEncontradas.length > 0 ? (
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      Rifas encontradas ({rifasEncontradas.length})
                    </h2>
                    <div className="grid gap-6">
                      {rifasEncontradas.map((rifa) => (
                        <Card key={rifa.rifa_id} className="overflow-hidden">
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
                                  <h3 className="text-xl font-bold text-foreground mb-2">
                                    {rifa.titulo}
                                  </h3>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-2">
                                      <Ticket className="h-4 w-4 text-primary" />
                                      <span>{rifa.total_tickets} tickets</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-primary" />
                                      <span>{formatCurrencyVE(rifa.precio_promedio)} c/u</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-primary" />
                                      <span>{new Date(rifa.tickets[0]?.fecha_compra || '').toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${rifa.activa ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                      <span className="capitalize">{rifa.estado}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Números comprados */}
                              <div className="border-t pt-4">
                                <h4 className="font-semibold text-foreground mb-3">
                                  Números comprados:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {rifa.tickets.map((ticket) => (
                                    <div
                                      key={ticket.id}
                                      className="px-3 py-1 bg-primary/10 text-primary font-mono text-sm rounded-lg border border-primary/20"
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
                  <Card className="text-center py-12">
                    <div className="text-muted-foreground text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No se encontraron rifas
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      No se encontraron rifas asociadas a este {tipoBusqueda === "cedula" ? "número de cédula" : "correo electrónico"}.
                    </p>
                    <Button variant="outline" onClick={limpiarBusqueda}>
                      Intentar con otro dato
                    </Button>
                  </Card>
                )}
              </div>
            )}

            {/* Estado inicial */}
            {!hasSearched && (
              <Card className="text-center py-12">
                <div className="text-primary text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Consulta tus rifas
                </h3>
                <p className="text-muted-foreground">
                  Ingresa tu cédula o correo electrónico para ver todas las rifas en las que has participado.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}