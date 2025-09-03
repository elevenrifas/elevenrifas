"use client"

import { usePathname } from "next/navigation"
import {
  MoreHorizontal,
  Folder,
  Share2,
  Trash2,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
  title = "Documents",
}: {
  items: {
    name: string
    url: string
    icon: React.ComponentType<{ className?: string }>
  }[]
  title?: string
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url
          
          // Debug log
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 NavDocuments - ${item.name}:`, { 
              pathname, 
              itemUrl: item.url, 
              isActive 
            })
          }
          
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild
                isActive={isActive}
              >
                <a href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
