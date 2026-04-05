import { z } from "zod"

export const AUTH_TOKEN_STORAGE_KEY = "@fince:auth:token"

export const loginSchema = z.object({
  login: z.string().min(3, "Informe um login válido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
})

export const signUpSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  login: z.string().min(3, "O login deve ter no mínimo 3 caracteres"),
  fullName: z.string().min(3, "Informe o nome completo"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  phone: z.string().min(10, "Informe um telefone válido"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignUpFormValues = z.infer<typeof signUpSchema>

export type AuthLoginResponse = {
  token?: string
  accessToken?: string
}

export type AuthRegisterResponse = {
  message?: string
}

export type HttpErrorDefault = {
  message?: string
}

export type AuthStore = {
  token: string | null
  loadingLogin: boolean
  loadingSignUp: boolean
  errorLogin: string | null
  errorSignUp: string | null
  login: (payload: LoginFormValues) => Promise<void>
  signUp: (payload: SignUpFormValues) => Promise<void>
  logout: () => void
}
