"use client";
import { useState, Suspense, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Copy, Smartphone, Wallet, ChevronDown, FileText, Check, CreditCard, Zap, Globe, Banknote, Plus, Minus, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatCurrencyVE } from "@/lib/formatters";
import { useRifas, useTicketNumbersFromContext } from "@/lib/context/RifasContext";
import { Rifa, DatosPersona, DatosPago } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { reportarPagoConTickets, DatosPagoCompleto } from '@/lib/database/pagos';
import { reservarTickets, cancelarReservaPorIds } from '@/lib/database/reservas';
import { useLoadingOverlay } from '@/components/ui/loading-overlay';
import { useTicketAvailability } from '@/hooks';
import { getTicketAvailabilityStats } from '@/lib/database/utils/ticket-generator';

// Componente para el Paso 1: Cantidad de tickets
function PasoCantidad({ cantidad, setCantidad, precioTicket, rifaId }: {
  cantidad: number;
  setCantidad: (cantidad: number) => void;
  precioTicket: number;
  rifaId: string;
}) {
  const { ticketNumbers: opciones, loading, error } = useTicketNumbersFromContext(rifaId);
  const { availability, loading: loadingAvailability, error: availabilityError } = useTicketAvailability(rifaId);
  
  // Estado local para el input mientras se escribe
  const [inputValue, setInputValue] = useState(cantidad.toString());
  
  // Sincronizar inputValue cuando cambie cantidad desde otros lugares
  useEffect(() => {
    setInputValue(cantidad.toString());
  }, [cantidad]);

  // Mostrar loading mientras se cargan los números
  if (loading) {
    return (
      <div className="space-y-8 text-center">
        <h2 className="text-3xl font-bold text-white">¿Cuántos tickets quieres?</h2>
        <p className="text-xl text-slate-200">Cargando opciones...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay problema
  if (error) {
    return (
      <div className="space-y-8 text-center">
        <h2 className="text-3xl font-bold text-white">¿Cuántos tickets quieres?</h2>
        <p className="text-xl text-red-400">❌ {error}</p>
        <p className="text-sm text-slate-200">No se pueden cargar las opciones de tickets desde la base de datos</p>
        
        <div className="text-center">
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="px-6 py-3 border-white text-white hover:bg-white hover:text-slate-900"
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
      <div className="space-y-8 text-center">
        <h2 className="text-3xl font-bold text-white">¿Cuántos tickets quieres?</h2>
        <p className="text-xl text-slate-200">No hay opciones de tickets disponibles</p>
        <p className="text-sm text-slate-300">Contacta al administrador para configurar las opciones</p>
      </div>
    );
  }

  // Asegurar opciones únicas para evitar claves duplicadas
  const opcionesUnicas = Array.from(new Set(opciones));



  // Determinar máximo disponible (limitado a 250 por compra)
  const maxDisponible = Math.min(availability?.available || 999, 250);
  const hayTicketsDisponibles = maxDisponible > 0;

  // Función para incrementar cantidad
  const incrementarCantidad = () => {
    if (cantidad < maxDisponible) {
    setCantidad(cantidad + 1);
    } else {
      toast.warning(`Solo hay ${maxDisponible} tickets disponibles`);
    }
  };

  // Función para decrementar cantidad
  const decrementarCantidad = () => {
    const minimo = Math.min(...opcionesUnicas);
    if (cantidad > minimo) {
      setCantidad(cantidad - 1);
    }
  };

  // Función para validar cantidad seleccionada
  const handleCantidadChange = (nuevaCantidad: number) => {
    // Permitir cualquier valor durante la escritura, solo validar al final
    if (nuevaCantidad > maxDisponible) {
      toast.warning(`Solo hay ${maxDisponible} tickets disponibles`);
      setCantidad(maxDisponible);
    } else if (nuevaCantidad < Math.min(...opcionesUnicas)) {
      // Solo mostrar advertencia, no forzar el valor mínimo
      toast.warning(`La cantidad mínima recomendada es ${Math.min(...opcionesUnicas)} tickets`);
      setCantidad(nuevaCantidad); // Permitir el valor ingresado
    } else {
      setCantidad(nuevaCantidad);
    }
  };



  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-[#fb0413]">¿Cuántos tickets quieres?</h2>
        <p className="text-xl text-slate-200">Selecciona la cantidad de tickets para participar</p>
        
        {/* Información de disponibilidad */}
        {availability && (
          <div className="max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-green-300 text-3xl font-bold mb-2">
                  {availability.available}
                </div>
                <div className="text-green-200 text-sm font-medium flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Disponibles
                </div>
              </div>
              <div className="text-center">
                <div className="text-orange-300 text-3xl font-bold mb-2">
                  {availability.existing}
                </div>
                <div className="text-orange-200 text-sm font-medium flex items-center justify-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Reservados
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading de disponibilidad */}
        {loadingAvailability && (
          <div className="text-slate-300 text-sm">
            🔄 Verificando disponibilidad...
          </div>
        )}
        

      </div>

      {/* Cuadros de opciones predefinidas */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {opcionesUnicas
          .filter(opcion => opcion <= maxDisponible) // Solo mostrar opciones disponibles
          .map((opcion: number, idx: number) => (
          <button
            key={`${opcion}-${idx}`}
            onClick={() => handleCantidadChange(opcion)}
            disabled={!hayTicketsDisponibles}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 relative ${
              cantidad === opcion
                ? "border-[#fb0413] bg-[#fb0413]/20 text-white"
                : hayTicketsDisponibles 
                  ? "border-slate-300 hover:border-white/50 text-slate-200"
                  : "border-slate-500 text-slate-500 cursor-not-allowed opacity-50"
            }`}
          >
            {cantidad === opcion && (
              <div className="absolute inset-0 bg-[#fb0413]/10 rounded-2xl pointer-events-none"></div>
            )}
            <div className="text-2xl font-bold">{opcion}</div>
            <div className="text-sm text-slate-300">tickets</div>
            {opcion > maxDisponible && (
              <div className="absolute top-1 right-1 text-red-400 text-xs">❌</div>
            )}
          </button>
        ))}
        
        {/* Mensaje si no hay opciones disponibles */}
        {opcionesUnicas.every(opcion => opcion > maxDisponible) && (
          <div className="col-span-3 text-center text-slate-400 py-4">
            No hay opciones predefinidas disponibles con los tickets restantes
          </div>
        )}
      </div>

      {/* Selector numérico con botones + y - */}
      <div className="flex justify-center items-center space-x-6">
        <button
          onClick={decrementarCantidad}
          disabled={cantidad <= Math.min(...opcionesUnicas) || !hayTicketsDisponibles}
          className={`p-3 rounded-full border-2 transition-all duration-300 hover:scale-105 -mt-8 ${
            cantidad <= Math.min(...opcionesUnicas) || !hayTicketsDisponibles
              ? "border-slate-500 text-slate-500 cursor-not-allowed"
              : "border-white text-white hover:bg-white hover:text-slate-900"
          }`}
        >
          <Minus className="h-6 w-6" />
        </button>
        
        <div className="flex flex-col items-center justify-center mb-6 w-full">
          <input
            type="number"
            min={Math.min(...opcionesUnicas)}
            max={maxDisponible}
            value={inputValue}
            size={Math.max(inputValue.length, 3)}
            disabled={!hayTicketsDisponibles}
            onChange={(e) => {
              const newValue = e.target.value;
              setInputValue(newValue);
              
              // Permitir input vacío temporalmente para escribir
              if (newValue === '') {
                return;
              }
              
              const valor = parseInt(newValue);
              if (!isNaN(valor)) {
                // Permitir cualquier valor durante la escritura
                setCantidad(valor);
              }
            }}
            onBlur={(e) => {
              // Al perder el foco, validar y corregir si es necesario
              const valor = parseInt(e.target.value);
              if (isNaN(valor) || valor < Math.min(...opcionesUnicas)) {
                const minimo = Math.min(...opcionesUnicas);
                setCantidad(minimo);
                setInputValue(minimo.toString());
                toast.warning(`La cantidad mínima recomendada es ${minimo} tickets`);
              } else if (valor > maxDisponible) {
                setCantidad(maxDisponible);
                setInputValue(maxDisponible.toString());
                toast.warning(`Solo hay ${maxDisponible} tickets disponibles`);
              } else {
                // Valor válido, sincronizar input
                setInputValue(valor.toString());
              }
            }}
            onFocus={(e) => {
              // Al hacer foco, seleccionar todo el texto para facilitar la escritura
              e.target.select();
            }}
            className={`w-40 bg-transparent border-none text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-4 py-2 ${
              hayTicketsDisponibles 
                ? "text-white" 
                : "text-slate-500 cursor-not-allowed"
            }`}
          />
          <div className="text-sm text-slate-300 mt-1 text-center">tickets</div>
          {maxDisponible === 250 && (
            <div className="text-xs text-yellow-400 mt-1 text-center">(250 max)</div>
          )}
        </div>
        
        <button
          onClick={incrementarCantidad}
          disabled={cantidad >= maxDisponible || !hayTicketsDisponibles}
          className={`p-3 rounded-full border-2 transition-all duration-300 hover:scale-105 -mt-8 ${
            cantidad >= maxDisponible || !hayTicketsDisponibles
              ? "border-slate-500 text-slate-500 cursor-not-allowed"
              : "border-white text-white hover:bg-white hover:text-slate-900"
          }`}
        >
          <Plus className="h-6 w-6" />
        </button>
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
        <h2 className="text-3xl font-bold text-[#fb0413]">Método de pago</h2>
        <p className="text-xl text-slate-200">Elige tu método de pago</p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto mb-6">
        {metodos.map((metodo) => (
          <button
            key={metodo.id}
            onClick={() => setMetodoPago(metodo.id)}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 text-left relative ${
              metodoPago === metodo.id
                ? "border-[#fb0413] bg-[#fb0413]/20 text-white"
                : "border-slate-300 hover:border-white/50 text-slate-200"
            }`}
          >
            {metodoPago === metodo.id && (
              <div className="absolute inset-0 bg-[#fb0413]/10 rounded-2xl pointer-events-none"></div>
            )}
            <div className="mb-3 text-white">{metodo.icono}</div>
            <div className="text-xl font-bold mb-2">{metodo.nombre}</div>
            <div className="text-sm text-slate-300">{metodo.descripcion}</div>
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

  // Validaciones básicas
  const nombreValido = datos.nombre.trim().length >= 2;
  const cedulaDigitos = datos.cedula.replace(/\D/g, "");
  const cedulaValida = cedulaDigitos.length >= 6;
  const telefonoDigitos = datos.telefono.replace(/\D/g, "");
  const telefonoValido = telefonoDigitos.length >= 10;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim());

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-[#fb0413]">Datos personales</h2>
        <p className="text-xl text-slate-200">Completa tu información personal</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Nombre completo</label>
          <input
            type="text"
            value={datos.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder="Tu nombre completo"
            className={`w-full px-4 py-3 rounded-xl border ${datos.nombre && !nombreValido ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
          />
          {datos.nombre && !nombreValido && (
            <p className="text-red-400 text-xs mt-1">Ingresa al menos 2 caracteres.</p>
          )}
        </div>

                  <div>
            <label className="block text-sm font-medium text-white mb-2">Cédula</label>
            <input
              type="text"
              value={datos.cedula}
              onChange={(e) => handleChange("cedula", e.target.value)}
              placeholder="12345678"
              className={`w-full px-4 py-3 rounded-xl border ${datos.cedula && !cedulaValida ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
            />
            {datos.cedula && !cedulaValida && (
              <p className="text-red-400 text-xs mt-1">Cédula inválida. Solo números (mín. 6).</p>
            )}
          </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Teléfono</label>
          <input
            type="tel"
            value={datos.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            placeholder="0412-1234567"
            className={`w-full px-4 py-3 rounded-xl border ${datos.telefono && !telefonoValido ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
          />
          {datos.telefono && !telefonoValido && (
            <p className="text-red-400 text-xs mt-1">Teléfono inválido. Mínimo 10 dígitos.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Correo electrónico</label>
          <input
            type="email"
            value={datos.correo}
            onChange={(e) => handleChange("correo", e.target.value)}
            placeholder="tu@email.com"
            className={`w-full px-4 py-3 rounded-xl border ${datos.correo && !emailValido ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
          />
          {datos.correo && !emailValido && (
            <p className="text-red-400 text-xs mt-1">Correo electrónico inválido.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para el Paso 4: Datos del método de pago
function PasoDatosPago({ metodoPago, datosPago, setDatosPago, cantidad, precioTicket, tituloRifa, remainingMs }: {
  metodoPago: string;
  datosPago: DatosPago;
  setDatosPago: (datos: DatosPago) => void;
  cantidad: number;
  precioTicket: number;
  tituloRifa: string;
  remainingMs: number | null;
}) {
  
  // Función mejorada para manejar archivo con validación
  const handleArchivoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!tiposPermitidos.includes(file.type)) {
        toast.error('❌ Formato no permitido. Solo se aceptan: PNG, JPG, JPEG y PDF');
        event.target.value = ''; // Limpiar input
        return;
      }
      
      // Validar tamaño (35MB máximo)
      const tamañoMaximo = 35 * 1024 * 1024;
      if (file.size > tamañoMaximo) {
        toast.error('❌ Archivo demasiado grande. Máximo 35MB permitido');
        event.target.value = ''; // Limpiar input
        return;
      }
      
      // Archivo válido
      setDatosPago({ ...datosPago, comprobantePago: file });
      toast.success(`✅ Archivo cargado: ${file.name}`);
    }
  };

  // Validaciones para campos de pago según método
  const validarCamposPago = () => {
    switch (metodoPago) {
      case 'pago_movil':
        const telefonoDigitos = (datosPago.telefonoPago || '').replace(/\D/g, '');
        const telefonoValido = telefonoDigitos.length >= 7;
        const bancoValido = (datosPago.bancoPago || '').trim() !== '';
        const cedulaValida = (datosPago.cedulaPago || '').trim() !== '';
        const referenciaValida = (datosPago.referencia || '').trim() !== '';
        return { telefonoValido, bancoValido, cedulaValida, referenciaValida };
      
      case 'binance':
        const idBinanceValido = (datosPago.idBinance || '').trim() !== '';
        const referenciaValidaBinance = (datosPago.referencia || '').trim() !== '';
        return { idBinanceValido, referenciaValida: referenciaValidaBinance };
      
      case 'zelle':
        const correoZelleValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((datosPago.correoZelle || '').trim());
        const referenciaValidaZelle = (datosPago.referencia || '').trim() !== '';
        return { correoZelleValido, referenciaValida: referenciaValidaZelle };
      
      case 'zinli':
        const usuarioZinliValido = (datosPago.usuarioZinli || '').trim() !== '';
        const referenciaValidaZinli = (datosPago.referencia || '').trim() !== '';
        return { usuarioZinliValido, referenciaValida: referenciaValidaZinli };
      
      case 'paypal':
        const correoPaypalValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((datosPago.correoPaypal || '').trim());
        const referenciaValidaPaypal = (datosPago.referencia || '').trim() !== '';
        return { correoPaypalValido, referenciaValida: referenciaValidaPaypal };
      
      case 'efectivo':
        const fechaVisitaValida = (datosPago.fechaVisita || '').trim() !== '';
        return { fechaVisitaValida };
      
      default:
        return {};
    }
  };

  const validaciones = validarCamposPago();

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
            <div className="rounded-lg border border-slate-300 p-4 bg-white/10 backdrop-blur-sm">
              <div className="text-sm text-white space-y-2">
                <div className="font-medium">📱 Datos para Pago Móvil:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Teléfono:</strong> 0412-555-0123</span>
                  <button
                    onClick={() => copiarAlPortapapeles('0412-555-0123')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar teléfono"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Banco:</strong> Banco de Venezuela</span>
                  <button
                    onClick={() => copiarAlPortapapeles('Banco de Venezuela')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar banco"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Cédula:</strong> 12.345.678</span>
                  <button
                    onClick={() => copiarAlPortapapeles('12.345.678')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar cédula"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
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
              <label className="block text-sm font-medium text-white mb-2">Teléfono de pago</label>
              <input
                type="tel"
                value={datosPago.telefonoPago || ""}
                onChange={(e) => handleChange("telefonoPago", e.target.value)}
                placeholder="0412-1234567"
                className={`w-full px-4 py-3 rounded-xl border ${datosPago.telefonoPago && !validaciones.telefonoValido ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
              />
              {datosPago.telefonoPago && !validaciones.telefonoValido && (
                <p className="text-red-400 text-xs mt-1">Ingresa un teléfono válido (mínimo 7 dígitos).</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-white mb-2">Banco</label>
              <select
                value={datosPago.bancoPago || ""}
                onChange={(e) => handleChange("bancoPago", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${datosPago.bancoPago && !validaciones.bancoValido ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm appearance-none cursor-pointer`}
              >
                <option value="">Selecciona tu banco</option>
                {bancosVenezuela.map((banco) => (
                  <option key={banco} value={banco} className="text-slate-900">
                    {banco}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-slate-300" />
              </div>
              {datosPago.bancoPago && !validaciones.bancoValido && (
                <p className="text-red-400 text-xs mt-1">Selecciona tu banco.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Cédula de pago</label>
              <input
                type="text"
                value={datosPago.cedulaPago || ""}
                onChange={(e) => handleChange("cedulaPago", e.target.value)}
                placeholder="12345678"
                className={`w-full px-4 py-3 rounded-xl border ${datosPago.cedulaPago && !validaciones.cedulaValida ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
              />
              {datosPago.cedulaPago && !validaciones.cedulaValida && (
                <p className="text-red-400 text-xs mt-1">Ingresa la cédula de pago.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className={`w-full px-4 py-3 rounded-xl border ${datosPago.referencia && !validaciones.referenciaValida ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
              />
              {datosPago.referencia && !validaciones.referenciaValida && (
                <p className="text-red-400 text-xs mt-1">Ingresa la referencia de pago.</p>
              )}
            </div>

            {/* Input de comprobante SIMPLE */}
            <div className="space-y-3 mb-6">
              <div className="text-white font-medium">📎 Comprobante de Pago (Opcional)</div>
              <div className="text-xs text-slate-300 mb-2">Formatos permitidos: PNG, JPG, JPEG, PDF (máx. 35MB)</div>

              <input

                type="file"

                accept=".png,.jpg,.jpeg,.pdf"

                onChange={handleArchivoChange}

                className="w-full text-white bg-white/10 border border-white rounded p-3"

              />
              {datosPago.comprobantePago && (
                <div className="bg-green-900/50 border border-green-500 rounded p-3">
                  <div className="text-green-300">✅ Archivo cargado: {datosPago.comprobantePago.name}</div>
                  <div className="text-green-200 text-sm mt-1">Listo para subir</div>
                </div>
              )}
            </div>
          </div>
        );

      case "binance":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-300 p-4 bg-white/10 backdrop-blur-sm">
              <div className="text-sm text-white space-y-2">
                <div className="font-medium">💎 Datos para Binance:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Billetera:</strong> TRC20: TQn9Y2khDD8...</span>
                  <button
                    onClick={() => copiarAlPortapapeles('TQn9Y2khDD8...')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar billetera"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Red:</strong> TRC20 (Tron)</span>
                  <button
                    onClick={() => copiarAlPortapapeles('TRC20')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar red"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> ${((cantidad * precioTicket) / 145).toFixed(2)} USD</span>
                  <button
                    onClick={() => copiarAlPortapapeles(((cantidad * precioTicket) / 145).toFixed(2))}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nombre</label>
                              <input
                  type="text"
                  value={datosPago.idBinance || ""}
                  onChange={(e) => handleChange("idBinance", e.target.value)}
                  placeholder="Nombre del pagador"
                  className={`w-full px-4 py-3 rounded-xl border ${datosPago.idBinance && !validaciones.idBinanceValido ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
                />
                {datosPago.idBinance && !validaciones.idBinanceValido && (
                  <p className="text-red-400 text-xs mt-1">Ingresa el nombre del pagador.</p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className={`w-full px-4 py-3 rounded-xl border ${datosPago.referencia && !validaciones.referenciaValida ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
              />
              {datosPago.referencia && !validaciones.referenciaValida && (
                <p className="text-red-400 text-xs mt-1">Ingresa la referencia de pago.</p>
              )}
            </div>

            {/* Input de comprobante SIMPLE */}
            <div className="space-y-3 mb-6">
              <div className="text-white font-medium">📎 Comprobante de Pago (Opcional)</div>
              <div className="text-xs text-slate-300 mb-2">Formatos permitidos: PNG, JPG, JPEG, PDF (máx. 35MB)</div>

              <input

                type="file"

                accept=".png,.jpg,.jpeg,.pdf"

                onChange={handleArchivoChange}

                className="w-full text-white bg-white/10 border border-white rounded p-3"

              />
              {datosPago.comprobantePago && (
                <div className="bg-green-900/50 border border-green-500 rounded p-3">
                  <div className="text-green-300">✅ Archivo cargado: {datosPago.comprobantePago.name}</div>
                  <div className="text-green-200 text-sm mt-1">Listo para subir</div>
                </div>
              )}
            </div>
          </div>
        );

      case "zelle":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-300 p-4 bg-white/10 backdrop-blur-sm">
              <div className="text-sm text-white space-y-2">
                <div className="font-medium">💳 Datos para Zelle:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Correo:</strong> pagos@elevenrifas.com</span>
                  <button
                    onClick={() => copiarAlPortapapeles('pagos@elevenrifas.com')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar correo"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Nombre:</strong> Eleven Rifas</span>
                  <button
                    onClick={() => copiarAlPortapapeles('Eleven Rifas')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar nombre"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> ${((cantidad * precioTicket) / 145).toFixed(2)} USD</span>
                  <button
                    onClick={() => copiarAlPortapapeles(((cantidad * precioTicket) / 145).toFixed(2))}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nombre</label>
              <input
                type="email"
                value={datosPago.correoZelle || ""}
                onChange={(e) => handleChange("correoZelle", e.target.value)}
                placeholder="Nombre del pagador"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className={`w-full px-4 py-3 rounded-xl border ${datosPago.referencia && !validaciones.referenciaValida ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
              />
              {datosPago.referencia && !validaciones.referenciaValida && (
                <p className="text-red-400 text-xs mt-1">Ingresa la referencia de pago.</p>
              )}
            </div>

            {/* Input de comprobante SIMPLE */}
            <div className="space-y-3 mb-6">
              <div className="text-white font-medium">📎 Comprobante de Pago (Opcional)</div>
              <div className="text-xs text-slate-300 mb-2">Formatos permitidos: PNG, JPG, JPEG, PDF (máx. 35MB)</div>

              <input

                type="file"

                accept=".png,.jpg,.jpeg,.pdf"

                onChange={handleArchivoChange}

                className="w-full text-white bg-white/10 border border-white rounded p-3"

              />
              {datosPago.comprobantePago && (
                <div className="bg-green-900/50 border border-green-500 rounded p-3">
                  <div className="text-green-300">✅ Archivo cargado: {datosPago.comprobantePago.name}</div>
                  <div className="text-green-200 text-sm mt-1">Listo para subir</div>
                </div>
              )}
            </div>
          </div>
        );

        case "zinli":
          return (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-300 p-4 bg-white/10 backdrop-blur-sm">
                <div className="text-sm text-white space-y-2">
                  <div className="font-medium">📱 Datos para Zinli:</div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Usuario:</strong> @elevenrifas</span>
                    <button
                      onClick={() => copiarAlPortapapeles('@elevenrifas')}
                      className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copiar usuario"
                    >
                      <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Monto:</strong> {formatCurrencyVE(cantidad * precioTicket)}</span>
                    <button
                      onClick={() => copiarAlPortapapeles((cantidad * precioTicket).toString())}
                      className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copiar monto"
                    >
                      <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Referencia:</strong> Tu nombre + fecha</span>
                    <button
                      onClick={() => copiarAlPortapapeles('REF123456')}
                      className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copiar referencia"
                    >
                      <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nombre</label>
                <input
                  type="text"
                  value={datosPago.usuarioZinli || ""}
                  onChange={(e) => handleChange("usuarioZinli", e.target.value)}
                  placeholder="Nombre del pagador"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Referencia</label>
                <input
                  type="text"
                  value={datosPago.referencia || ""}
                  onChange={(e) => handleChange("referencia", e.target.value)}
                  placeholder="REF123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm"
                />
              </div>

              {/* Input de comprobante SIMPLE */}
              <div className="space-y-3 mb-6">
                <div className="text-white font-medium">📎 Comprobante de Pago (Opcional)</div>
                <div className="text-xs text-slate-300 mb-2">Formatos permitidos: PNG, JPG, JPEG, PDF (máx. 35MB)</div>

                <input

                  type="file"

                  accept=".png,.jpg,.jpeg,.pdf"

                  onChange={handleArchivoChange}

                  className="w-full text-white bg-white/10 border border-white rounded p-3"

                />
                {datosPago.comprobantePago && (
                  <div className="bg-green-900/50 border border-green-500 rounded p-3">
                    <div className="text-green-300">✅ Archivo: {datosPago.comprobantePago.name}</div>
                    {datosPago.comprobantePago.type.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(datosPago.comprobantePago)}
                        alt="Preview"
                        className="mt-2 max-w-full h-auto max-h-32 rounded"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );

        case "paypal":
          return (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-300 p-4 bg-white/10 backdrop-blur-sm">
                <div className="text-sm text-white space-y-2">
                  <div className="font-medium">💳 Datos para PayPal:</div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Correo:</strong> pagos@elevenrifas.com</span>
                    <button
                      onClick={() => copiarAlPortapapeles('pagos@elevenrifas.com')}
                      className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copiar correo"
                    >
                      <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Monto:</strong> ${((cantidad * precioTicket) / 145).toFixed(2)} USD</span>
                    <button
                      onClick={() => copiarAlPortapapeles(((cantidad * precioTicket) / 145).toFixed(2))}
                      className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copiar monto"
                    >
                      <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Referencia:</strong> Tu nombre + fecha</span>
                    <button
                      onClick={() => copiarAlPortapapeles('REF123456')}
                      className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copiar referencia"
                    >
                      <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nombre</label>
                <input
                  type="email"
                  value={datosPago.correoPaypal || ""}
                  onChange={(e) => handleChange("correoPaypal", e.target.value)}
                  placeholder="Nombre del pagador"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Referencia</label>
                <input
                  type="text"
                  value={datosPago.referencia || ""}
                  onChange={(e) => handleChange("referencia", e.target.value)}
                  placeholder="REF123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm"
                />
              </div>

              {/* Input de comprobante SIMPLE */}
              <div className="space-y-3 mb-6">
                <div className="text-white font-medium">📎 Comprobante de Pago (Opcional)</div>
                <div className="text-xs text-slate-300 mb-2">Formatos permitidos: PNG, JPG, JPEG, PDF (máx. 35MB)</div>

                <input

                  type="file"

                  accept=".png,.jpg,.jpeg,.pdf"

                  onChange={handleArchivoChange}

                  className="w-full text-white bg-white/10 border border-white rounded p-3"

                />
                {datosPago.comprobantePago && (
                  <div className="bg-green-900/50 border border-green-500 rounded p-3">
                    <div className="text-green-300">✅ Archivo: {datosPago.comprobantePago.name}</div>
                    {datosPago.comprobantePago.type.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(datosPago.comprobantePago)}
                        alt="Preview"
                        className="mt-2 max-w-full h-auto max-h-32 rounded"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );

        case "efectivo":
          return (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-300 p-4 bg-white/10 backdrop-blur-sm">
                <div className="text-sm text-white space-y-2">
                  <div className="font-medium">💵 Datos para Pago en Efectivo:</div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Dirección:</strong> Av. Principal #123, Caracas</span>
                    <button
                      onClick={() => copiarAlPortapapeles('Av. Principal #123, Caracas')}
                      className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copiar dirección"
                    >
                      <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Horario:</strong> Lunes a Viernes 9:00 AM - 6:00 PM</span>
                    <button
                      onClick={() => copiarAlPortapapeles('Lunes a Viernes 9:00 AM - 6:00 PM')}
                      className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copiar horario"
                    >
                      <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Monto:</strong> {formatCurrencyVE(cantidad * precioTicket)}</span>
                    <button
                      onClick={() => copiarAlPortapapeles((cantidad * precioTicket).toString())}
                      className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copiar monto"
                    >
                      <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• <strong>Contacto:</strong> 0412-555-0123</span>
                    <button
                      onClick={() => copiarAlPortapapeles('0412-555-0123')}
                      className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copiar contacto"
                    >
                      <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Fecha de visita</label>
                <input
                  type="date"
                  value={datosPago.fechaVisita || ""}
                  onChange={(e) => handleChange("fechaVisita", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm"
                />
              </div>
            </div>
          );

      case "zelle":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-300 p-4 bg-white/10 backdrop-blur-sm">
              <div className="text-sm text-white space-y-2">
                <div className="font-medium">💳 Datos para Zelle:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Email:</strong> pagos@elevenrifas.com</span>
                  <button
                    onClick={() => copiarAlPortapapeles('pagos@elevenrifas.com')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar email"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Banco:</strong> Bank of America</span>
                  <button
                    onClick={() => copiarAlPortapapeles('Bank of America')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar banco"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
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
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Banco de pago</label>
              <input
                type="text"
                value={datosPago.bancoZelle || ""}
                onChange={(e) => handleChange("bancoZelle", e.target.value)}
                placeholder="Tu banco"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className={`w-full px-4 py-3 rounded-xl border ${datosPago.referencia && !validaciones.referenciaValida ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
              />
              {datosPago.referencia && !validaciones.referenciaValida && (
                <p className="text-red-400 text-xs mt-1">Ingresa la referencia de pago.</p>
              )}
            </div>

            {/* Input de comprobante SIMPLE */}
            <div className="space-y-3 mb-6">
              <div className="text-white font-medium">📎 Comprobante de Pago (Opcional)</div>
              <div className="text-xs text-slate-300 mb-2">Formatos permitidos: PNG, JPG, JPEG, PDF (máx. 35MB)</div>

              <input

                type="file"

                accept=".png,.jpg,.jpeg,.pdf"

                onChange={handleArchivoChange}

                className="w-full text-white bg-white/10 border border-white rounded p-3"

              />
              {datosPago.comprobantePago && (
                <div className="bg-green-900/50 border border-green-500 rounded p-3">
                  <div className="text-green-300">✅ Archivo cargado: {datosPago.comprobantePago.name}</div>
                  <div className="text-green-200 text-sm mt-1">Listo para subir</div>
                </div>
              )}
            </div>
          </div>
        );

      case "zinli":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-300 p-4 bg-white/10 backdrop-blur-sm">
              <div className="text-sm text-white space-y-2">
                <div className="font-medium">⚡ Datos para Zinli:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Usuario:</strong> @elevenrifas</span>
                  <button
                    onClick={() => copiarAlPortapapeles('@elevenrifas')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar usuario"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> ${(cantidad * precioTicket / 145).toFixed(2)} USD</span>
                  <button
                    onClick={() => copiarAlPortapapeles((cantidad * precioTicket / 145).toFixed(2))}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nombre</label>
              <input
                type="text"
                value={datosPago.usuarioZinli || ""}
                onChange={(e) => handleChange("usuarioZinli", e.target.value)}
                placeholder="Nombre del pagador"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:ring-2 focus:ring-white backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className={`w-full px-4 py-3 rounded-xl border ${datosPago.referencia && !validaciones.referenciaValida ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
              />
              {datosPago.referencia && !validaciones.referenciaValida && (
                <p className="text-red-400 text-xs mt-1">Ingresa la referencia de pago.</p>
              )}
            </div>

            {/* Input de comprobante SIMPLE */}
            <div className="space-y-3 mb-6">
              <div className="text-white font-medium">📎 Comprobante de Pago (Opcional)</div>
              <div className="text-xs text-slate-300 mb-2">Formatos permitidos: PNG, JPG, JPEG, PDF (máx. 35MB)</div>

              <input

                type="file"

                accept=".png,.jpg,.jpeg,.pdf"

                onChange={handleArchivoChange}

                className="w-full text-white bg-white/10 border border-white rounded p-3"

              />
              {datosPago.comprobantePago && (
                <div className="bg-green-900/50 border border-green-500 rounded p-3">
                  <div className="text-green-300">✅ Archivo cargado: {datosPago.comprobantePago.name}</div>
                  <div className="text-green-200 text-sm mt-1">Listo para subir</div>
                </div>
              )}
            </div>
          </div>
        );

      case "paypal":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-300 p-4 bg-white/10 backdrop-blur-sm">
              <div className="text-sm text-white space-y-2">
                <div className="font-medium">💳 Datos para PayPal:</div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Email:</strong> pagos@elevenrifas.com</span>
                  <button
                    onClick={() => copiarAlPortapapeles('pagos@elevenrifas.com')}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar email"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>• <strong>Monto:</strong> ${(cantidad * precioTicket / 145).toFixed(2)} USD</span>
                  <button
                    onClick={() => copiarAlPortapapeles((cantidad * precioTicket / 145).toFixed(2))}
                    className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copiar monto"
                  >
                    <Copy className="h-4 w-4 text-white hover:text-slate-200" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nombre</label>
              <input
                type="email"
                value={datosPago.correoPaypal || ""}
                onChange={(e) => handleChange("correoPaypal", e.target.value)}
                placeholder="Nombre del pagador"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Referencia</label>
              <input
                type="text"
                value={datosPago.referencia || ""}
                onChange={(e) => handleChange("referencia", e.target.value)}
                placeholder="REF123456"
                className={`w-full px-4 py-3 rounded-xl border ${datosPago.referencia && !validaciones.referenciaValida ? 'border-red-500' : 'border-slate-300'} bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm`}
              />
              {datosPago.referencia && !validaciones.referenciaValida && (
                <p className="text-red-400 text-xs mt-1">Ingresa la referencia de pago.</p>
              )}
            </div>

            {/* Input de comprobante SIMPLE */}
            <div className="space-y-3 mb-6">
              <div className="text-white font-medium">📎 Comprobante de Pago (Opcional)</div>
              <div className="text-xs text-slate-300 mb-2">Formatos permitidos: PNG, JPG, JPEG, PDF (máx. 35MB)</div>

              <input

                type="file"

                accept=".png,.jpg,.jpeg,.pdf"

                onChange={handleArchivoChange}

                className="w-full text-white bg-white/10 border border-white rounded p-3"

              />
              {datosPago.comprobantePago && (
                <div className="bg-green-900/50 border border-green-500 rounded p-3">
                  <div className="text-green-300">✅ Archivo cargado: {datosPago.comprobantePago.name}</div>
                  <div className="text-green-200 text-sm mt-1">Listo para subir</div>
                </div>
              )}
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
              <label className="block text-sm font-medium text-white mb-2">Fecha de visita</label>
              <input
                type="date"
                value={datosPago.fechaVisita || ""}
                onChange={(e) => handleChange("fechaVisita", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Notas adicionales</label>
              <textarea
                value={datosPago.notas || ""}
                onChange={(e) => handleChange("notas", e.target.value)}
                placeholder="Información adicional sobre tu visita..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/10 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm resize-none"
              />
              {datosPago.referencia && !validaciones.referenciaValida && (
                <p className="text-red-400 text-xs mt-1">Ingresa la referencia de pago.</p>
              )}
            </div>

                        {/* Input de comprobante SIMPLE */}
            <div className="space-y-3 mb-6">
              <div className="text-white font-medium">📎 Comprobante de Pago (Opcional)</div>
              <div className="text-xs text-slate-300 mb-2">Formatos permitidos: PNG, JPG, JPEG, PDF (máx. 35MB)</div>

              <input

                type="file"

                accept=".png,.jpg,.jpeg,.pdf"

                onChange={handleArchivoChange}

                className="w-full text-white bg-white/10 border border-white rounded p-3"

              />
              {datosPago.comprobantePago && (
                <div className="bg-green-900/50 border border-green-500 rounded p-3">
                  <div className="text-green-300">✅ Archivo cargado: {datosPago.comprobantePago.name}</div>
                  <div className="text-green-200 text-sm mt-1">Listo para subir</div>
                </div>
              )}
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

  const formatMMSS = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-[#fb0413]">Datos del pago</h2>
        <p className="text-xl text-slate-200">Completa la información del método de pago seleccionado</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {remainingMs !== null && remainingMs > 0 && (
          <div className="mb-4 p-3 rounded-lg border border-amber-400/40 bg-amber-500/10 text-amber-300 text-sm text-center font-semibold">
            Reserva expira en <span className="font-bold">{formatMMSS(remainingMs)}</span>
          </div>
        )}
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
        <h2 className="text-3xl font-bold text-white">¡Pago Reportado!</h2>
        <p className="text-xl text-slate-200">Tu participación ha sido registrada exitosamente</p>
        <div className="bg-green-50/20 border border-green-200/50 rounded-lg p-4 max-w-lg mx-auto backdrop-blur-sm">
          <p className="text-green-300 text-sm leading-relaxed">
            📧 <strong>Recibirás tus tickets por correo electrónico</strong> una vez que tu pago haya sido verificado por nuestro equipo.
          </p>
          <p className="text-green-300 text-sm leading-relaxed mt-2">
            📧 <strong>Correo:</strong> {datosPersona.correo}
          </p>
          <p className="text-green-400 text-xs mt-2">
            ⏱️ El proceso de verificación puede tomar entre 24-48 horas
          </p>
        </div>
      </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Resumen de la Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-white">Rifa:</span>
                  <p className="text-slate-200">{rifa.titulo}</p>
                </div>
                <div>
                  <span className="font-medium text-white">Cantidad:</span>
                  <p className="text-slate-200">{cantidad} tickets</p>
                </div>
                <div>
                  <span className="font-medium text-white">Total:</span>
                  <p className="text-white font-semibold">{formatCurrencyVE(cantidad * rifa.precio_ticket)}</p>
                </div>
                <div>
                  <span className="font-medium text-white">Método:</span>
                  <p className="text-slate-200">{
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

          <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Datos del Participante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="font-medium text-white">Nombre:</span>
                  <p className="text-slate-200 break-words">{datosPersona.nombre}</p>
                </div>
                <div>
                  <span className="font-medium text-white">Cédula:</span>
                  <p className="text-slate-200 break-words">{datosPersona.cedula}</p>
                </div>
                <div>
                  <span className="font-medium text-white">Teléfono:</span>
                  <p className="text-slate-200 break-words">{datosPersona.telefono}</p>
                </div>
                <div>
                  <span className="font-medium text-white">Correo:</span>
                  <p className="text-slate-200 break-words">{datosPersona.correo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón para volver al inicio */}
          <div className="text-center pt-4">
            <Link href="/">
              <Button className="px-8 py-3 text-lg font-medium bg-gradient-to-r from-primary via-red-500 to-amber-500 bg-[length:200%_100%] animate-gradient-move">
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
  
  // Hook del loading overlay
  const { showLoading, hideLoading, updateMessage, LoadingComponent } = useLoadingOverlay();
  
  // Hook para disponibilidad de tickets
  const { availability, loading: loadingAvailability, error: availabilityError } = useTicketAvailability(rifaActiva?.id || '');
  
  // Estado para los 5 pasos - MOVIDO AL INICIO para evitar hooks condicionales
  const [pasoActual, setPasoActual] = useState(1);
  const [cantidad, setCantidad] = useState(0); // Se inicializará con el primer número disponible
  const [metodoPago, setMetodoPago] = useState("");
  const [datosPersona, setDatosPersona] = useState<DatosPersona>({
    nombre: "",
    cedula: "",
    telefono: "",
    correo: ""
  });
  const [datosPago, setDatosPago] = useState<DatosPago>({});
  const [reservaId, setReservaId] = useState<string | null>(null);
  const [reservaExpiresAt, setReservaExpiresAt] = useState<string | null>(null);
  const [reservaTicketIds, setReservaTicketIds] = useState<string[]>([]);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [reservaExpirada, setReservaExpirada] = useState(false);
  
  // Cargar localStorage en cliente sin afectar SSR
  const [lsInfo, setLsInfo] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
    try {
      setLsInfo(localStorage.getItem('rifaActiva') || 'vacío');
    } catch {}
  }, []);
  
  // Estado para el modal de términos y condiciones
  const [showTerminosModal, setShowTerminosModal] = useState(false);
  const [aceptadoTerminos, setAceptadoTerminos] = useState(false);
  
  // Evitar re-inicialización de cantidad
  const initializedRef = useRef(false);
  
  // Inicializar cantidad con el segundo número disponible de las opciones (recomendado)
  useEffect(() => {
    if (initializedRef.current) return;
    if (rifaActiva && rifaActiva.numero_tickets_comprar && Array.isArray(rifaActiva.numero_tickets_comprar)) {
      const opcionesOrdenadas = [...rifaActiva.numero_tickets_comprar].sort((a, b) => a - b);
      if (opcionesOrdenadas.length > 1) {
        setCantidad(opcionesOrdenadas[1]); // Segundo elemento (índice 1)
      } else if (opcionesOrdenadas.length > 0) {
        setCantidad(opcionesOrdenadas[0]); // Fallback al primero si solo hay uno
      }
      initializedRef.current = true;
    }
  }, [rifaActiva]);
  

  
  // Si no hay rifa activa, mostrar mensaje de error
  if (!rifaActiva) {

    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-800 via-gray-600 to-slate-200">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            ❌ No hay rifa seleccionada
          </h1>
          <p className="text-slate-200 mb-8">
            Por favor, selecciona una rifa desde la página principal
          </p>
          
          {/* Debug info */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg mb-4 text-left">
            <h3 className="font-semibold mb-2 text-white">🔍 Información de Debug:</h3>
            <p className="text-slate-200">Rifas en contexto: {rifas.length}</p>
            <p className="text-slate-200">Rifa activa: {rifaActiva ? (rifaActiva as Rifa).titulo : 'null'}</p>
            {/* Solo mostrar localStorage info después de la hidratación */}
            {isHydrated && lsInfo !== null && (
              <p className="text-slate-200">LocalStorage: {lsInfo}</p>
            )}
          </div>
          
          <Link href="/" className="text-white hover:text-slate-200 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  

  const rifa = rifaActiva!; // Ya se validó que rifaActiva no es null arriba

  // NUEVA FUNCIÓN: Reportar pago y crear tickets

  const reportarPagoYCrearTickets = async () => {
    try {
      console.log('🚀 INICIANDO REPORTE DE PAGO:', {
        rifa_id: rifa.id,
        rifa_titulo: rifa.titulo,
        cantidad,
        metodoPago,
        precio_ticket: rifa.precio_ticket,
        total_bs: rifa.precio_ticket * cantidad * 145,
        total_usd: rifa.precio_ticket * cantidad,
        reservaId,
        tieneComprobante: !!datosPago.comprobantePago,
        ticketsReservados: reservaTicketIds.length
      });

      // ✅ NO VALIDAR DISPONIBILIDAD SI YA HAY TICKETS RESERVADOS
      // Los tickets reservados ya están garantizados para este usuario
      if (reservaTicketIds.length === 0) {
        console.log('⚠️ NO HAY TICKETS RESERVADOS - Validando disponibilidad...');
        
        // Solo validar disponibilidad si NO hay reserva previa
        const statsRealtime = await getTicketAvailabilityStats(rifa.id, 5, rifa.total_tickets || 0);
        
        console.log('📊 DISPONIBILIDAD EN TIEMPO REAL:', {
          disponibles: statsRealtime.available,
          solicitados: cantidad,
          total: statsRealtime.total,
          existing: statsRealtime.existing
        });
        
        if (statsRealtime.available < cantidad) {
          const error = `Disponibilidad insuficiente en tiempo real. Solo hay ${statsRealtime.available} tickets disponibles, se solicitaron ${cantidad}`;
          console.error('❌ ERROR DE DISPONIBILIDAD EN TIEMPO REAL:', error);
          toast.error(error);
          return;
        }
        
        console.log('✅ DISPONIBILIDAD EN TIEMPO REAL CONFIRMADA - Continuando con el proceso');
      } else {
        console.log('✅ TICKETS YA RESERVADOS - Saltando validación de disponibilidad');
        console.log('🎫 Tickets reservados:', reservaTicketIds.length, 'IDs:', reservaTicketIds);
      }

      // Mostrar loading
      showLoading("Procesando pago...", "Por favor espera mientras procesamos tu pago");
      
      // Subir comprobante si hay uno seleccionado
      let comprobanteUrl = '';
      
      if (datosPago.comprobantePago) {
        try {
          updateMessage("Subiendo comprobante...", "Guardando tu comprobante de pago");
          
          console.log('📎 SUBIENDO COMPROBANTE:', {
            nombre: datosPago.comprobantePago.name,
            tamaño: datosPago.comprobantePago.size,
            tipo: datosPago.comprobantePago.type
          });
          
          // Crear nombre de carpeta limpio basado en el título de la rifa
          const nombreCarpeta = rifa.titulo
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Eliminar caracteres especiales
            .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
            .substring(0, 50); // Limitar longitud
          
          console.log('📁 CARPETA RIFA:', nombreCarpeta);
          
          const formData = new FormData();
          formData.append('file', datosPago.comprobantePago);
          formData.append('carpetaRifa', nombreCarpeta);
          formData.append('rifaId', rifa.id);
          
          const response = await fetch('/api/upload-comprobante', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ ERROR SUBIENDO ARCHIVO:', {
              status: response.status,
              statusText: response.statusText,
              errorText
            });
            throw new Error(`Error al subir archivo: ${response.status} ${response.statusText}`);
          }
          
          const result = await response.json();
          comprobanteUrl = result.ruta;
          console.log('✅ COMPROBANTE SUBIDO:', { ruta: comprobanteUrl });
          toast.success('Comprobante subido exitosamente');
        } catch (error) {
          console.error('❌ ERROR SUBIENDO ARCHIVO:', error);
          hideLoading();
          toast.error('Error al subir el comprobante. Intenta nuevamente.');
          return;
        }
      }

      // Preparar datos del pago
      const datosPagoCompleto: DatosPagoCompleto = {
        tipo_pago: metodoPago as 'pago_movil' | 'binance' | 'zelle' | 'zinli' | 'paypal' | 'efectivo',
        monto_usd: rifa.precio_ticket * cantidad,
        monto_bs: rifa.precio_ticket * cantidad * 145,
        tasa_cambio: 145,
        referencia: datosPago.referencia || `REF-${Date.now()}`,
        telefono_pago: datosPago.telefonoPago || datosPersona.telefono,
        banco_pago: datosPago.bancoPago,
        cedula_pago: datosPago.cedulaPago || datosPersona.cedula,
        fecha_visita: datosPago.fechaVisita,
        estado: 'pendiente',
        comprobante_url: comprobanteUrl || undefined,
        cantidad_tickets: cantidad,
        rifa_id: rifa.id,
        nombre: datosPersona.nombre,
        cedula: datosPersona.cedula,
        telefono: datosPersona.telefono,
        correo: datosPersona.correo,
        reserva_id: reservaId || undefined
      };

      console.log('📊 DATOS DEL PAGO PREPARADOS:', {
        ...datosPagoCompleto,
        comprobante_url: datosPagoCompleto.comprobante_url || 'N/A'
      });

      // Actualizar mensaje del loading
      updateMessage("Creando pago...", "Registrando tu pago en el sistema");
      
      console.log('🔄 LLAMANDO A reportarPagoConTickets...');
      const resultado = await reportarPagoConTickets(datosPagoCompleto);
      console.log('📋 RESULTADO DE reportarPagoConTickets:', resultado);

      if (resultado && resultado.success) {
        updateMessage("¡Pago exitoso!", "Tickets asignados correctamente");
        
        // Pequeña pausa para mostrar el éxito antes de ocultar
        setTimeout(() => {
          hideLoading();
        toast.success('Pago reportado exitosamente');
        setPasoActual(5);
        }, 1000);
      } else {
        hideLoading();
        toast.error('Error al reportar el pago');
      }

    } catch (error) {
      console.error('Error en reportarPagoYCrearTickets:', error);
      hideLoading();
      toast.error('Error al procesar el pago');
    }
  };

  const siguientePaso = async () => {
    // Mostrar términos y condiciones en el paso 1 (antes de continuar)
    if (pasoActual === 1 && !aceptadoTerminos) {
      setShowTerminosModal(true);
      return;
    }
    // Al pasar del paso 3→4, reservar tickets 5 min
    if (pasoActual === 3) {
      // Mostrar loading overlay para evitar acciones del usuario
      showLoading("Reservando tickets...", "Por favor espera mientras reservamos tus tickets por 10 minutos");
      
      try {
        const id = crypto.randomUUID();
        const participante = {
          nombre: datosPersona.nombre || 'Reservado',
          cedula: datosPersona.cedula || '0000000',
          telefono: datosPersona.telefono || '',
          correo: datosPersona.correo || ''
        };
        
        updateMessage("Creando reserva...", "Generando ID único y validando disponibilidad");
        
        const res = await reservarTickets(rifaActiva!.id, cantidad, id, participante);
        
        if (!res.success) {
          hideLoading();
          toast.error(res.error || 'No se pudieron reservar los tickets');
          return;
        }
        
        updateMessage("Reserva exitosa!", "Tickets reservados por 10 minutos");
        
        setReservaId(id);
        setReservaExpiresAt(res.expires_at || null);
        setReservaTicketIds(res.ticket_ids || []);
        
        // Pequeña pausa para mostrar el éxito antes de continuar
        setTimeout(() => {
          hideLoading();
          setPasoActual(pasoActual + 1);
        }, 1000);
        
        return; // No continuar aquí, ya se hace en el setTimeout
      } catch (error) {
        hideLoading();
        console.error('Error al reservar tickets:', error);
        toast.error('Error inesperado al reservar tickets. Intenta nuevamente.');
        return;
      }
    }
    
    // Si estamos en el paso 4 (Reportar Pago), ejecutar la lógica de crear pago
    if (pasoActual === 4) {
      await reportarPagoYCrearTickets();
      return;
    }
    
    // Solo continuar al siguiente paso si NO estamos en el paso 3 (ya se maneja ahí)
    if (pasoActual !== 3) {
      setPasoActual(pasoActual + 1);
    }
  };
  
  const pasoAnterior = () => setPasoActual(pasoActual - 1);
  
  const confirmarTerminos = () => {
    setAceptadoTerminos(true);
    setShowTerminosModal(false);
    // Ahora sí continuar al siguiente paso
    setPasoActual(pasoActual + 1);
  };

  // Cancelar reserva si el usuario sale antes de reportar pago
  useEffect(() => {
    return () => {
      if (reservaTicketIds.length) {
        cancelarReservaPorIds(reservaTicketIds);
      }
    };
  }, [reservaTicketIds]);

  // Contador de reserva (mm:ss) y expiración automática
  useEffect(() => {
    if (!reservaExpiresAt) {
      setRemainingMs(null);
      return;
    }
    const update = () => {
      const diff = new Date(reservaExpiresAt).getTime() - Date.now();
      setRemainingMs(diff > 0 ? diff : 0);
      if (diff <= 0 && reservaTicketIds.length) {
        cancelarReservaPorIds(reservaTicketIds);
        setReservaTicketIds([]);
        setReservaExpirada(true);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [reservaExpiresAt, reservaTicketIds]);

  // Redirección automática tras expirar la reserva
  useEffect(() => {
    if (!reservaExpirada) return;
    const t = setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    return () => clearTimeout(t);
  }, [reservaExpirada]);

  const formatMMSS = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Función para determinar si puede continuar al siguiente paso
  const puedeContinuar = (): boolean => {
    switch (pasoActual) {
      case 1: // Cantidad
        return cantidad > 0;
      case 2: // Método de pago
        return metodoPago !== "";
      case 3: // Datos de la persona
        {
          const nombreValido = datosPersona.nombre.trim().length >= 2;
          const cedulaValida = datosPersona.cedula.replace(/\D/g, "").length >= 6;
          const telefonoValido = datosPersona.telefono.replace(/\D/g, "").length >= 10;
          const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosPersona.correo.trim());
          return nombreValido && cedulaValida && telefonoValido && emailValido;
        }
      case 4: // Datos del pago
        // Validar campos requeridos por método; comprobante es opcional
        {
          const isNonEmpty = (v: string | undefined) => typeof v === 'string' && v.trim() !== '';
          const hasDigits = (v: string | undefined, min: number) => typeof v === 'string' && v.replace(/\D/g, '').length >= min;
          switch (metodoPago) {
            case 'pago_movil':
              return hasDigits((datosPago as any).telefonoPago, 7)
                && isNonEmpty((datosPago as any).bancoPago)
                && isNonEmpty((datosPago as any).cedulaPago)
                && isNonEmpty((datosPago as any).referencia);
            case 'binance':
              return isNonEmpty((datosPago as any).idBinance)
                && isNonEmpty((datosPago as any).referencia);
            case 'zelle':
              return isNonEmpty((datosPago as any).correoZelle)
                && isNonEmpty((datosPago as any).referencia);
            case 'zinli':
              return isNonEmpty((datosPago as any).usuarioZinli)
                && isNonEmpty((datosPago as any).referencia);
            case 'paypal':
              return isNonEmpty((datosPago as any).correoPaypal)
                && isNonEmpty((datosPago as any).referencia);
            case 'efectivo':
              return isNonEmpty((datosPago as any).fechaVisita);
            default:
              return false;
          }
        }
      default:
        return false;
    }
  };
  
  // Función para verificar si la cantidad excede la disponibilidad o el límite de 250
  const cantidadExcedeDisponibilidad = (): boolean => {
    if (!availability || !availability.available) return false;
    // Verificar tanto disponibilidad como límite de 250 tickets
    return cantidad > Math.min(availability.available, 250);
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
  
  // Función para obtener el mensaje de error del botón
  const getMensajeErrorBoton = (): string => {
    if (pasoActual === 1) {
      if (cantidad > 250) {
        return `No se pueden comprar más de 250 tickets`;
      }
      if (cantidadExcedeDisponibilidad()) {
        return `Solo hay ${availability?.available || 0} tickets disponibles`;
      }
    }
    return "";
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
            tituloRifa={rifa.titulo}
            remainingMs={remainingMs}
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-800 via-gray-600 to-slate-200">
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
              className="w-full sm:w-auto bg-gradient-to-r from-primary via-red-500 to-amber-500 bg-[length:200%_100%] animate-gradient-move"
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
        <div className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-black/30 border-t-2 border-white/40 shadow-2xl z-50 rounded-t-2xl">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col space-y-3">
                {/* Título de la rifa - Ahora arriba y con más espacio */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#fb0413] leading-tight">
                    {rifa.titulo}
                  </h3>
                </div>
                
                {/* Información de precios y temporizador de reserva */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1 text-sm">
                    {cantidad > 0 ? (
                      <>
                                                                          <div className={`font-semibold ${
                          cantidadExcedeDisponibilidad() ? 'text-red-300' : 'text-white'
                        }`}>
                          {formatCurrencyVE(rifa.precio_ticket)} × {cantidad}
                        </div>
                        <div className={`${
                          cantidadExcedeDisponibilidad() ? 'text-red-200' : 'text-slate-200'
                        }`}>
                          Tasa: 145 | ${(rifa.precio_ticket / 145).toFixed(2)} USD c/u
                        </div>
                                                  <div className={`font-semibold text-base ${
                          cantidadExcedeDisponibilidad() ? 'text-red-300' : 'text-white'
                        }`}>
                          Total: {formatCurrencyVE(cantidad * rifa.precio_ticket)}
                        </div>
                        <div className={`text-xs ${
                          cantidadExcedeDisponibilidad() ? 'text-red-200' : 'text-slate-300'
                        }`}>
                          Total USD: ${((cantidad * rifa.precio_ticket) / 145).toFixed(2)}
                        </div>
                        

                      </>
                    ) : (
                      <>
                        <div className="text-slate-200">
                          Precio: {formatCurrencyVE(rifa.precio_ticket)}
                        </div>
                        <div className="text-slate-200">
                          Tasa: 145 | ${(rifa.precio_ticket / 145).toFixed(2)} USD c/u
                        </div>
                        

                      </>
                    )}
                  </div>

                  {/* Botón de continuar */}
                  <div className="ml-6 space-y-2 text-right">

                    <Button 
                      onClick={siguientePaso}
                      disabled={!puedeContinuarConTerminos() || (remainingMs !== null && remainingMs <= 0) || cantidadExcedeDisponibilidad()}
                      className={`px-8 py-3 text-lg font-bold transition-all duration-300 ${
                        cantidadExcedeDisponibilidad() 
                          ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                          : 'bg-gradient-to-r from-primary via-red-500 to-amber-500 bg-[length:200%_100%] animate-gradient-move'
                      }`}
                    >
                      {getTextoBoton()}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    
                    {/* Mensaje de error del botón */}
                    {getMensajeErrorBoton() && (
                      <div className="text-red-300 text-xs max-w-48">
                        {getMensajeErrorBoton()}
                      </div>
                    )}
                    

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de reserva expirada */}
      {reservaExpirada && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm border border-red-400/40 rounded-xl p-6 text-center max-w-sm mx-auto">
            <div className="text-red-600 font-bold text-xl mb-2">Reserva expirada</div>
            <div className="text-slate-700 text-sm mb-4">Serás redirigido al inicio para comenzar de nuevo.</div>
            <Button onClick={() => (window.location.href = '/')} className="font-semibold">Ir al inicio ahora</Button>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      <LoadingComponent />
    </div>
  );
}

export default function ComprarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-800 via-gray-600 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-lg text-slate-200">Cargando...</p>
        </div>
      </div>
    }>
      <ComprarPageContent />
    </Suspense>
  );
}
