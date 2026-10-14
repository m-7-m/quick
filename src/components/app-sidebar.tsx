import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { sidebarMenuItems } from "@/constants/sidebar-menu"
import { IconSettings2 } from "@tabler/icons-react"
import { Link, useLocation } from "wouter"

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Quick"
              className="group-data-[collapsible=icon]:justify-center"
              render={
                <Link href="/">
                  <img
                    src="/quick.svg"
                    alt="Quick Logo"
                    className="size-8 shrink-0 group-data-[collapsible=icon]:size-4"
                  />
                  <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                    Quick
                  </span>
                </Link>
              }
            />
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
                    isActive={location[0] === item.href}
                    size="lg"
                    tooltip={item.label}
                    className="group-data-[collapsible=icon]:justify-center"
                    render={
                      <Link href={item.href}>
                        <item.icon className="size-6!" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
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
            <SidebarMenuButton
              size="lg"
              isActive={location[0] === "/settings"}
              tooltip="Settings"
              className="group-data-[collapsible=icon]:justify-center"
              render={
                <Link href="/settings">
                  <IconSettings2 className="size-6!" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Settings
                  </span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
