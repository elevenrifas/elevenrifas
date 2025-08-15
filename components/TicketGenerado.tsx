"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Share2, Copy } from "lucide-react";
import { toast } from "sonner";
import { formatCurrencyVE } from "@/lib/formatters";

type TicketGeneradoProps = {
  rifaId: string;
  titulo: string;
  numeros: number[];
  precioTicket?: number;
  cantidad?: number;
  nombre: string;
  cedula: string;
  fecha: string;
  onClose?: () => void;
  isModal?: boolean;
};

export function TicketGenerado({
  rifaId,
  titulo,
  numeros,
  precioTicket = 0,
  cantidad = 1,
  nombre,
  cedula,
  fecha,
  onClose,
  isModal = true
}: TicketGeneradoProps) {
  const [copied, setCopied] = React.useState(false);

  const copiarTicket = async () => {
    const ticketText = `
🎫 TICKET GENERADO - ${titulo}

👤 Participante: ${nombre}
🆔 Cédula: ${cedula}
📅 Fecha: ${fecha}
🎲 Números: ${numeros.join(", ")}
💰 Precio por ticket: ${formatCurrencyVE(precioTicket)}
📊 Cantidad: ${cantidad} ticket(s)
💵 Total: ${formatCurrencyVE(precioTicket * cantidad)}

¡Buena suerte! 🍀
    `.trim();

    try {
      await navigator.clipboard.writeText(ticketText);
      setCopied(true);
      toast.success("Ticket copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error("Error al copiar el ticket");
    }
  };

  const descargarTicket = () => {
    // Crear un canvas para generar imagen del ticket
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Fondo
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, 800, 600);

    // Gradiente
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(20, 20, 760, 560);

    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎫 TICKET GENERADO', 400, 80);

    // Información de la rifa
    ctx.font = 'bold 24px Arial';
    ctx.fillText(titulo, 400, 120);

    // Separador
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 150);
    ctx.lineTo(700, 150);
    ctx.stroke();

    // Detalles del participante
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`👤 Participante: ${nombre}`, 100, 200);
    ctx.fillText(`🆔 Cédula: ${cedula}`, 100, 230);
    ctx.fillText(`📅 Fecha: ${fecha}`, 100, 260);

    // Números del ticket
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎲 NÚMEROS DEL TICKET:', 400, 320);
    
    // Mostrar números en una cuadrícula
    const numerosPorFila = 5;
    numeros.forEach((numero, index) => {
      const x = 200 + (index % numerosPorFila) * 80;
      const y = 360 + Math.floor(index / numerosPorFila) * 50;
      
      // Círculo del número
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, 2 * Math.PI);
      ctx.fill();
      
      // Número
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(numero.toString(), x, y + 6);
    });

    // Información del pago
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`💰 Precio por ticket: ${formatCurrencyVE(precioTicket)}`, 100, 480);
    ctx.fillText(`📊 Cantidad: ${cantidad} ticket(s)`, 100, 510);
    ctx.fillText(`💵 Total: ${formatCurrencyVE(precioTicket * cantidad)}`, 100, 540);

    // Convertir a imagen y descargar
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${rifaId}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Ticket descargado");
      }
    });
  };

  const ticketContent = (
    <Card className={isModal ? "w-full max-w-2xl max-h-[90vh] overflow-y-auto" : "w-full"}>
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
          <CheckCircle className="h-8 w-8" />
          <span className="text-2xl font-bold">¡Ticket Generado!</span>
        </div>
        <CardTitle className="text-xl text-muted-foreground">
          Tu participación ha sido registrada exitosamente
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Información de la rifa */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-primary mb-2">{titulo}</h3>
          <p className="text-sm text-muted-foreground">Rifa ID: {rifaId}</p>
        </div>

        {/* Números del ticket */}
        <div className="text-center">
          <h4 className="font-semibold mb-3">🎲 Números del Ticket:</h4>
          <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
            {numeros.map((numero, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg"
              >
                {numero}
              </div>
            ))}
          </div>
        </div>

        {/* Detalles del participante */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">👤 Participante:</span>
            <p className="text-muted-foreground">{nombre}</p>
          </div>
          <div>
            <span className="font-medium">🆔 Cédula:</span>
            <p className="text-muted-foreground">{cedula}</p>
          </div>
          <div>
            <span className="font-medium">📅 Fecha:</span>
            <p className="text-muted-foreground">{fecha}</p>
          </div>
          <div>
            <span className="font-medium">📊 Cantidad:</span>
            <p className="text-muted-foreground">{cantidad} ticket(s)</p>
          </div>
          {precioTicket > 0 && (
            <>
              <div>
                <span className="font-medium">💰 Precio por ticket:</span>
                <p className="text-muted-foreground">{formatCurrencyVE(precioTicket)}</p>
              </div>
              <div>
                <span className="font-medium">💵 Total:</span>
                <p className="text-primary font-semibold">{formatCurrencyVE(precioTicket * cantidad)}</p>
              </div>
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={copiarTicket}
            variant="outline"
            className="flex-1 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copiado!" : "Copiar Ticket"}
          </Button>
          <Button
            onClick={descargarTicket}
            variant="outline"
            className="flex-1 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar
          </Button>
          {isModal && onClose && (
            <Button
              onClick={onClose}
              className="flex-1 flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Cerrar
            </Button>
          )}
        </div>

        {/* Mensaje de buena suerte */}
        <div className="text-center pt-4 border-t">
          <p className="text-lg font-semibold text-primary">🍀 ¡Buena suerte!</p>
          <p className="text-sm text-muted-foreground">
            Guarda este ticket en un lugar seguro
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Si es modal, envolver en overlay
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        {ticketContent}
      </div>
    );
  }

  // Si no es modal, retornar solo el contenido
  return ticketContent;
}
