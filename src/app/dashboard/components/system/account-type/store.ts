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
import type { AccountType, CreateAccountTypePayload } from "./type";

type AccountTypeStore = {
  accountTypes: AccountType[];
  loadingList: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchAccountTypes: () => Promise<void>;
  fetchAccountTypeByUuid: (uuid: string) => Promise<AccountType | null>;
  createAccountType: (payload: CreateAccountTypePayload) => Promise<boolean>;
  updateAccountType: (uuid: string, payload: CreateAccountTypePayload) => Promise<boolean>;
  deleteAccountType: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  accountTypes: [] as AccountType[],
  loadingList: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useAccountTypeStore = create<AccountTypeStore>((set, get) => ({
  ...defaultState,

  fetchAccountTypes: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/account-types",
      (result: unknown) => {
        if (isApiSuccess<AccountType[]>(result) && Array.isArray(result.body)) {
          set({ accountTypes: result.body });
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

  fetchAccountTypeByUuid: async (uuid: string): Promise<AccountType | null> => {
    return await new Promise<AccountType | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/account-types/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<AccountType>(result)) {
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

  createAccountType: async (payload: CreateAccountTypePayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateAccountTypePayload>(
        "/api/account-types",
        payload,
        (result: unknown) => {
          if (isApiSuccess<AccountType>(result)) {
            const created = result.body;
            set({
              errorCreate: null,
              accountTypes: [
                created,
                ...get().accountTypes.filter((a) => a.uuid !== created.uuid),
              ],
            });
            showApiMessage(result, { successMessage: "Tipo de conta cadastrado com sucesso!" });
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

  updateAccountType: async (uuid: string, payload: CreateAccountTypePayload): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().patch<unknown, ApiErrorEnvelope, CreateAccountTypePayload>(
        `/api/account-types/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<AccountType>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              accountTypes: get().accountTypes.map((a) =>
                a.uuid === updated.uuid ? updated : a,
              ),
            });
            showApiMessage(result, { successMessage: "Tipo de conta atualizado com sucesso!" });
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

  deleteAccountType: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/account-types/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ accountTypes: get().accountTypes.filter((a) => a.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Tipo de conta excluído com sucesso." });
          } else {
            toast.success("Tipo de conta excluído com sucesso.");
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
