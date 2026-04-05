import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { LoadingCard } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { LogoSvgPreview } from "../../logo/components/logo-svg-preview";
import { useLogoStore } from "../../logo/store";
import { useBankStore } from "../store";
import type { Bank } from "../type";
import { DeleteBankDialog } from "./delete-bank-dialog";
import { EditBankForm } from "./edit-bank-form";
import { ViewBankDrawerContent } from "./view-bank-drawer-content";

export function BanksTable() {
  const { open, close } = useDrawer();
  const banks = useBankStore((s) => s.banks);
  const loadingList = useBankStore((s) => s.loadingList);
  const deleteBank = useBankStore((s) => s.deleteBank);
  const loadingDeleteUuid = useBankStore((s) => s.loadingDeleteUuid);
  const logos = useLogoStore((s) => s.logos);
  const [deleteTarget, setDeleteTarget] = useState<Bank | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteBank(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  const resolveLogo = (logoUuid: string) => logos.find((l) => l.uuid === logoUuid);

  if (loadingList && banks.length === 0) {
    return <LoadingCard />;
  }

  if (!loadingList && banks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhum banco cadastrado. Use <strong className="text-foreground">Cadastrar</strong> para
        adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteBankDialog
        bank={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Logo</th>
              <th className="px-4 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {banks.map((row) => {
              const rowDeleting = loadingDeleteUuid === row.uuid;
              const logo = resolveLogo(row.logoUuid);
              return (
                <tr
                  key={row.uuid}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-3">
                    {logo ? (
                      <div className="flex items-center gap-3">
                        <LogoSvgPreview svg={logo.svg} isIcon={logo.isIcon ?? true} />
                        <span className="text-muted-foreground">{logo.name}</span>
                      </div>
                    ) : (
                      <code className="text-xs text-muted-foreground">{row.logoUuid}</code>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        aria-label="Visualizar"
                        title="Visualizar"
                        disabled={rowDeleting}
                        onClick={() =>
                          open({
                            id: `bank-view-${row.uuid}`,
                            title: "Visualizar banco",
                            content: <ViewBankDrawerContent bankUuid={row.uuid} onClose={close} />,
                          })
                        }
                      >
                        <EyeIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        aria-label="Editar"
                        title="Editar"
                        disabled={rowDeleting}
                        onClick={() =>
                          open({
                            id: `bank-edit-${row.uuid}`,
                            title: "Editar banco",
                            content: <EditBankForm bankUuid={row.uuid} onSuccess={close} />,
                          })
                        }
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        aria-label="Excluir"
                        title="Excluir"
                        disabled={rowDeleting}
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
