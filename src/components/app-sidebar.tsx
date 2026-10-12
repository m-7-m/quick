import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { sidebarMenuItems } from "@/constants/sidebar-menu"
import { IconBrightness } from "@tabler/icons-react"
import { Link, useLocation } from "wouter"
import { ModeToggle } from "./mode-toggle"

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="bg-background!">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 p-4">
            <img src="/quick.svg" alt="Quick Logo" className="size-8" />
            <h3 className="text-2xl font-semibold">Quick</h3>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Primary Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarMenuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={location[0] === item.href ? true : false}
                    size="lg"
                    render={
                      <Link href={item.href}>
                        <item.icon className="size-6!" />
                        <span>{item.label}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <IconBrightness />
              <span>Theme</span>
            </SidebarMenuButton>
            <SidebarMenuAction>
              <ModeToggle />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
