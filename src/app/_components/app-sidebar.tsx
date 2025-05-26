"use client"

import * as React from "react"
import {
  AudioWaveform,
  Bot,
  Command,
  Flame,
  LifeBuoy,
  Send,
  SquareTerminal,
  TestTube2,
  type LucideIcon,
} from "lucide-react"


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
import { useSession } from "next-auth/react"
import { NavSecondary } from "./nav-secondary"
import { PermissionList } from "@prisma/client";
import { api } from "~/trpc/react"

// This is sample data.
const data = {
  user: {
    name: "shadcns",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Hilmi's Tools",
      logo: Flame,
      plan: "Tools",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Reimbursement",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      permission: PermissionList.PAGE_PERMISSION_REIMBURSEMENT,
      items: [
        {
          title: "Dashboard",
          url: "/portal",
          permission: PermissionList.PAGE_PERMISSION_REIMBURSEMENT_DASHBOARD,
        },
        {
          title: "Manage Claim",
          url: "/portal/reimbursement/manage-claim",
          permission: PermissionList.PAGE_PERMISSION_REIMBURSEMENT_MANAGE_CLAIM,
        },
      ],
    },
    {
      title: "Admin",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Users",
          url: "#",
        },
        {
          title: "Claim Category",
          url: "#",
        },
        {
          title: "Assigned Claim",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "cypress report",
      url: "/portal/cypress-report-generator",
      icon: TestTube2,
    },
  ],
}

type MenuItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  permission?: PermissionList;
  items?: {
    title: string;
    url: string;
    permission?: PermissionList;
  }[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useSession();
  
  // Get all unique permissions from the menu items
  const getAllPermissions = React.useCallback(() => {
    const permissions = new Set<PermissionList>();
    
    data.navMain.forEach((item: MenuItem) => {
      if (item.permission) {
        permissions.add(item.permission);
      }
      item.items?.forEach(subItem => {
        if (subItem.permission) {
          permissions.add(subItem.permission);
        }
      });
    });

    return Array.from(permissions);
  }, []);

  // Get all permissions first
  const permissions = React.useMemo(() => getAllPermissions(), [getAllPermissions]);

  // Check all permissions at once
  const { data: permissionResults, isLoading: isPermissionLoading } = api.permission.checkMultiplePermissions.useQuery(
    { permissions: permissions.map(p => p.toString()) },
    { enabled: permissions.length > 0 }
  );

  // Filter navMain items based on permissions
  const filteredNavMain = React.useMemo(() => {
    if (!permissionResults) return data.navMain;

    return data.navMain.filter((item: MenuItem) => {
      // If item has no permission requirement, show it
      if (!item.permission) return true;
      
      // Check main menu permission
      if (!permissionResults[item.permission]) return false;

      // Filter sub-items based on their permissions
      if (item.items) {
        item.items = item.items.filter(subItem => {
          if (!subItem.permission) return true;
          return permissionResults[subItem.permission] ?? false;
        });

        // Only show menu if it has visible sub-items
        return item.items.length > 0;
      }

      return true;
    });
  }, [permissionResults]);

  if(!isPermissionLoading)
  {
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
          <NavProjects projects={data.projects} />
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    )
  }

}
