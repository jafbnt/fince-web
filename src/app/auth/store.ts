import { create } from "zustand";
import { ClientHttp } from "@/lib/client-http";
import { getApiErrorMessage, isApiErrorEnvelope, isApiSuccess, type ApiErrorEnvelope } from "@/lib/api-envelope";
import { showApiMessage } from "@/components/shared/show-api-message";
import type { LoginFormValues, LoginSuccessBody, SignUpFormValues } from "./types";
import { AUTH_TOKEN_STORAGE_KEY } from "./types";

const getInitialToken = (): string | null => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

type AuthStore = {
  token: string | null;
  loadingLogin: boolean;
  loadingSignUp: boolean;
  errorLogin: string | null;
  errorSignUp: string | null;
  login: (payload: LoginFormValues) => Promise<void>;
  signUp: (payload: SignUpFormValues) => Promise<void>;
  logout: () => void;
};

const defaultState = {
  token: getInitialToken(),
  loadingLogin: false,
  loadingSignUp: false,
  errorLogin: null,
  errorSignUp: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...defaultState,
  login: async (payload: LoginFormValues): Promise<void> => {
    set({ loadingLogin: true, errorLogin: null });

    await new ClientHttp().post<unknown, ApiErrorEnvelope, LoginFormValues>(
      "/api/auth/login",
      payload,
      (result: unknown) => {
        if (isApiSuccess<LoginSuccessBody>(result)) {
          const token = result.body.token;
          if (!token) {
            set({ errorLogin: "Resposta inválida do servidor." });
            return;
          }
          localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
          set({ token, errorLogin: null });
          showApiMessage(result, { successMessage: "Login realizado com sucesso!" });
          return;
        }

        if (isApiErrorEnvelope(result)) {
          const msg = getApiErrorMessage(result);
          set({ errorLogin: msg });
          showApiMessage(result);
          return;
        }

        set({ errorLogin: "Resposta inválida do servidor." });
        showApiMessage(result);
      },
      (error: ApiErrorEnvelope) => {
        const msg = getApiErrorMessage(error);
        set({ errorLogin: msg });
        showApiMessage(error);
      },
      () => {
        set({ loadingLogin: false });
      },
    );
  },

  signUp: async (payload: SignUpFormValues): Promise<void> => {
    set({ loadingSignUp: true, errorSignUp: null });

    await new ClientHttp().post<unknown, ApiErrorEnvelope, SignUpFormValues>(
      "/api/auth/register",
      payload,
      (result: unknown) => {
        if (isApiSuccess(result)) {
          set({ errorSignUp: null });
          showApiMessage(result, {
            successMessage: "Conta criada com sucesso!",
          });
          return;
        }
        if (isApiErrorEnvelope(result)) {
          const msg = getApiErrorMessage(result);
          set({ errorSignUp: msg });
          showApiMessage(result);
          return;
        }
        set({ errorSignUp: null });
        showApiMessage(result);
      },
      (error: ApiErrorEnvelope) => {
        const msg = getApiErrorMessage(error);
        set({ errorSignUp: msg });
        showApiMessage(error);
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
