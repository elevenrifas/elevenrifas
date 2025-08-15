"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type RifaAdmin = {
  id: string;
  titulo: string;
  activa: boolean;
};

const MOCK_RIFAS: RifaAdmin[] = [
  { id: "luxcar-001", titulo: "Audi RS7 2023", activa: true },
  { id: "luxwatch-002", titulo: "Rolex Submariner", activa: true },
];

export default function AdminRifasPage() {
  const [rifas, setRifas] = useState<RifaAdmin[]>(MOCK_RIFAS);
  const [titulo, setTitulo] = useState("");

  function crearRifa() {
    setRifas((prev) => [{ id: crypto.randomUUID(), titulo, activa: true }, ...prev]);
    setTitulo("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Rifas</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Crear rifa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva rifa</DialogTitle>
            </DialogHeader>
            <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <DialogFooter>
              <Button onClick={crearRifa} disabled={!titulo.trim()}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rifas.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{r.titulo}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                  {r.activa ? "Activa" : "Cerrada"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button size="sm" variant="secondary">Editar</Button>
              <Button size="sm" variant="destructive">Cerrar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


