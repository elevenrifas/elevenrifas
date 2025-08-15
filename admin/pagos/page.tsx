"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Pago = { id: string; usuario: string; rifa: string; referencia: string; estado: "pendiente" | "verificado" };

const MOCK_PAGOS: Pago[] = [
  { id: "p1", usuario: "Ana Torres", rifa: "Audi RS7 2023", referencia: "PM-123456", estado: "pendiente" },
  { id: "p2", usuario: "Carlos Pérez", rifa: "Rolex Submariner", referencia: "TR-999888", estado: "pendiente" },
];

export default function AdminPagosPage() {
  const [pagos, setPagos] = useState<Pago[]>(MOCK_PAGOS);

  function verificar(id: string) {
    setPagos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: "verificado" } : p)));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Pagos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pagos.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{p.usuario}</span>
                <span className="text-xs text-muted-foreground">{p.rifa}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm">Ref: {p.referencia}</div>
              {p.estado === "pendiente" ? (
                <Button size="sm" onClick={() => verificar(p.id)}>Verificar</Button>
              ) : (
                <div className="text-xs text-primary">Verificado</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


