import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MOCK = [
  { id: "1", nombre: "Ana Torres", rifa: "Audi RS7 2023" },
  { id: "2", nombre: "Carlos Pérez", rifa: "Rolex Submariner" },
  { id: "3", nombre: "María García", rifa: "Audi RS7 2023" },
];

export default function AdminUsuariosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Usuarios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK.map((u) => (
          <Card key={u.id}>
            <CardHeader>
              <CardTitle>{u.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Rifa: {u.rifa}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


