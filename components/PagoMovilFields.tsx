"use client";
import { useFormContext } from "react-hook-form";
import { RequiredInput } from "@/components/ui/required-input";

export function PagoMovilFields() {
  const { watch, setValue } = useFormContext();
  
  const pagoMovilData = watch("pagoMovil") || {};

  return (
    <div className="space-y-4">
      <RequiredInput
        label="Teléfono de pago"
        placeholder="0412-1234567"
        value={pagoMovilData.telefonoPago || ""}
        onChange={(value) => setValue("pagoMovil.telefonoPago", value)}
        error=""
      />

      <RequiredInput
        label="Banco"
        placeholder="Banco de Venezuela"
        value={pagoMovilData.bancoPago || ""}
        onChange={(value) => setValue("pagoMovil.bancoPago", value)}
        error=""
      />

      <RequiredInput
        label="Cédula de pago"
        placeholder="12345678"
        value={pagoMovilData.cedulaPago || ""}
        onChange={(value) => setValue("pagoMovil.cedulaPago", value)}
        error=""
      />

      <RequiredInput
        label="Referencia"
        placeholder="REF123456"
        value={pagoMovilData.referencia || ""}
        onChange={(value) => setValue("pagoMovil.referencia", value)}
        error=""
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Comprobante de pago
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setValue("pagoMovil.comprobante", file);
            }
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}


