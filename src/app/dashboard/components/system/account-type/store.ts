import { create } from "zustand";
import type { AccountTypeSystemState } from "./type";

type AccountTypeStore = AccountTypeSystemState & {
  // ações futuras
};

export const useAccountTypeStore = create<AccountTypeStore>(() => ({}));
