"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface PausedRifaModalProps {
  isOpen: boolean;
  onConfirm: () => void; // Acción para volver al inicio (padre se encarga del redirect y cerrar)
}

export function PausedRifaModal({ isOpen, onConfirm }: PausedRifaModalProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) return;

    // Reset countdown when modal opens
    setCountdown(5);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Navegar directamente sin tocar estado externo para evitar warnings del Router
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => { /* no cerrable */ }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Actualmente no está disponible
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Intente de nuevo más tarde.
          </DialogDescription>
        </DialogHeader>

        {/* Countdown */}
        <div className="text-center mb-4">
          <span className="text-sm text-gray-600">Volviendo al inicio en {countdown}s</span>
        </div>

        {/* Único botón */}
        <div className="flex">
          <Button
            onClick={onConfirm}
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
          >
            <Home className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
