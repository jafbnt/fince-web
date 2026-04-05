import { Link, Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/app/dashboard/components/nav/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/app/auth/store";

const pathTitles: Record<string, string> = {
  "/dashboard": "Início",
  "/dashboard/system/cores": "Cores",
  "/dashboard/system/logos": "Logos",
  "/dashboard/system/tipos-de-conta": "Tipos de Conta",
};

function breadcrumbForPath(pathname: string): { parent?: string; current: string } {
  if (pathname.startsWith("/dashboard/system/")) {
    return {
      parent: "Sistema",
      current: pathTitles[pathname] ?? "Sistema",
    };
  }
  return { current: pathTitles[pathname] ?? "Painel" };
}

export function DashboardLayout() {
  const logout = useAuthStore((state) => state.logout);
  const { pathname } = useLocation();
  const { parent, current } = breadcrumbForPath(pathname);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider>
        <AppSidebar onLogout={logout} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center justify-between gap-4 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 shrink-0" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link to="/dashboard">Painel</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {parent ? (
                      <>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem className="hidden md:block">
                          <span className="text-muted-foreground">{parent}</span>
                        </BreadcrumbItem>
                      </>
                    ) : null}
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{current}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <ModeToggle />
            </div>
          </header>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
