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
import type { CreateLogoPayload, Logo } from "./type";

type LogoStore = {
  logos: Logo[];
  loadingList: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchLogos: () => Promise<void>;
  fetchLogoByUuid: (uuid: string) => Promise<Logo | null>;
  createLogo: (payload: CreateLogoPayload) => Promise<boolean>;
  updateLogo: (uuid: string, payload: CreateLogoPayload) => Promise<boolean>;
  deleteLogo: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  logos: [] as Logo[],
  loadingList: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useLogoStore = create<LogoStore>((set, get) => ({
  ...defaultState,

  fetchLogos: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/logos",
      (result: unknown) => {
        if (isApiSuccess<Logo[]>(result) && Array.isArray(result.body)) {
          set({ logos: result.body });
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

  fetchLogoByUuid: async (uuid: string): Promise<Logo | null> => {
    return await new Promise<Logo | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/logos/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<Logo>(result)) {
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

  createLogo: async (payload: CreateLogoPayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateLogoPayload>(
        "/api/logos",
        payload,
        (result: unknown) => {
          if (isApiSuccess<Logo>(result)) {
            const created = result.body;
            set({
              errorCreate: null,
              logos: [created, ...get().logos.filter((l) => l.uuid !== created.uuid)],
            });
            showApiMessage(result, { successMessage: "Logo cadastrado com sucesso!" });
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

  updateLogo: async (uuid: string, payload: CreateLogoPayload): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().put<unknown, ApiErrorEnvelope, CreateLogoPayload>(
        `/api/logos/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<Logo>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              logos: get().logos.map((l) => (l.uuid === updated.uuid ? updated : l)),
            });
            showApiMessage(result, { successMessage: "Logo atualizado com sucesso!" });
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

  deleteLogo: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/logos/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ logos: get().logos.filter((l) => l.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Logo excluído com sucesso." });
          } else {
            toast.success("Logo excluído com sucesso.");
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
