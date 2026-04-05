"use client";

import * as React from "react";
import { AudioLinesIcon, GalleryVerticalEndIcon, TerminalIcon } from "lucide-react";

import { useAuthStore } from "@/app/auth/store";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavSystem } from "./nav-system";
import { NavUser } from "./nav-user";

const data = {
  teams: [
    { name: "Acme Inc", logo: <GalleryVerticalEndIcon />, plan: "Empresarial" },
    { name: "Acme Corp.", logo: <AudioLinesIcon />, plan: "Inicial" },
    { name: "Evil Corp.", logo: <TerminalIcon />, plan: "Gratuito" },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  onLogout: () => void;
};

export function AppSidebar({ onLogout, ...props }: AppSidebarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavSystem />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
