import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginFormValues } from "../types"

type LoginProps = {
  loading: boolean
  apiError: string | null
  onSubmit: (payload: LoginFormValues) => Promise<void>
}

export function Login({ loading, apiError, onSubmit }: LoginProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  })

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Entrar na conta</h1>
          <p className="text-balance text-muted-foreground">Acesse com login e senha</p>
        </div>

        <Field>
          <FieldLabel htmlFor="login">Login</FieldLabel>
          <Input id="login" placeholder="neto" {...register("login")} />
          <FieldError errors={[errors.login]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input id="password" type="password" {...register("password")} />
          <FieldError errors={[errors.password]} />
        </Field>

        {apiError ? <FieldError>{apiError}</FieldError> : null}

        <Field>
          <Button type="submit" className="h-9 w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Não tem conta? <Link to="/signup">Criar conta</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
