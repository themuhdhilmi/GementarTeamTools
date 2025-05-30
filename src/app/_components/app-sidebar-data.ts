import {
  AudioWaveform,
  Bot,
  Command,
  Flame,
  LifeBuoy,
  Send,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react"
import { PermissionList } from "@prisma/client";

export type MenuSubItem = {
  title: string;
  url: string;
  permission?: PermissionList;
};

export type MenuItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  permission?: PermissionList;
  items?: MenuSubItem[];
};

export const menuData = {
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
      title: "Admin",
      url: "#",
      icon: Bot,
      isActive: true,
      permission: PermissionList.PAGE_PERMISSION_ADMIN,
      items: [
        {
          title: "Group Settings",
          url: "/portal/admin/group-settings",
          permission: PermissionList.PAGE_PERMISSION_GROUP_SETTINGS,
        },
        {
          title: "User Settings",
          url: "/portal/admin/user-settings",
          permission: PermissionList.PAGE_PERMISSION_USER_SETTINGS,
        },
      ],
    },
    {
      title: "Cypress Report",
      url: "#",
      icon: Bot,
      isActive: true,
      permission: PermissionList.PAGE_PERMISSION_CYPRESS_REPORT,
      items: [
        {
          title: "Cypress Report",
          url: "/portal/cypress-report-generator",
          permission: PermissionList.PAGE_PERMISSION_CYPRESS_REPORT,
        },
        {
          title: "Report Manager",
          url: "/portal/report-manager",
          permission: PermissionList.PAGE_PERMISSION_CYPRESS_REPORT,
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
  projects: [],
};

export function getAllPermissions() {
  const permissions = new Set<PermissionList>();
  
  menuData.navMain.forEach(item => {
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
}

export function getFilteredMenu(permissions: Record<string, boolean>): MenuItem[] {
  return menuData.navMain.filter(item => {
    if (!item.permission) return true;
    
    if (!permissions[item.permission]) return false;

    if (item.items) {
      const filteredItems = item.items.filter(subItem => {
        if (!subItem.permission) return true;
        return permissions[subItem.permission] ?? false;
      });

      if (filteredItems.length === 0) return false;

      Object.assign(item, { items: filteredItems });
    }
    return true;
  });
} 