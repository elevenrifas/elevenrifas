"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  ListTodo,
  Users,
  CreditCard,
  Tags,
  UserCheck,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
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
      title: "Rifas",
      url: "/admin/rifas",
      icon: FileText,
    },
    {
      title: "Pagos",
      url: "/admin/pagos",
      icon: CreditCard,
    },
    {
      title: "Tickets",
      url: "/admin/tickets",
      icon: ListTodo,
    },

    {
      title: "Clientes",
      url: "/admin/clientes",
      icon: Users,
    },


  ],

  administration: [
    {
      name: "Usuario Verificación",
      url: "/admin/usuarios-verificacion",
      icon: UserCheck,
    },
    {
      name: "Categorías",
      url: "/admin/categorias",
      icon: Tags,
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
              className="data-[slot=sidebar-menu-button]:!p-4 !h-20 !min-h-20"
              isActive={pathname === "/admin/rifas"}
            >
              <a href="/admin/rifas" className="flex items-center justify-center h-full">
                <img 
                  src="/E_LOGOb.png" 
                  alt="ElevenRifas Logo" 
                  className="h-16 w-auto object-contain"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.administration} title="Administración" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
