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
import type { CreateRevenuePayload, Revenue, UpdateRevenuePayload } from "./type";

type RevenueStore = {
  revenues: Revenue[];
  loadingList: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchRevenues: () => Promise<void>;
  fetchRevenueByUuid: (uuid: string) => Promise<Revenue | null>;
  createRevenue: (payload: CreateRevenuePayload) => Promise<boolean>;
  updateRevenue: (uuid: string, payload: UpdateRevenuePayload) => Promise<boolean>;
  deleteRevenue: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  revenues: [] as Revenue[],
  loadingList: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useRevenueStore = create<RevenueStore>((set, get) => ({
  ...defaultState,

  fetchRevenues: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/revenue",
      (result: unknown) => {
        if (isApiSuccess<Revenue[]>(result) && Array.isArray(result.body)) {
          set({ revenues: result.body });
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

  fetchRevenueByUuid: async (uuid: string): Promise<Revenue | null> => {
    return await new Promise<Revenue | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/revenue/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<Revenue>(result)) {
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

  createRevenue: async (payload: CreateRevenuePayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateRevenuePayload>(
        "/api/revenue",
        payload,
        (result: unknown) => {
          if (isApiSuccess<Revenue>(result)) {
            const created = result.body;
            const complete =
              typeof created.description === "string" && created.description.length > 0;
            set({
              errorCreate: null,
              revenues: complete
                ? [created, ...get().revenues.filter((r) => r.uuid !== created.uuid)]
                : get().revenues,
            });
            if (!complete) {
              void get().fetchRevenues();
            }
            showApiMessage(result, { successMessage: "Receita cadastrada com sucesso!" });
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

  updateRevenue: async (uuid: string, payload: UpdateRevenuePayload): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().patch<unknown, ApiErrorEnvelope, UpdateRevenuePayload>(
        `/api/revenue/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<Revenue>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              revenues: get().revenues.map((r) =>
                r.uuid === uuid ? { ...r, ...updated, uuid: r.uuid } : r,
              ),
            });
            showApiMessage(result, { successMessage: "Receita atualizada com sucesso!" });
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

  deleteRevenue: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/revenue/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ revenues: get().revenues.filter((r) => r.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Receita excluída com sucesso." });
          } else {
            toast.success("Receita excluída com sucesso.");
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
