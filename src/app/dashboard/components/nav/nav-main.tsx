import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  CircleDollarSignIcon,
  CreditCardIcon,
  Tag as TagMenuIcon,
  TagsIcon,
  TrendingDownIcon,
  WalletIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function NavMain() {
  const { pathname } = useLocation();
  const receitasActive = pathname === "/dashboard/platform/receitas";
  const despesasActive = pathname === "/dashboard/platform/despesas";
  const despesasCartaoActive = pathname === "/dashboard/platform/despesas-cartao";
  const contasActive = pathname === "/dashboard/platform/contas";
  const cartoesCreditoActive = pathname === "/dashboard/platform/cartoes-credito";
  const categoriasActive = pathname === "/dashboard/platform/categorias";
  const tagsActive = pathname === "/dashboard/platform/tags";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Receitas" isActive={receitasActive}>
            <Link to="/dashboard/platform/receitas">
              <CircleDollarSignIcon className="size-4" />
              <span>Receitas</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Despesas" isActive={despesasActive}>
            <Link to="/dashboard/platform/despesas">
              <TrendingDownIcon className="size-4" />
              <span>Despesas</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip="Despesas cartão de crédito"
            isActive={despesasCartaoActive}
          >
            <Link to="/dashboard/platform/despesas-cartao">
              <CreditCardIcon className="size-4" />
              <span>Despesas cartão de crédito</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Contas" isActive={contasActive}>
            <Link to="/dashboard/platform/contas">
              <WalletIcon className="size-4" />
              <span>Contas</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Cartões de crédito" isActive={cartoesCreditoActive}>
            <Link to="/dashboard/platform/cartoes-credito">
              <CreditCardIcon className="size-4" />
              <span>Cartões de crédito</span>
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
  );
}
