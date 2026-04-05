import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDrawerStore } from "./store";

export function Drawer() {
  const { isOpen, payload, closeDrawer } = useDrawerStore();
  return (
    <Sheet
      key={payload?.id}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDrawer();
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{payload?.title}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col px-6 pb-6">{payload?.content}</div>
      </SheetContent>
    </Sheet>
  );
}
