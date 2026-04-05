import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUpSchema, type SignUpFormValues } from "../types"

type SignUpProps = {
  loading: boolean
  apiError: string | null
  onSubmit: (payload: SignUpFormValues) => Promise<void>
}

export function SignUp({ loading, apiError, onSubmit }: SignUpProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      login: "",
      fullName: "",
      password: "",
      phone: "",
    },
  })

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-balance text-muted-foreground">Preencha os dados para registrar usuário</p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input id="email" type="email" placeholder="neto@example.com" {...register("email")} />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="login">Login</FieldLabel>
          <Input id="login" placeholder="neto" {...register("login")} />
          <FieldError errors={[errors.login]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="fullName">Nome completo</FieldLabel>
          <Input id="fullName" placeholder="Dev Neto" {...register("fullName")} />
          <FieldError errors={[errors.fullName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input id="password" type="password" {...register("password")} />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Telefone</FieldLabel>
          <Input id="phone" placeholder="32999969795" {...register("phone")} />
          <FieldError errors={[errors.phone]} />
        </Field>

        {apiError ? <FieldError>{apiError}</FieldError> : null}

        <Field>
          <Button type="submit" className="h-9 w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Cadastrar"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Já tem conta? <Link to="/login">Entrar</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
