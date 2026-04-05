"use client";

import * as React from "react";
import {
  AudioLinesIcon,
  BookOpenIcon,
  BotIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  MapIcon,
  PieChartIcon,
  Settings2Icon,
  TerminalIcon,
  TerminalSquareIcon,
} from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    { name: "Acme Inc", logo: <GalleryVerticalEndIcon />, plan: "Empresarial" },
    { name: "Acme Corp.", logo: <AudioLinesIcon />, plan: "Inicial" },
    { name: "Evil Corp.", logo: <TerminalIcon />, plan: "Gratuito" },
  ],
  navMain: [
    {
      title: "Laboratório",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        { title: "Histórico", url: "#" },
        { title: "Favoritos", url: "#" },
        { title: "Configurações", url: "#" },
      ],
    },
    {
      title: "Modelos",
      url: "#",
      icon: <BotIcon />,
      items: [
        { title: "Genesis", url: "#" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },
    {
      title: "Documentação",
      url: "#",
      icon: <BookOpenIcon />,
      items: [
        { title: "Introdução", url: "#" },
        { title: "Comece Aqui", url: "#" },
        { title: "Tutoriais", url: "#" },
        { title: "Registro de Mudanças", url: "#" },
      ],
    },
    {
      title: "Configurações",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        { title: "Geral", url: "#" },
        { title: "Equipe", url: "#" },
        { title: "Faturamento", url: "#" },
        { title: "Limites", url: "#" },
      ],
    },
  ],
  projects: [
    { name: "Engenharia de Design", url: "#", icon: <FrameIcon /> },
    { name: "Vendas e Marketing", url: "#", icon: <PieChartIcon /> },
    { name: "Viagens", url: "#", icon: <MapIcon /> },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  onLogout: () => void;
};

export function AppSidebar({ onLogout, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
