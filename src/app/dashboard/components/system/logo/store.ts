import { create } from "zustand";
import type { LogoSystemState } from "./type";

type LogoStore = LogoSystemState & {
  // ações futuras
};

export const useLogoStore = create<LogoStore>(() => ({}));
