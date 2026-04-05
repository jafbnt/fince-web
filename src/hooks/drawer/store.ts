import { create } from "zustand";
import type { ReactNode } from "react";

export type DrawerPayload = {
  id: string;
  title: string;
  content: ReactNode;
};

type DrawerState = {
  isOpen: boolean;
  payload: DrawerPayload | null;
  openDrawer: (payload: DrawerPayload) => void;
  closeDrawer: () => void;
};

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  payload: null,

  openDrawer: (payload) => set({ isOpen: true, payload }),

  closeDrawer: () => set({ isOpen: false, payload: null }),
}));
