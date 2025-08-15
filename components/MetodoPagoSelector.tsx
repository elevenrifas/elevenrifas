"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Wallet, Send } from "lucide-react";

type Props = {
  value?: "pago_movil" | "zelle" | "binance";
  onChange: (value: Props["value"]) => void;
};

export function MetodoPagoSelector({ value, onChange }: Props) {
  const handleValueChange = (newValue: string) => {
    onChange(newValue as "pago_movil" | "zelle" | "binance");
  };

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="h-11 w-full">
        <SelectValue placeholder="Seleccione un método de pago" />
      </SelectTrigger>
      <SelectContent className="w-[--radix-select-trigger-width]">
        <SelectItem value="pago_movil">
          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Pago Móvil</div>
        </SelectItem>
        <SelectItem value="zelle">
          <div className="flex items-center gap-2"><Send className="h-4 w-4" /> Zelle</div>
        </SelectItem>
        <SelectItem value="binance">
          <div className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Binance</div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}


