import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="presentation"
      aria-hidden
      className={cn("size-4 animate-spin text-primary", className)}
      {...props}
    />
  );
}

/** Lista vazia carregando — card centralizado na área da tabela. */
export function LoadingCard({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8",
        className,
      )}
    >
      <Spinner className="size-8" />
      <span className="sr-only">Carregando</span>
    </div>
  );
}

/** Drawer / formulário aguardando dados. */
export function LoadingCenter({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex min-h-[120px] items-center justify-center py-8", className)}
    >
      <Spinner className="size-6" />
      <span className="sr-only">Carregando</span>
    </div>
  );
}

/** Área de picker (logo, cor, banco…) enquanto lista carrega. */
export function PickerLoading({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-24 items-center justify-center rounded-3xl border border-border bg-input/30 p-6",
        className,
      )}
    >
      <Spinner className="size-6" />
      <span className="sr-only">Carregando</span>
    </div>
  );
}
