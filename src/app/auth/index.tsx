import { useState } from "react"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { FieldDescription } from "@/components/ui/field"
import { Login } from "./components/Login"
import { SignUp } from "./components/SignUp"
import { useAuthStore } from "./store"

export function AuthView({ className, ...props }: React.ComponentProps<"div">) {
  const location = useLocation()
  const isLoginRoute = location.pathname === "/login"
  const [showSidePanel] = useState(true)

  const login = useAuthStore((state) => state.login)
  const signUp = useAuthStore((state) => state.signUp)
  const loadingLogin = useAuthStore((state) => state.loadingLogin)
  const loadingSignUp = useAuthStore((state) => state.loadingSignUp)
  const errorLogin = useAuthStore((state) => state.errorLogin)
  const errorSignUp = useAuthStore((state) => state.errorSignUp)

  const helperText = isLoginRoute ? "Faça login para continuar" : "Crie sua conta para começar"

  return (
    <div
      className={cn(
        "dark flex min-h-screen items-center justify-center bg-background px-4 py-6 text-foreground md:px-6",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6">
        <Card className="overflow-hidden border-border bg-card p-0 shadow-2xl shadow-black/30">
          <CardContent className="grid p-0 md:grid-cols-[1fr_1.08fr]">
            {isLoginRoute ? (
              <Login loading={loadingLogin} apiError={errorLogin} onSubmit={login} />
            ) : (
              <SignUp loading={loadingSignUp} apiError={errorSignUp} onSubmit={signUp} />
            )}
            {showSidePanel ? (
              <div className="relative hidden border-l border-border bg-muted md:flex">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.768_0.233_130.85/0.18),transparent_60%)]" />
                <div className="relative z-10 m-auto rounded-4xl border border-border p-5 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 8h18" />
                    <path d="M8 15h3" />
                  </svg>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <FieldDescription className="px-6 text-center">
          {helperText}.
        </FieldDescription>
      </div>
    </div>
  )
}
