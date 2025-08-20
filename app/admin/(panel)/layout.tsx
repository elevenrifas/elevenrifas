import type { Metadata } from "next";
import { ProtectedRoute } from "../components/protected-route";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import "../styles/admin-theme.css";

export const metadata: Metadata = {
  title: "Admin | ElevenRifas",
  description: "Panel de administración de ElevenRifas",
};

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="admin-theme">
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {children}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}


