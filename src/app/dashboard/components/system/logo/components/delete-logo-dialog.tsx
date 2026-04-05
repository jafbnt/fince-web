import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Logo } from "../type";

type DeleteLogoDialogProps = {
  logo: Logo | null;
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteLogoDialog({
  logo,
  open,
  loading,
  onOpenChange,
  onConfirm,
}: DeleteLogoDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir logo</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o logo{" "}
            <span className="font-medium text-foreground">{logo?.name}</span>? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={() => {
              void onConfirm();
            }}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
