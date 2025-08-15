import Navbar from "@/components/Navbar";
import { RifaClientSection } from "@/components/RifaClientSection";
import type { Rifa } from "@/types";

const rifa: Rifa = {
  id: "toyota-4runner-2022",
  titulo: "Rifa: Toyota 4Runner 2022",
  descripcion: "Participa por un Toyota 4Runner 2022. SUV robusto y confiable para cualquier terreno.",
  precioTicket: 752,
  imagen: "/images/2022_Toyota_4Runner_TRD_Pro_Lime_Rush_001.jpeg",
  activa: true,
};

export default function RifaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <RifaClientSection rifas={[rifa]} />
      </main>
    </div>
  );
}


