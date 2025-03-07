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
import { AppSidebar } from "./_components/app-sidebar";

export const metadata: Metadata = {
  title: "Gementar Team Tools",
  description: "Gementar Team Tools Collection",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // <html lang="en" className={`${GeistSans.variable}`}>
    //   <body>
    //     <TRPCReactProvider>{children}</TRPCReactProvider>
    //   </body>
    // </html>
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
      <SidebarProvider>
        <AppSidebar />
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
