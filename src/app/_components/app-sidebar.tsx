"use client"

import * as React from "react"
import { Command } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { NavSecondary } from "./nav-secondary"
import { menuData, getFilteredMenu } from "~/app/_components/app-sidebar-data"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  initialPermissions: Record<string, boolean>;
}

export function AppSidebar({ initialPermissions, ...props }: AppSidebarProps) {
  const filteredNavMain = React.useMemo(() => {
    return getFilteredMenu(initialPermissions);
  }, [initialPermissions]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">XR Lunar</span>
                  <span className="truncate text-xs">Claim Management</span>
                  <span className="truncate text-xs text-muted-foreground">{new Date().toLocaleDateString('en-MY')}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavProjects projects={menuData.projects} />
        <NavSecondary items={menuData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={menuData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
