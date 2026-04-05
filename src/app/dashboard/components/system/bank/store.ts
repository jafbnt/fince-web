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
import type { Bank, CreateBankPayload } from "./type";

type BankStore = {
  banks: Bank[];
  loadingList: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchBanks: () => Promise<void>;
  fetchBankByUuid: (uuid: string) => Promise<Bank | null>;
  createBank: (payload: CreateBankPayload) => Promise<boolean>;
  updateBank: (uuid: string, payload: CreateBankPayload) => Promise<boolean>;
  deleteBank: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  banks: [] as Bank[],
  loadingList: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useBankStore = create<BankStore>((set, get) => ({
  ...defaultState,

  fetchBanks: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/banks",
      (result: unknown) => {
        if (isApiSuccess<Bank[]>(result) && Array.isArray(result.body)) {
          set({ banks: result.body });
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

  fetchBankByUuid: async (uuid: string): Promise<Bank | null> => {
    return await new Promise<Bank | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/banks/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<Bank>(result)) {
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

  createBank: async (payload: CreateBankPayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateBankPayload>(
        "/api/banks",
        payload,
        (result: unknown) => {
          if (isApiSuccess<Bank>(result)) {
            const created = result.body;
            set({
              errorCreate: null,
              banks: [created, ...get().banks.filter((b) => b.uuid !== created.uuid)],
            });
            showApiMessage(result, { successMessage: "Banco cadastrado com sucesso!" });
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

  updateBank: async (uuid: string, payload: CreateBankPayload): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().put<unknown, ApiErrorEnvelope, CreateBankPayload>(
        `/api/banks/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<Bank>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              banks: get().banks.map((b) => (b.uuid === updated.uuid ? updated : b)),
            });
            showApiMessage(result, { successMessage: "Banco atualizado com sucesso!" });
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

  deleteBank: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/banks/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ banks: get().banks.filter((b) => b.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Banco excluído com sucesso." });
          } else {
            toast.success("Banco excluído com sucesso.");
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
