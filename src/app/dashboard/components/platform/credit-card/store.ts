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
import type { CreateCreditCardPayload, CreditCard, UpdateCreditCardPayload } from "./type";

type CreditCardStore = {
  creditCards: CreditCard[];
  loadingList: boolean;
  listLoaded: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchCreditCards: () => Promise<void>;
  fetchCreditCardByUuid: (uuid: string) => Promise<CreditCard | null>;
  createCreditCard: (payload: CreateCreditCardPayload) => Promise<boolean>;
  updateCreditCard: (uuid: string, payload: UpdateCreditCardPayload) => Promise<boolean>;
  deleteCreditCard: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  creditCards: [] as CreditCard[],
  loadingList: false,
  listLoaded: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useCreditCardStore = create<CreditCardStore>((set, get) => ({
  ...defaultState,

  fetchCreditCards: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/credit-cards",
      (result: unknown) => {
        if (isApiSuccess<CreditCard[]>(result) && Array.isArray(result.body)) {
          set({ creditCards: result.body });
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
        set({ loadingList: false, listLoaded: true });
      },
    );
  },

  fetchCreditCardByUuid: async (uuid: string): Promise<CreditCard | null> => {
    return await new Promise<CreditCard | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/credit-cards/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<CreditCard>(result)) {
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

  createCreditCard: async (payload: CreateCreditCardPayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateCreditCardPayload>(
        "/api/credit-cards",
        payload,
        (result: unknown) => {
          if (isApiSuccess<CreditCard>(result)) {
            const created = result.body;
            const complete =
              typeof created.description === "string" &&
              created.description.length > 0 &&
              typeof created.uuid === "string";
            set({
              errorCreate: null,
              creditCards: complete
                ? [created, ...get().creditCards.filter((c) => c.uuid !== created.uuid)]
                : get().creditCards,
            });
            if (!complete) {
              void get().fetchCreditCards();
            }
            showApiMessage(result, { successMessage: "Cartão de crédito cadastrado com sucesso!" });
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

  updateCreditCard: async (uuid: string, payload: UpdateCreditCardPayload): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().put<unknown, ApiErrorEnvelope, UpdateCreditCardPayload>(
        `/api/credit-cards/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<CreditCard>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              creditCards: get().creditCards.map((c) =>
                c.uuid === uuid ? { ...c, ...updated, uuid: c.uuid } : c,
              ),
            });
            showApiMessage(result, { successMessage: "Cartão de crédito atualizado com sucesso!" });
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

  deleteCreditCard: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/credit-cards/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ creditCards: get().creditCards.filter((c) => c.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Cartão de crédito excluído com sucesso." });
          } else {
            toast.success("Cartão de crédito excluído com sucesso.");
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
