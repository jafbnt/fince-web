import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Tag as TagMenuIcon, TagsIcon, WalletIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

export function NavMain() {
  const { pathname } = useLocation()
  const contasActive = pathname === "/dashboard/platform/contas"
  const categoriasActive = pathname === "/dashboard/platform/categorias"
  const tagsActive = pathname === "/dashboard/platform/tags"

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Contas" isActive={contasActive}>
            <Link to="/dashboard/platform/contas">
              <WalletIcon className="size-4" />
              <span>Contas</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Categorias" isActive={categoriasActive}>
            <Link to="/dashboard/platform/categorias">
              <TagsIcon className="size-4" />
              <span>Categorias</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Tags" isActive={tagsActive}>
            <Link to="/dashboard/platform/tags">
              <TagMenuIcon className="size-4" />
              <span>Tags</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
