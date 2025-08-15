import type { Metadata } from "next";
import "../app/globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Admin | ElevenRifas",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <div className="mx-auto max-w-screen-xl px-4 py-6">{children}</div>
    </div>
  );
}


