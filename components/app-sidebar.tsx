"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  LayoutDashboard,
  Database,
  FileText,
  Home,
  ListTodo,
  Settings,
  Users,
  CreditCard,
  Tags,
  UserCheck,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@elevenrifas.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Rifas",
      url: "/admin/rifas",
      icon: FileText,
    },
    {
      title: "Tickets",
      url: "/admin/tickets",
      icon: ListTodo,
    },
    {
      title: "Categorías",
      url: "/admin/categorias",
      icon: Tags,
    },
    {
      title: "Usuarios",
      url: "/admin/usuarios",
      icon: Users,
    },
    {
      title: "Perfiles",
      url: "/admin/perfiles",
      icon: UserCheck,
    },
    {
      title: "Pagos",
      url: "/admin/pagos",
      icon: CreditCard,
    },
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
  documents: [
    {
      name: "Reportes",
      url: "/admin/reportes",
      icon: BarChart3,
    },
    {
      name: "Base de Datos",
      url: "/admin/database",
      icon: Database,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              isActive={pathname === "/admin/dashboard"}
            >
              <a href="/admin/dashboard">
                <Home className="!size-5" />
                <span className="text-base font-semibold">ElevenRifas</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
