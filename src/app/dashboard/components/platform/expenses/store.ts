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
import type { CreateExpensePayload, Expense, UpdateExpensePayload } from "./type";

type ExpenseStore = {
  expenses: Expense[];
  loadingList: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchExpenses: () => Promise<void>;
  fetchExpenseByUuid: (uuid: string) => Promise<Expense | null>;
  createExpense: (payload: CreateExpensePayload) => Promise<boolean>;
  updateExpense: (uuid: string, payload: UpdateExpensePayload) => Promise<boolean>;
  deleteExpense: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  expenses: [] as Expense[],
  loadingList: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  ...defaultState,

  fetchExpenses: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/expenses",
      (result: unknown) => {
        if (isApiSuccess<Expense[]>(result) && Array.isArray(result.body)) {
          set({ expenses: result.body });
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

  fetchExpenseByUuid: async (uuid: string): Promise<Expense | null> => {
    return await new Promise<Expense | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/expenses/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<Expense>(result)) {
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

  createExpense: async (payload: CreateExpensePayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateExpensePayload>(
        "/api/expenses",
        payload,
        (result: unknown) => {
          if (isApiSuccess<Expense>(result)) {
            const created = result.body;
            const complete =
              typeof created.description === "string" && created.description.length > 0;
            set({
              errorCreate: null,
              expenses: complete
                ? [created, ...get().expenses.filter((e) => e.uuid !== created.uuid)]
                : get().expenses,
            });
            if (!complete) {
              void get().fetchExpenses();
            }
            showApiMessage(result, { successMessage: "Despesa cadastrada com sucesso!" });
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

  updateExpense: async (uuid: string, payload: UpdateExpensePayload): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().patch<unknown, ApiErrorEnvelope, UpdateExpensePayload>(
        `/api/expenses/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<Expense>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              expenses: get().expenses.map((e) =>
                e.uuid === uuid ? { ...e, ...updated, uuid: e.uuid } : e,
              ),
            });
            showApiMessage(result, { successMessage: "Despesa atualizada com sucesso!" });
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

  deleteExpense: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/expenses/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ expenses: get().expenses.filter((e) => e.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Despesa excluída com sucesso." });
          } else {
            toast.success("Despesa excluída com sucesso.");
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
