"use client";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Copy, Smartphone, Wallet, ChevronDown, FileText, Check, CreditCard, Zap, Globe, Banknote } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrencyVE } from "@/lib/formatters";
import { useRifas, useTicketNumbersFromContext } from "@/lib/context/RifasContext";
import { Rifa, DatosPersona, DatosPago } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { reportarPagoConTickets, DatosPagoCompleto } from '@/lib/database/pagos';

// Componente para el Paso 1: Cantidad de tickets
function PasoCantidad({ cantidad, setCantidad, precioTicket, rifaId }: {
  cantidad: number;
  setCantidad: (cantidad: number) => void;
  precioTicket: number;
  rifaId: string;
}) {
  const { ticketNumbers: opciones, loading, error } = useTicketNumbersFromContext(rifaId);

  // Mostrar loading mientras se cargan los números
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">¿Cuántos tickets quieres?</h2>
          <p className="text-xl text-muted-foreground">Cargando opciones...</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay problema
  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">¿Cuántos tickets quieres?</h2>
          <p className="text-xl text-red-500">❌ {error}</p>
          <p className="text-sm text-muted-foreground">No se pueden cargar las opciones de tickets desde la base de datos</p>
        </div>
        
        <div className="text-center">
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="px-6 py-3"
          >
            🔄 Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Si no hay opciones de tickets, mostrar mensaje
  if (opciones.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">¿Cuántos tickets quieres?</h2>
          <p className="text-xl text-muted-foreground">No hay opciones de tickets disponibles</p>
          <p className="text-sm text-muted-foreground">Contacta al administrador para configurar las opciones</p>
        </div>
      </div>
    );
  }

  // Asegurar opciones únicas para evitar claves duplicadas
  const opcionesUnicas = Array.from(new Set(opciones));

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">¿Cuántos tickets quieres?</h2>
        <p className="text-xl text-muted-foreground">Selecciona la cantidad de tickets para participar</p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {opcionesUnicas.map((opcion: number, idx: number) => (
          <button
            key={`${opcion}-${idx}`}
            onClick={() => setCantidad(opcion)}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              cantidad === opcion
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="text-2xl font-bold">{opcion}</div>
            <div className="text-sm text-muted-foreground">tickets</div>
          </button>
        ))}
      </div>

      <div className="text-center space-y-4">
        <div className="text-2xl font-bold text-primary">
          Total: {formatCurrencyVE(cantidad * precioTicket)}
        </div>
      </div>
    </div>
  );
}

// Componente para el Paso 2: Método de pago
function PasoMetodoPago({ metodoPago, setMetodoPago }: {
  metodoPago: string;
  setMetodoPago: (metodo: string) => void;
}) {
  const metodos = [
    { id: "pago_movil", nombre: "Pago Móvil", icono: <Smartphone className="h-8 w-8" />, descripcion: "Transferencia bancaria vía móvil" },
    { id: "binance", nombre: "Binance", icono: <Wallet className="h-8 w-8" />, descripcion: "Pago con USDT (TRC20)" },
    { id: "zelle", nombre: "Zelle", icono: <Globe className="h-8 w-8" />, descripcion: "Transferencia bancaria internacional" },
    { id: "zinli", nombre: "Zinli", icono: <Zap className="h-8 w-8" />, descripcion: "Pago a billetera digital" },
    { id: "paypal", nombre: "PayPal", icono: <CreditCard className="h-8 w-8" />, descripcion: "Pago online internacional" },
    { id: "efectivo", nombre: "Efectivo", icono: <Banknote className="h-8 w-8" />, descripcion: "Pago físico en efectivo" }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Método de pago</h2>
        <p className="text-xl text-muted-foreground">Elige tu método de pago</p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
        {metodos.map((metodo) => (
          <button
            key={metodo.id}
            onClick={() => setMetodoPago(metodo.id)}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 text-left ${
              metodoPago === metodo.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="mb-3 text-primary">{metodo.icono}</div>
            <div className="text-xl font-bold mb-2">{metodo.nombre}</div>
            <div className="text-sm text-muted-foreground">{metodo.descripcion}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Componente para el Paso 3: Datos de la persona
function PasoDatosPersona({ datos, setDatos }: {
  datos: DatosPersona;
  setDatos: (datos: DatosPersona) => void;
}) {
  const handleChange = (campo: string, valor: string) => {
    setDatos({ ...datos, [campo]: valor });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Datos personales</h2>
        <p className="text-xl text-muted-foreground">Completa tu información personal</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nombre completo</label>
          <input
            type="text"
            value={datos.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder="Tu nombre completo"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Cédula</label>
          <input
            type="text"
            value={datos.cedula}
            onChange={(e) => handleChange("cedula", e.target.value)}
            placeholder="12345678"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
          <input
            type="tel"
            value={datos.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            placeholder="0412-1234567"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Correo electrónico</label>
          <input
            type="email"
            value={datos.correo}
            onChange={(e) => handleChange("correo", e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}

// Componente para el Paso 4: Datos del método de pago
function PasoDatosPago({ metodoPago, datosPago, setDatosPago, cantidad, precioTicket }: {
  metodoPago: string;
  datosPago: DatosPago;
  setDatosPago: (datos: DatosPago) => void;
  cantidad: number;
  precioTicket: number;
}) {
  // Lista de bancos de Venezuela
  const bancosVenezuela = [
    "Banco de Venezuela",
    "Banco Bicentenario del Pueblo",
    "Banco del Tesoro",
    "Banco de Desarrollo Microfinanzas",
    "Banco Nacional de Crédito",
    "Banco Exterior",
    "Banco Mercantil",
    "Banco Provincial",
    "Banco Banesco",
    "Banco Caroní",
    "Banco Plaza",
    "Banco Activo",
    "Banco Sofitasa",
    "Banco Fondo Común",
    "Banco Caracas",
    "Banco Venezolano de Crédito",
    "Banco de Comercio Exterior",
    "Banco Industrial de Venezuela",
    "Banco Universal",
    "Banco Comercial"
  ];

  const handleChange = (campo: string, valor: string) => {
    setDatosPago({ ...datosPago, [campo]: valor });
  };

  const copiarAlPortapapeles = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("¡Copiado al portapapeles!");
    } catch (err) {
      console.error('Error al copiar:', err);
      toast.error("Error al copiar al portapapeles");
    }
  };

  const renderCamposPago = () => {
    switch (metodoPago) {
      case "pago_movil":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 bg-secondary/20">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="font-medium">📱 Datos para Pago Móvil:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Teléfono:</strong> 0412-555-0123</span>
                  <button
                    onClick={() => copiarAlPortapapeles('0412-555-0123')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar teléfono"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Banco:</strong> Banco de Venezuela</span>
                  <button
                    onClick={() => copiarAlPortapapeles('Banco de Venezuela')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar banco"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Cédula:</strong> 12.345.678</span>
                  <button
                    onClick={() => copiarAlPortapapeles('12.345.678')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar cédula"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> {formatCurrencyVE(cantidad * precioTicket)}</span>
                  <button
                    onClick={() => copiarAlPortapapeles((cantidad * precioTicket).toString())}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Teléfono de pago</label>
              <input
                type="tel"
                value={datosPago.telefonoPago || ""}
                onChange={(e) => handleChange("telefonoPago", e.target.value)}
                placeholder="0412-1234567"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-2">Banco</label>
              <select
                value={datosPago.bancoPago || ""}
                onChange={(e) => handleChange("bancoPago", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="">Selecciona tu banco</option>
                {bancosVenezuela.map((banco) => (
                  <option key={banco} value={banco}>
                    {banco}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cédula de pago</label>
              <input
                type="text"
                value={datosPago.cedulaPago || ""}
                onChange={(e) => handleChange("cedulaPago", e.target.value)}
                placeholder="12345678"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        );

      case "binance":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 bg-secondary/20">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="font-medium">💎 Datos para Binance:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Billetera:</strong> TRC20: TQn9Y2khDD8...</span>
                  <button
                    onClick={() => copiarAlPortapapeles('TQn9Y2khDD8...')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar billetera"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Red:</strong> TRC20 (Tron)</span>
                  <button
                    onClick={() => copiarAlPortapapeles('TRC20')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar red"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> ${((cantidad * precioTicket) / 145).toFixed(2)} USD</span>
                  <button
                    onClick={() => copiarAlPortapapeles(((cantidad * precioTicket) / 145).toFixed(2))}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ID de Binance</label>
              <input
                type="text"
                value={datosPago.idBinance || ""}
                onChange={(e) => handleChange("idBinance", e.target.value)}
                placeholder="Tu ID de Binance"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        );

      case "zelle":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 bg-secondary/20">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="font-medium">💳 Datos para Zelle:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Correo:</strong> pagos@elevenrifas.com</span>
                  <button
                    onClick={() => copiarAlPortapapeles('pagos@elevenrifas.com')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar correo"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Nombre:</strong> Eleven Rifas</span>
                  <button
                    onClick={() => copiarAlPortapapeles('Eleven Rifas')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar nombre"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> ${((cantidad * precioTicket) / 145).toFixed(2)} USD</span>
                  <button
                    onClick={() => copiarAlPortapapeles(((cantidad * precioTicket) / 145).toFixed(2))}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Correo Zelle</label>
              <input
                type="email"
                value={datosPago.correoZelle || ""}
                onChange={(e) => handleChange("correoZelle", e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        );

        case "zinli":
          return (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-4 bg-secondary/20">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="font-medium">📱 Datos para Zinli:</div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Usuario:</strong> @elevenrifas</span>
                    <button
                      onClick={() => copiarAlPortapapeles('@elevenrifas')}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar usuario"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Monto:</strong> {formatCurrencyVE(cantidad * precioTicket)}</span>
                    <button
                      onClick={() => copiarAlPortapapeles((cantidad * precioTicket).toString())}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar monto"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Referencia:</strong> Tu nombre + fecha</span>
                    <button
                      onClick={() => copiarAlPortapapeles('REF123456')}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar referencia"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Usuario de Zinli</label>
                <input
                  type="text"
                  value={datosPago.usuarioZinli || ""}
                  onChange={(e) => handleChange("usuarioZinli", e.target.value)}
                  placeholder="@tuusuario"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Referencia</label>
                <input
                  type="text"
                  value={datosPago.referencia || ""}
                  onChange={(e) => handleChange("referencia", e.target.value)}
                  placeholder="REF123456"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          );

        case "paypal":
          return (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-4 bg-secondary/20">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="font-medium">💳 Datos para PayPal:</div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Correo:</strong> pagos@elevenrifas.com</span>
                    <button
                      onClick={() => copiarAlPortapapeles('pagos@elevenrifas.com')}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar correo"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Monto:</strong> ${((cantidad * precioTicket) / 145).toFixed(2)} USD</span>
                    <button
                      onClick={() => copiarAlPortapapeles(((cantidad * precioTicket) / 145).toFixed(2))}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar monto"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Referencia:</strong> Tu nombre + fecha</span>
                    <button
                      onClick={() => copiarAlPortapapeles('REF123456')}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar referencia"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Correo de PayPal</label>
                <input
                  type="email"
                  value={datosPago.correoPaypal || ""}
                  onChange={(e) => handleChange("correoPaypal", e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Referencia</label>
                <input
                  type="text"
                  value={datosPago.referencia || ""}
                  onChange={(e) => handleChange("referencia", e.target.value)}
                  placeholder="REF123456"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          );

        case "efectivo":
          return (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-4 bg-secondary/20">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="font-medium">💵 Datos para Pago en Efectivo:</div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Dirección:</strong> Av. Principal #123, Caracas</span>
                    <button
                      onClick={() => copiarAlPortapapeles('Av. Principal #123, Caracas')}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar dirección"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Horario:</strong> Lunes a Viernes 9:00 AM - 6:00 PM</span>
                    <button
                      onClick={() => copiarAlPortapapeles('Lunes a Viernes 9:00 AM - 6:00 PM')}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar horario"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Monto:</strong> {formatCurrencyVE(cantidad * precioTicket)}</span>
                    <button
                      onClick={() => copiarAlPortapapeles((cantidad * precioTicket).toString())}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar monto"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Contacto:</strong> 0412-555-0123</span>
                    <button
                      onClick={() => copiarAlPortapapeles('0412-555-0123')}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar contacto"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha de visita</label>
                <input
                  type="date"
                  value={datosPago.fechaVisita || ""}
                  onChange={(e) => handleChange("fechaVisita", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>


            </div>
          );

      case "zelle":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 bg-secondary/20">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="font-medium">💳 Datos para Zelle:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Email:</strong> pagos@elevenrifas.com</span>
                  <button
                    onClick={() => copiarAlPortapapeles('pagos@elevenrifas.com')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar email"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Banco:</strong> Bank of America</span>
                  <button
                    onClick={() => copiarAlPortapapeles('Bank of America')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar banco"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> ${(cantidad * precioTicket / 145).toFixed(2)} USD</span>
                  <button
                    onClick={() => copiarAlPortapapeles((cantidad * precioTicket / 145).toFixed(2))}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email de pago</label>
              <input
                type="email"
                value={datosPago.correoZelle || ""}
                onChange={(e) => handleChange("correoZelle", e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Banco de pago</label>
              <input
                type="text"
                value={datosPago.bancoZelle || ""}
                onChange={(e) => handleChange("bancoZelle", e.target.value)}
                placeholder="Tu banco"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        );

      case "zinli":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 bg-secondary/20">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="font-medium">⚡ Datos para Zinli:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Usuario:</strong> @elevenrifas</span>
                  <button
                    onClick={() => copiarAlPortapapeles('@elevenrifas')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar usuario"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> ${(cantidad * precioTicket / 145).toFixed(2)} USD</span>
                  <button
                    onClick={() => copiarAlPortapapeles((cantidad * precioTicket / 145).toFixed(2))}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Usuario Zinli</label>
              <input
                type="text"
                value={datosPago.usuarioZinli || ""}
                onChange={(e) => handleChange("usuarioZinli", e.target.value)}
                placeholder="@tuusuario"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        );

      case "paypal":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 bg-secondary/20">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="font-medium">💳 Datos para PayPal:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Email:</strong> pagos@elevenrifas.com</span>
                  <button
                    onClick={() => copiarAlPortapapeles('pagos@elevenrifas.com')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar email"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> ${(cantidad * precioTicket / 145).toFixed(2)} USD</span>
                  <button
                    onClick={() => copiarAlPortapapeles((cantidad * precioTicket / 145).toFixed(2))}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email de pago</label>
              <input
                type="email"
                value={datosPago.correoPaypal || ""}
                onChange={(e) => handleChange("correoPaypal", e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        );

      case "efectivo":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 bg-secondary/20">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="font-medium">💵 Datos para Pago en Efectivo:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Dirección:</strong> Av. Principal, Caracas</span>
                  <button
                    onClick={() => copiarAlPortapapeles('Av. Principal, Caracas')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar dirección"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Horario:</strong> Lunes a Viernes 9:00 AM - 5:00 PM</span>
                  <button
                    onClick={() => copiarAlPortapapeles('Lunes a Viernes 9:00 AM - 5:00 PM')}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar horario"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> {formatCurrencyVE(cantidad * precioTicket)}</span>
                  <button
                    onClick={() => copiarAlPortapapeles((cantidad * precioTicket).toString())}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Fecha de visita</label>
              <input
                type="date"
                value={datosPago.fechaVisita || ""}
                onChange={(e) => handleChange("fechaVisita", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Notas adicionales</label>
              <textarea
                value={datosPago.notas || ""}
                onChange={(e) => handleChange("notas", e.target.value)}
                placeholder="Información adicional sobre tu visita..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            </div>
          );

      default:
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Método de pago no reconocido</h3>
            <p className="text-muted-foreground">Por favor, selecciona un método de pago válido.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Datos del pago</h2>
        <p className="text-xl text-muted-foreground">Completa la información del método de pago seleccionado</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {renderCamposPago()}
      </div>
    </div>
  );
}

// Componente para el Paso 5: Reporte del pago
function PasoReportePago({ rifa, cantidad, metodoPago, datosPersona }: {
  rifa: Rifa;
  cantidad: number;
  metodoPago: string;
  datosPersona: DatosPersona;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-foreground">¡Pago Reportado!</h2>
        <p className="text-xl text-muted-foreground">Tu participación ha sido registrada exitosamente</p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-lg mx-auto">
          <p className="text-green-700 text-sm leading-relaxed">
            📧 <strong>Recibirás tus tickets por correo electrónico</strong> una vez que tu pago haya sido verificado por nuestro equipo.
          </p>
          <p className="text-green-700 text-sm leading-relaxed mt-2">
            📧 <strong>Correo:</strong> {datosPersona.correo}
          </p>
          <p className="text-green-600 text-xs mt-2">
            ⏱️ El proceso de verificación puede tomar entre 24-48 horas
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Resumen de la Compra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Rifa:</span>
                <p className="text-muted-foreground">{rifa.titulo}</p>
              </div>
              <div>
                <span className="font-medium">Cantidad:</span>
                <p className="text-muted-foreground">{cantidad} tickets</p>
              </div>
              <div>
                <span className="font-medium">Total:</span>
                                  <p className="text-primary font-semibold">{formatCurrencyVE(cantidad * rifa.precio_ticket)}</p>
              </div>
              <div>
                <span className="font-medium">Método:</span>
                <p className="text-muted-foreground">{
                  metodoPago === "pago_movil" ? "Pago Móvil" : 
                  metodoPago === "binance" ? "Binance" : 
                  metodoPago === "zelle" ? "Zelle" :
                  metodoPago === "zinli" ? "Zinli" :
                  metodoPago === "paypal" ? "PayPal" : 
                  metodoPago === "efectivo" ? "Efectivo" :
                  metodoPago
                }</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Datos del Participante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="font-medium">Nombre:</span>
                <p className="text-muted-foreground break-words">{datosPersona.nombre}</p>
              </div>
              <div>
                <span className="font-medium">Cédula:</span>
                <p className="text-muted-foreground break-words">{datosPersona.cedula}</p>
              </div>
              <div>
                <span className="font-medium">Teléfono:</span>
                <p className="text-muted-foreground break-words">{datosPersona.telefono}</p>
              </div>
              <div>
                <span className="font-medium">Correo:</span>
                <p className="text-muted-foreground break-words">{datosPersona.correo}</p>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Botón para volver al inicio */}
        <div className="text-center pt-4">
          <Link href="/">
            <Button className="px-8 py-3 text-lg font-medium bg-gradient-to-r from-primary via-red-500 to-yellow-500 bg-[length:200%_100%] animate-gradient-move">
              <CheckCircle className="mr-2 h-5 w-5" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ComprarPageContent() {
  const { rifas, rifaActiva } = useRifas();
  
  // Estado para los 5 pasos - MOVIDO AL INICIO para evitar hooks condicionales
  const [pasoActual, setPasoActual] = useState(1);
  const [cantidad, setCantidad] = useState(0);
  const [metodoPago, setMetodoPago] = useState("");
  const [datosPersona, setDatosPersona] = useState<DatosPersona>({
    nombre: "",
    cedula: "",
    telefono: "",
    correo: ""
  });
  const [datosPago, setDatosPago] = useState<DatosPago>({});
  
  // Estado para el modal de términos y condiciones
  const [showTerminosModal, setShowTerminosModal] = useState(false);
  const [aceptadoTerminos, setAceptadoTerminos] = useState(false);
  
  console.log('🔍 Contexto de rifas:', { rifas: rifas.length, rifaActiva });
  
  // Si no hay rifa activa, mostrar mensaje de error
  if (!rifaActiva) {
    console.log('❌ No hay rifa activa en el contexto');
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            ❌ No hay rifa seleccionada
          </h1>
          <p className="text-muted-foreground mb-8">
            Por favor, selecciona una rifa desde la página principal
          </p>
          
          {/* Debug info */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left">
            <h3 className="font-semibold mb-2">🔍 Información de Debug:</h3>
            <p>Rifas en contexto: {rifas.length}</p>
            <p>Rifa activa: {rifaActiva ? (rifaActiva as Rifa).titulo : 'null'}</p>
            <p>LocalStorage: {typeof window !== 'undefined' ? localStorage.getItem('rifaActiva') || 'vacío' : 'no disponible'}</p>
          </div>
          
          <Link href="/" className="text-primary hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const rifa = rifaActiva;

  // NUEVA FUNCIÓN: Reportar pago y crear tickets

  const reportarPagoYCrearTickets = async () => {
    console.log('🚀 Iniciando reporte de pago y creación de tickets');
    
    try {
      // Preparar datos del pago
      const datosPagoCompleto: DatosPagoCompleto = {
        tipo_pago: metodoPago as 'pago_movil' | 'binance' | 'zelle' | 'zinli' | 'paypal' | 'efectivo',
        monto_usd: rifa.precio_ticket * cantidad,
        monto_bs: rifa.precio_ticket * cantidad * 145,
        tasa_cambio: 145,
        referencia: `REF-${Date.now()}`,
        telefono_pago: datosPersona.telefono,
        banco_pago: datosPago.bancoPago,
        cedula_pago: datosPersona.cedula,
        fecha_visita: datosPago.fechaVisita,
        estado: 'pendiente',
        cantidad_tickets: cantidad,
        rifa_id: rifa.id,
        nombre: datosPersona.nombre,
        cedula: datosPersona.cedula,
        telefono: datosPersona.telefono,
        correo: datosPersona.correo
      };

      console.log('📊 Datos del pago preparados:', datosPagoCompleto);
      console.log('🔍 Tipo de cantidad_tickets:', typeof datosPagoCompleto.cantidad_tickets, 'Valor:', datosPagoCompleto.cantidad_tickets);
      console.log('🔍 Tipo de rifa_id:', typeof datosPagoCompleto.rifa_id, 'Valor:', datosPagoCompleto.rifa_id);
      console.log('🔍 Precio ticket original:', rifa.precio_ticket);
      console.log('🔍 Cantidad:', cantidad);
      console.log('🔍 Total USD:', rifa.precio_ticket * cantidad);
      console.log('🔍 Total Bs:', rifa.precio_ticket * cantidad * 145);

      console.log('🔍 VERIFICACIÓN DETALLADA DE TIPOS:');
      Object.entries(datosPagoCompleto).forEach(([key, value]) => {
        console.log(`  ${key}: ${typeof value} = ${value}`);
      });

      console.log('📞 Llamando a reportarPagoConTickets...');
      const resultado = await reportarPagoConTickets(datosPagoCompleto);
      console.log('📞 Resultado recibido:', resultado);

      if (resultado && resultado.success) {
        console.log('✅ Pago reportado exitosamente');
        toast.success('Pago reportado exitosamente');
        setPasoActual(5);
      } else {
        console.log('❌ Error en el resultado:', resultado);
        toast.error('Error al reportar el pago');
      }

    } catch (error) {
      console.log('💥 Error en reportarPagoYCrearTickets:', error);
      toast.error('Error al procesar el pago');
    }
  };

  const siguientePaso = async () => {
    // Mostrar términos y condiciones en el paso 1 (antes de continuar)
    if (pasoActual === 1 && !aceptadoTerminos) {
      setShowTerminosModal(true);
      return;
    }
    
    // Si estamos en el paso 4 (Reportar Pago), ejecutar la lógica de crear pago
    if (pasoActual === 4) {
      await reportarPagoYCrearTickets();
      return;
    }
    
    // En otros casos, continuar al siguiente paso
    setPasoActual(pasoActual + 1);
  };
  
  const pasoAnterior = () => setPasoActual(pasoActual - 1);
  
  const confirmarTerminos = () => {
    setAceptadoTerminos(true);
    setShowTerminosModal(false);
    // Ahora sí continuar al siguiente paso
    setPasoActual(pasoActual + 1);
  };

  // Función para determinar si puede continuar al siguiente paso
  const puedeContinuar = (): boolean => {
    switch (pasoActual) {
      case 1: // Cantidad
        return cantidad > 0;
      case 2: // Método de pago
        return metodoPago !== "";
      case 3: // Datos de la persona
        return datosPersona.nombre.trim() !== "" && 
               datosPersona.cedula.trim() !== "" && 
               datosPersona.telefono.trim() !== "" && 
               datosPersona.correo.trim() !== "";
      case 4: // Datos del pago
        return true; // Siempre puede continuar desde el paso 4
      default:
        return false;
    }
  };
  
  // Función para determinar si puede continuar considerando términos y condiciones
  const puedeContinuarConTerminos = (): boolean => {
    // En el paso 1, solo verificar que haya seleccionado cantidad (no términos)
    if (pasoActual === 1) {
      return puedeContinuar();
    }
    // En otros pasos, solo verificar la validación normal
    return puedeContinuar();
  };

  // Función para obtener el texto del botón según el paso
  const getTextoBoton = (): string => {
    switch (pasoActual) {
      case 1: return "Continuar";
      case 2: return "Continuar";
      case 3: return "Continuar";
      case 4: return "Reportar Pago";
      default: return "Continuar";
    }
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <PasoCantidad
            cantidad={cantidad}
            setCantidad={setCantidad}
                         precioTicket={rifa.precio_ticket}
             rifaId={rifa.id}
          />
        );
      case 2:
        return (
          <PasoMetodoPago
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
          />
        );
      case 3:
        return (
          <PasoDatosPersona
            datos={datosPersona}
            setDatos={setDatosPersona}
          />
        );
      case 4:
        return (
          <PasoDatosPago
            metodoPago={metodoPago}
            datosPago={datosPago}
            setDatosPago={setDatosPago}
            cantidad={cantidad}
                         precioTicket={rifa.precio_ticket}
          />
        );
      case 5:
        return (
          <PasoReportePago
            rifa={rifa}
            cantidad={cantidad}
            metodoPago={metodoPago}
            datosPersona={datosPersona}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showBackButton={pasoActual < 5} onBack={pasoActual > 1 ? pasoAnterior : () => window.location.href = '/'} />
      
      {/* Modal de Términos y Condiciones */}
      <Dialog open={showTerminosModal} onOpenChange={setShowTerminosModal}>
        <DialogContent className="w-[90vw] sm:w-auto sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[60vh] overflow-y-auto rounded-xl border border-border/60 bg-white/95 backdrop-blur-sm shadow-lg p-0">
          <DialogHeader className="px-5 pt-4 pb-3 border-b border-border/50 text-center items-center">
            <DialogTitle className="flex items-center justify-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 text-primary" />
              Términos y Condiciones
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-muted-foreground text-center">
              Lee y acepta los términos
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-5 py-4 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-1.5">
              <h4 className="font-medium text-foreground text-sm text-center sm:text-left">Participación</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Mayor de 18 años</li>
                <li>No garantiza ganar</li>
                <li>Números aleatorios</li>
              </ul>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="font-medium text-foreground text-sm text-center sm:text-left">Proceso</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Verificación 24-48h</li>
                <li>Tickets por correo</li>
              </ul>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="font-medium text-foreground text-sm text-center sm:text-left">Privacidad</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Solo para gestión</li>
                <li>No compartimos datos</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="px-5 py-4 border-t border-border/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowTerminosModal(false)}
              size="sm"
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmarTerminos}
              size="sm"
              className="w-full sm:w-auto bg-gradient-to-r from-primary via-red-500 to-yellow-500 bg-[length:200%_100%] animate-gradient-move"
            >
              <Check className="mr-1 h-3 w-3" />
              Acepto y Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <main className="pt-4 pb-40">
                  {/* Indicador de pasos */}
                  <div className="container mx-auto px-4 sm:px-6 py-2">
          <div className="max-w-4xl mx-auto mb-6 relative">
            

          </div>

          {/* Contenido del paso actual */}
          <div className="max-w-4xl mx-auto relative">
            {renderPaso()}
          </div>
        </div>
      </main>

      {/* Barra flotante inferior - Solo visible en pasos 1-4 */}
      {pasoActual < 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-primary/20 shadow-2xl z-50 rounded-t-2xl">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col space-y-3">
                {/* Título de la rifa - Ahora arriba y con más espacio */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground leading-tight">
                    {rifa.titulo}
                  </h3>
                </div>
                
                {/* Información de precios - Ahora separada del título */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1 text-sm">
                    {cantidad > 0 ? (
                      <>
                                                  <div className="text-primary font-semibold">
                            {formatCurrencyVE(rifa.precio_ticket)} × {cantidad}
                          </div>
                          <div className="text-muted-foreground">
                            Tasa: 145 | ${(rifa.precio_ticket / 145).toFixed(2)} USD c/u
                          </div>
                          <div className="text-primary font-semibold text-base">
                            Total: {formatCurrencyVE(cantidad * rifa.precio_ticket)}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Total USD: ${((cantidad * rifa.precio_ticket) / 145).toFixed(2)}
                          </div>
                      </>
                    ) : (
                                              <>
                          <div className="text-muted-foreground">
                            Precio: {formatCurrencyVE(rifa.precio_ticket)}
                          </div>
                          <div className="text-muted-foreground">
                            Tasa: 145 | ${(rifa.precio_ticket / 145).toFixed(2)} USD c/u
                          </div>
                        </>
                    )}
                  </div>

                  {/* Botón de continuar */}
                  <div className="ml-6 space-y-2">
                    <Button 
                      onClick={siguientePaso}
                      disabled={!puedeContinuarConTerminos()}
                      className="px-8 py-3 text-lg font-bold bg-gradient-to-r from-primary via-red-500 to-yellow-500 bg-[length:200%_100%] animate-gradient-move"
                    >
                      {getTextoBoton()}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComprarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <ComprarPageContent />
    </Suspense>
  );
}
