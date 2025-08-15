import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Rifas activas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">2</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">128</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pagos pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">7</div>
        </CardContent>
      </Card>
    </div>
  );
}


