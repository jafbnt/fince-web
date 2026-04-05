import { create } from "zustand";
import { ClientHttp } from "@/lib/client-http";
import {
  isApiErrorEnvelope,
  isApiSuccess,
  type ApiErrorEnvelope,
} from "@/lib/api-envelope";
import { showApiMessage } from "@/components/shared/show-api-message";
import type { CreditCard } from "./type";

type CreditCardStore = {
  creditCards: CreditCard[];
  loadingList: boolean;
  /** Evita novo GET em loop quando a API devolve lista vazia ou formato inesperado. */
  listLoaded: boolean;
  fetchCreditCards: () => Promise<void>;
};

export const useCreditCardStore = create<CreditCardStore>((set) => ({
  creditCards: [],
  loadingList: false,
  listLoaded: false,

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
}));
