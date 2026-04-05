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
import type { Category, CreateCategoryPayload } from "./type";

type CategoryStore = {
  categories: Category[];
  loadingList: boolean;
  loadingCreate: boolean;
  errorCreate: string | null;
  loadingUpdate: boolean;
  errorUpdate: string | null;
  loadingDeleteUuid: string | null;
  fetchCategories: () => Promise<void>;
  fetchCategoryByUuid: (uuid: string) => Promise<Category | null>;
  createCategory: (payload: CreateCategoryPayload) => Promise<boolean>;
  updateCategory: (uuid: string, payload: CreateCategoryPayload) => Promise<boolean>;
  deleteCategory: (uuid: string) => Promise<boolean>;
};

const defaultState = {
  categories: [] as Category[],
  loadingList: false,
  loadingCreate: false,
  errorCreate: null as string | null,
  loadingUpdate: false,
  errorUpdate: null as string | null,
  loadingDeleteUuid: null as string | null,
};

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  ...defaultState,

  fetchCategories: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/categories",
      (result: unknown) => {
        if (isApiSuccess<Category[]>(result) && Array.isArray(result.body)) {
          set({ categories: result.body });
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

  fetchCategoryByUuid: async (uuid: string): Promise<Category | null> => {
    return await new Promise<Category | null>((resolve) => {
      void new ClientHttp().get<unknown, ApiErrorEnvelope>(
        `/api/categories/${uuid}`,
        (result: unknown) => {
          if (isApiSuccess<Category>(result)) {
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

  createCategory: async (payload: CreateCategoryPayload): Promise<boolean> => {
    set({ loadingCreate: true, errorCreate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().post<unknown, ApiErrorEnvelope, CreateCategoryPayload>(
        "/api/categories",
        payload,
        (result: unknown) => {
          if (isApiSuccess<Category>(result)) {
            const created = result.body;
            set({
              errorCreate: null,
              categories: [created, ...get().categories.filter((c) => c.uuid !== created.uuid)],
            });
            showApiMessage(result, { successMessage: "Categoria cadastrada com sucesso!" });
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

  updateCategory: async (uuid: string, payload: CreateCategoryPayload): Promise<boolean> => {
    set({ loadingUpdate: true, errorUpdate: null });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().put<unknown, ApiErrorEnvelope, CreateCategoryPayload>(
        `/api/categories/${uuid}`,
        payload,
        (result: unknown) => {
          if (isApiSuccess<Category>(result)) {
            const updated = result.body;
            set({
              errorUpdate: null,
              categories: get().categories.map((c) => (c.uuid === updated.uuid ? updated : c)),
            });
            showApiMessage(result, { successMessage: "Categoria atualizada com sucesso!" });
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

  deleteCategory: async (uuid: string): Promise<boolean> => {
    set({ loadingDeleteUuid: uuid });

    return await new Promise<boolean>((resolve) => {
      void new ClientHttp().delete<unknown, ApiErrorEnvelope>(
        `/api/categories/${uuid}`,
        (result: unknown) => {
          if (isApiErrorEnvelope(result)) {
            showApiMessage(result);
            resolve(false);
            return;
          }
          set({ categories: get().categories.filter((c) => c.uuid !== uuid) });
          if (isApiSuccess(result)) {
            showApiMessage(result, { successMessage: "Categoria excluída com sucesso." });
          } else {
            toast.success("Categoria excluída com sucesso.");
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
