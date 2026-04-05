import { create } from "zustand";
import { ClientHttp } from "@/lib/client-http";
import {
  isApiErrorEnvelope,
  isApiSuccess,
  type ApiErrorEnvelope,
} from "@/lib/api-envelope";
import { showApiMessage } from "@/components/shared/show-api-message";
import type { Transaction } from "./type";

type TransactionStore = {
  transactions: Transaction[];
  loadingList: boolean;
  listLoaded: boolean;
  fetchTransactions: () => Promise<void>;
};

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  loadingList: false,
  listLoaded: false,

  fetchTransactions: async (): Promise<void> => {
    set({ loadingList: true });

    await new ClientHttp().get<unknown, ApiErrorEnvelope>(
      "/api/transactions",
      (result: unknown) => {
        if (isApiSuccess<Transaction[]>(result) && Array.isArray(result.body)) {
          set({ transactions: result.body });
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
