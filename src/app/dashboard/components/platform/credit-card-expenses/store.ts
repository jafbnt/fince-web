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
import type {
  CreateCreditCardExpensePayload,
  CreditCardExpense,
  UpdateCreditCardExpensePayload,
} from "./type";

type CreditCardExpenseStore = {
  creditCardExpenses: CreditCardExpense[];
  loadingList: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchCreditCardExpenses: () => Promise<void>;
  fetchCreditCardExpenseByUuid: (uuid: string) => Promise<CreditCardExpense | null>;
  createCreditCardExpense: (payload: CreateCreditCardExpensePayload) => Promise<boolean>;
  updateCreditCardExpense: (uuid: string, payload: UpdateCreditCardExpensePayload) => Promise<boolean>;
  deleteCreditCardExpense: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  creditCardExpenses: [] as CreditCardExpense[],
  loadingList: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useCreditCardExpenseStore = create<CreditCardExpenseStore>((set, get) => ({
  ...defaultState,

  fetchCreditCardExpenses: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/credit-card-expenses",
      (result: unknown) => {
        if (isApiSuccess<CreditCardExpense[]>(result) && Array.isArray(result.body)) {
          set({ creditCardExpenses: result.body });
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

  fetchCreditCardExpenseByUuid: async (uuid: string): Promise<CreditCardExpense | null> => {
    return await new Promise<CreditCardExpense | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/credit-card-expenses/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<CreditCardExpense>(result)) {
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

  createCreditCardExpense: async (payload: CreateCreditCardExpensePayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateCreditCardExpensePayload>(
        "/api/credit-card-expenses",
        payload,
        (result: unknown) => {
          if (isApiSuccess<CreditCardExpense>(result)) {
            const created = result.body;
            const complete =
              typeof created.description === "string" && created.description.length > 0;
            set({
              errorCreate: null,
              creditCardExpenses: complete
                ? [created, ...get().creditCardExpenses.filter((e) => e.uuid !== created.uuid)]
                : get().creditCardExpenses,
            });
            if (!complete) {
              void get().fetchCreditCardExpenses();
            }
            showApiMessage(result, { successMessage: "Despesa de cartão cadastrada com sucesso!" });
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

  updateCreditCardExpense: async (
    uuid: string,
    payload: UpdateCreditCardExpensePayload,
  ): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().patch<unknown, ApiErrorEnvelope, UpdateCreditCardExpensePayload>(
        `/api/credit-card-expenses/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<CreditCardExpense>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              creditCardExpenses: get().creditCardExpenses.map((e) =>
                e.uuid === uuid ? { ...e, ...updated, uuid: e.uuid } : e,
              ),
            });
            showApiMessage(result, { successMessage: "Despesa de cartão atualizada com sucesso!" });
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

  deleteCreditCardExpense: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/credit-card-expenses/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ creditCardExpenses: get().creditCardExpenses.filter((e) => e.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Despesa de cartão excluída com sucesso." });
          } else {
            toast.success("Despesa de cartão excluída com sucesso.");
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
