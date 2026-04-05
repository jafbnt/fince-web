import { createElement, type ReactElement } from "react"
import { Navigate, createBrowserRouter } from "react-router-dom"
import { AuthView } from "@/app/auth"
import { useAuthStore } from "@/app/auth/store"
import { DashboardView } from "@/app/dashboard"

function PublicOnlyRoute(): ReactElement {
  const token = useAuthStore((state) => state.token)

  if (token) {
    return createElement(Navigate, { to: "/dashboard", replace: true })
  }

  return createElement(AuthView)
}

function PrivateRoute(): ReactElement {
  const token = useAuthStore((state) => state.token)

  if (!token) {
    return createElement(Navigate, { to: "/login", replace: true })
  }

  return createElement(DashboardView)
}

function FallbackRoute(): ReactElement {
  const token = useAuthStore((state) => state.token)
  return createElement(Navigate, { to: token ? "/dashboard" : "/login", replace: true })
}

export const router = createBrowserRouter([
  { path: "/login", element: createElement(PublicOnlyRoute) },
  { path: "/signup", element: createElement(PublicOnlyRoute) },
  { path: "/dashboard", element: createElement(PrivateRoute) },
  { path: "*", element: createElement(FallbackRoute) },
])
