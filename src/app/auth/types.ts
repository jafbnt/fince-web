import { z } from "zod";

import type { ApiSuccess } from "@/lib/api-envelope";

export const AUTH_TOKEN_STORAGE_KEY = "@fince:auth:token";
export const AUTH_USER_STORAGE_KEY = "@fince:auth:user";

export const loginSchema = z.object({
  login: z.string().min(3, "Informe um login válido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export const signUpSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  login: z.string().min(3, "O login deve ter no mínimo 3 caracteres"),
  fullName: z.string().min(3, "Informe o nome completo"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  phone: z.string().min(10, "Informe um telefone válido"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;

export type AuthUser = {
  uuid: string;
  email: string;
  login: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  phone: string;
};

export type LoginSuccessBody = {
  user: AuthUser;
  token: string;
};

export type AuthLoginResponse = ApiSuccess<LoginSuccessBody>;

export type RegisterSuccessBody = {
  message?: string;
};

export type AuthRegisterResponse = ApiSuccess<RegisterSuccessBody>;
