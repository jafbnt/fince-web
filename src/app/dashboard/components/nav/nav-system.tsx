"use client";

import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FlagIcon, ImageIcon, PaletteIcon, ShapesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Cores", url: "/dashboard/system/cores", icon: PaletteIcon },
  { title: "Logos", url: "/dashboard/system/logos", icon: ImageIcon },
  { title: "Bandeiras", url: "/dashboard/system/bandeiras", icon: FlagIcon },
  { title: "Tipos de Conta", url: "/dashboard/system/tipos-de-conta", icon: ShapesIcon },
] as const;

export function NavSystem() {
  const { pathname } = useLocation();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Sistema</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const active = pathname === item.url;
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={active}>
                <Link to={item.url} className={cn(active && "font-medium")}>
                  <Icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
