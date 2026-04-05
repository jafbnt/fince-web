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
import type { Color, CreateColorPayload } from "./type";

type ColorStore = {
  colors: Color[];
  loadingList: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchColors: () => Promise<void>;
  fetchColorByUuid: (uuid: string) => Promise<Color | null>;
  createColor: (payload: CreateColorPayload) => Promise<boolean>;
  updateColor: (uuid: string, payload: CreateColorPayload) => Promise<boolean>;
  deleteColor: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  colors: [] as Color[],
  loadingList: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useColorStore = create<ColorStore>((set, get) => ({
  ...defaultState,

  fetchColors: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/colors",
      (result: unknown) => {
        if (isApiSuccess<Color[]>(result) && Array.isArray(result.body)) {
          set({ colors: result.body });
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

  fetchColorByUuid: async (uuid: string): Promise<Color | null> => {
    return await new Promise<Color | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/colors/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<Color>(result)) {
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

  createColor: async (payload: CreateColorPayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateColorPayload>(
        "/api/colors",
        payload,
        (result: unknown) => {
          if (isApiSuccess<Color>(result)) {
            const created = result.body;
            set({
              errorCreate: null,
              colors: [created, ...get().colors.filter((c) => c.uuid !== created.uuid)],
            });
            showApiMessage(result, { successMessage: "Cor cadastrada com sucesso!" });
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

  updateColor: async (uuid: string, payload: CreateColorPayload): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().put<unknown, ApiErrorEnvelope, CreateColorPayload>(
        `/api/colors/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<Color>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              colors: get().colors.map((c) => (c.uuid === updated.uuid ? updated : c)),
            });
            showApiMessage(result, { successMessage: "Cor atualizada com sucesso!" });
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

  deleteColor: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/colors/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ colors: get().colors.filter((c) => c.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Cor excluída com sucesso." });
          } else {
            toast.success("Cor excluída com sucesso.");
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
