import WithRifasLayout from "@/app/with-rifas-layout";
import { getRifasFull } from "@/lib/database/rifas";

export default async function ComprarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Incluir rifas activas y pausadas para que el contexto reconozca ambas
  const rifas = await getRifasFull();

  return (
    <WithRifasLayout rifas={rifas}>
      {children}
    </WithRifasLayout>
  );
}
