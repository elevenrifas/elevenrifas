"use client";

import { RifasProvider } from '@/lib/context/RifasContext';
import type { Rifa } from '@/types';

interface WithRifasLayoutProps {
  children: React.ReactNode;
  rifas: Rifa[];
}

export default function WithRifasLayout({ children, rifas }: WithRifasLayoutProps) {
  return (
    <RifasProvider rifas={rifas}>
      {children}
    </RifasProvider>
  );
}
