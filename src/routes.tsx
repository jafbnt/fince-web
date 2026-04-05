import { createElement, type ReactElement } from "react";
import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { AuthView } from "@/app/auth";
import { useAuthStore } from "@/app/auth/store";
import { DashboardLayout } from "@/app/dashboard";
import { ColorSystemView } from "@/app/dashboard/components/system/color";
import { LogoSystemView } from "@/app/dashboard/components/system/logo";
import { AccountTypeSystemView } from "@/app/dashboard/components/system/account-type";

function PublicOnlyRoute(): ReactElement {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return createElement(Navigate, { to: "/dashboard", replace: true });
  }

  return createElement(AuthView);
}

function RequireAuth(): ReactElement {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return createElement(Navigate, { to: "/login", replace: true });
  }

  return createElement(Outlet);
}

function FallbackRoute(): ReactElement {
  const token = useAuthStore((state) => state.token);
  return createElement(Navigate, { to: token ? "/dashboard" : "/login", replace: true });
}

export const router = createBrowserRouter([
  { path: "/login", element: createElement(PublicOnlyRoute) },
  { path: "/signup", element: createElement(PublicOnlyRoute) },
  {
    element: createElement(RequireAuth),
    children: [
      {
        path: "dashboard",
        element: createElement(DashboardLayout),
        children: [
          {
            index: true,
            element: createElement(Navigate, { to: "system/cores", replace: true }),
          },
          { path: "system/cores", element: createElement(ColorSystemView) },
          { path: "system/logos", element: createElement(LogoSystemView) },
          { path: "system/tipos-de-conta", element: createElement(AccountTypeSystemView) },
        ],
      },
    ],
  },
  { path: "*", element: createElement(FallbackRoute) },
]);
