import type { Metadata } from "next";
import { ProtectedRouteSimple } from "../components/protected-route-simple";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AdminAuthProviderSimpleStorage } from "@/lib/context/AdminAuthContextSimpleStorage";
import "../styles/admin-theme.css";

export const metadata: Metadata = {
  title: "Admin | ElevenRifas",
  description: "Panel de administración de ElevenRifas - Súper Simple",
};

export default function AdminPanelLayoutSimple({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProviderSimpleStorage>
      <ProtectedRouteSimple>
        <div className="admin-theme dark">
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
      </ProtectedRouteSimple>
    </AdminAuthProviderSimpleStorage>
  );
}
