"use client"

import {
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const handleLogout = () => {
    // Aquí implementarías la lógica de logout
    console.log('Logout clicked')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="relative">
        <SidebarMenuButton
          size="lg"
          className="flex items-center gap-3 pr-12"
        >
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </div>
        </SidebarMenuButton>
        <div
          className="absolute top-1.5 right-1.5 p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors cursor-pointer"
          onClick={handleLogout}
          title="Cerrar sesión"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleLogout()
            }
          }}
        >
          <LogOut className="size-4" />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
