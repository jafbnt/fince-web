import { create } from "zustand";
import { ClientHttp } from "@/lib/client-http";
import {
  getApiErrorMessage,
  isApiErrorEnvelope,
  isApiSuccess,
  type ApiErrorEnvelope,
} from "@/lib/api-envelope";
import { showApiMessage } from "@/components/shared/show-api-message";
import { toast } from "sonner";
import type { Account, CreateAccountPayload } from "./type";

type AccountStore = {
  accounts: Account[];
  loadingList: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchAccounts: () => Promise<void>;
  fetchAccountByUuid: (uuid: string) => Promise<Account | null>;
  createAccount: (payload: CreateAccountPayload) => Promise<boolean>;
  updateAccount: (uuid: string, payload: CreateAccountPayload) => Promise<boolean>;
  deleteAccount: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  accounts: [] as Account[],
  loadingList: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useAccountStore = create<AccountStore>((set, get) => ({
  ...defaultState,

  fetchAccounts: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/accounts",
      (result: unknown) => {
        if (isApiSuccess<Account[]>(result) && Array.isArray(result.body)) {
          set({ accounts: result.body });
          return;
        }
        if (isApiErrorEnvelope(result)) {
          showApiMessage(result);
          return;
        }
        showApiMessage(result);
      },
      (error: ApiErrorEnvelope) => {
        showApiMessage(error);
      },
      () => {
        set({ loadingList: false });
      },
    );
  },

  fetchAccountByUuid: async (uuid: string): Promise<Account | null> => {
    return await new Promise<Account | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/accounts/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<Account>(result)) {
            resolve(result.body);
            return;
          }
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(null);
            return;
          }
          showApiMessage(result);
          resolve(null);
        },
        (error: ApiErrorEnvelope) => {
          showApiMessage(error);
          resolve(null);
        },
        () => {},
      );
    });
  },

  createAccount: async (payload: CreateAccountPayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateAccountPayload>(
        "/api/accounts",
        payload,
        (result: unknown) => {
          if (isApiSuccess<Account>(result)) {
            const created = result.body;
            set({
              errorCreate: null,
              accounts: [created, ...get().accounts.filter((a) => a.uuid !== created.uuid)],
            });
            showApiMessage(result, { successMessage: "Conta cadastrada com sucesso!" });
            resolve(true);
            return;
          }
          if (isApiErrorEnvelope(result)) {
            const msg = getApiErrorMessage(result);
            set({ errorCreate: msg });
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ errorCreate: "Resposta inválida do servidor." });
          showApiMessage(result);
          resolve(false);
        },
        (error: ApiErrorEnvelope) => {
          const msg = getApiErrorMessage(error);
          set({ errorCreate: msg });
          showApiMessage(error);
          resolve(false);
        },
        () => {
          set({ loadingCreate: false });
        },
      );
    });
  },

  updateAccount: async (uuid: string, payload: CreateAccountPayload): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().put<unknown, ApiErrorEnvelope, CreateAccountPayload>(
        `/api/accounts/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<Account>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              accounts: get().accounts.map((a) => (a.uuid === updated.uuid ? updated : a)),
            });
            showApiMessage(result, { successMessage: "Conta atualizada com sucesso!" });
            resolve(true);
            return;
          }
          if (isApiErrorEnvelope(result)) {
            const msg = getApiErrorMessage(result);
            set({ errorUpdate: msg });
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ errorUpdate: "Resposta inválida do servidor." });
          showApiMessage(result);
          resolve(false);
        },
        (error: ApiErrorEnvelope) => {
          const msg = getApiErrorMessage(error);
          set({ errorUpdate: msg });
          showApiMessage(error);
          resolve(false);
        },
        () => {
          set({ loadingUpdate: false });
        },
      );
    });
  },

  deleteAccount: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/accounts/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ accounts: get().accounts.filter((a) => a.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Conta excluída com sucesso." });
          } else {
            toast.success("Conta excluída com sucesso.");
          }
          resolve(true);
        },
        (error: ApiErrorEnvelope) => {
          showApiMessage(error);
          resolve(false);
        },
        () => {
          set({ loadingDeleteUuid: null });
        },
      );
    });
  },
}));
