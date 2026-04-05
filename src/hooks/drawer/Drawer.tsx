import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="border-b border-border bg-muted/30 pb-4">
          <SheetTitle>{payload?.title}</SheetTitle>
          <SheetDescription className="sr-only">
            {payload ? `Painel lateral: ${payload.id}` : ""}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6 text-popover-foreground">
          {payload?.content}
        </div>
      </SheetContent>
    </Sheet>
  );
}
