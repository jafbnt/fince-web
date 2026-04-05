import { create } from "zustand";
import { ClientHttp } from "@/lib/client-http";
import type {
  AuthLoginResponse,
  AuthRegisterResponse,
  AuthStore,
  HttpErrorDefault,
  LoginFormValues,
  SignUpFormValues,
} from "./types";
import { AUTH_TOKEN_STORAGE_KEY } from "./types";

const getInitialToken = (): string | null => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

const getErrorMessage = (error: HttpErrorDefault): string => error.message ?? "Não foi possível completar a operação.";

const extractToken = (response: AuthLoginResponse): string | null => response.token ?? response.accessToken ?? null;

export const useAuthStore = create<AuthStore>((set) => ({
  token: getInitialToken(),
  loadingLogin: false,
  loadingSignUp: false,
  errorLogin: null,
  errorSignUp: null,

  login: async (payload: LoginFormValues): Promise<void> => {
    set({ loadingLogin: true, errorLogin: null });

    await new ClientHttp().post<AuthLoginResponse, HttpErrorDefault, LoginFormValues>(
      "/api/auth/login",
      payload,
      (result: AuthLoginResponse) => {
        const token = extractToken(result);

        if (!token) {
          set({ errorLogin: "Resposta inválida do servidor." });
          return;
        }

        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
        set({ token });
      },
      (error: HttpErrorDefault) => {
        set({ errorLogin: getErrorMessage(error) });
      },
      () => {
        set({ loadingLogin: false });
      },
    );
  },

  signUp: async (payload: SignUpFormValues): Promise<void> => {
    set({ loadingSignUp: true, errorSignUp: null });

    await new ClientHttp().post<AuthRegisterResponse, HttpErrorDefault, SignUpFormValues>(
      "/auth/register",
      payload,
      () => {
        set({ errorSignUp: null });
      },
      (error: HttpErrorDefault) => {
        set({ errorSignUp: getErrorMessage(error) });
      },
      () => {
        set({ loadingSignUp: false });
      },
    );
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    set({ token: null });
  },
}));
