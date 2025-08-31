import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
// import { iniciarLimpiezaAutomatica } from "@/lib/cron/limpiar-reservas"; // SISTEMA DE LIMPIEZA DESACTIVADO

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eleven Rifas",
  description: "Sistema de rifas online",
};

// SISTEMA DE LIMPIEZA AUTOMÁTICA DESACTIVADO
// if (typeof window === 'undefined') {
//   // Solo en el servidor
//   console.log('🚀 INICIANDO SISTEMA DE LIMPIEZA AUTOMÁTICA...');
//   iniciarLimpiezaAutomatica(2); // Cada 2 minutos
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
