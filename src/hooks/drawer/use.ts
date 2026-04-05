import { useDrawerStore, type DrawerPayload } from "./store";

export function useDrawer(): {
  open: (payload: DrawerPayload) => void;
  close: () => void;
} {
  const open = useDrawerStore((s) => s.openDrawer);
  const close = useDrawerStore((s) => s.closeDrawer);

  return { open, close };
}

export type { DrawerPayload };
