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
import type { CreateFlagPayload, Flag } from "./type";

type FlagStore = {
  flags: Flag[];
  loadingList: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchFlags: () => Promise<void>;
  fetchFlagByUuid: (uuid: string) => Promise<Flag | null>;
  createFlag: (payload: CreateFlagPayload) => Promise<boolean>;
  updateFlag: (uuid: string, payload: CreateFlagPayload) => Promise<boolean>;
  deleteFlag: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  flags: [] as Flag[],
  loadingList: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useFlagStore = create<FlagStore>((set, get) => ({
  ...defaultState,

  fetchFlags: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/flags",
      (result: unknown) => {
        if (isApiSuccess<Flag[]>(result) && Array.isArray(result.body)) {
          set({ flags: result.body });
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

  fetchFlagByUuid: async (uuid: string): Promise<Flag | null> => {
    return await new Promise<Flag | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/flags/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<Flag>(result)) {
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

  createFlag: async (payload: CreateFlagPayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateFlagPayload>(
        "/api/flags",
        payload,
        (result: unknown) => {
          if (isApiSuccess<Flag>(result)) {
            const created = result.body;
            set({
              errorCreate: null,
              flags: [created, ...get().flags.filter((f) => f.uuid !== created.uuid)],
            });
            showApiMessage(result, { successMessage: "Bandeira cadastrada com sucesso!" });
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

  updateFlag: async (uuid: string, payload: CreateFlagPayload): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().put<unknown, ApiErrorEnvelope, CreateFlagPayload>(
        `/api/flags/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<Flag>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              flags: get().flags.map((f) => (f.uuid === updated.uuid ? updated : f)),
            });
            showApiMessage(result, { successMessage: "Bandeira atualizada com sucesso!" });
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

  deleteFlag: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/flags/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ flags: get().flags.filter((f) => f.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Bandeira excluída com sucesso." });
          } else {
            toast.success("Bandeira excluída com sucesso.");
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
