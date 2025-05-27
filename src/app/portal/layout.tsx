import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Separator } from "@radix-ui/react-separator";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "../_components/app-sidebar";
import { api } from "~/trpc/server";
import { getAllPermissions } from "~/app/_components/app-sidebar-data";

export const metadata: Metadata = {
  title: "XR Lunar's Tools",
  description: "XR ExtremeReach Lunar's Portal",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const permissions = getAllPermissions();
  const permissionResults = await api.permission.checkMultiplePermissions({
    permissions
  });

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
      <SidebarProvider>
          <AppSidebar initialPermissions={permissionResults} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
              </div>
            </header>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </SidebarInset>
      </SidebarProvider>
      </body>
    </html>
  );
}
