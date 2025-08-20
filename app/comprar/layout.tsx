import { obtenerRifasActivas } from "@/lib/database";
import WithRifasLayout from "@/app/with-rifas-layout";

export default async function ComprarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener rifas activas desde la base de datos
  const rifas = await obtenerRifasActivas();

  return (
    <WithRifasLayout rifas={rifas}>
      {children}
    </WithRifasLayout>
  );
}
