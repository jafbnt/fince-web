import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { LogoSvgPreview } from "../../logo/components/logo-svg-preview";
import { useLogoStore } from "../../logo/store";
import { useAccountTypeStore } from "../store";
import type { AccountType } from "../type";
import { DeleteAccountTypeDialog } from "./delete-account-type-dialog";
import { EditAccountTypeForm } from "./edit-account-type-form";
import { ViewAccountTypeDrawerContent } from "./view-account-type-drawer-content";

export function AccountTypesTable() {
  const { open, close } = useDrawer();
  const accountTypes = useAccountTypeStore((s) => s.accountTypes);
  const loadingList = useAccountTypeStore((s) => s.loadingList);
  const deleteAccountType = useAccountTypeStore((s) => s.deleteAccountType);
  const loadingDeleteUuid = useAccountTypeStore((s) => s.loadingDeleteUuid);
  const logos = useLogoStore((s) => s.logos);
  const [deleteTarget, setDeleteTarget] = useState<AccountType | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteAccountType(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  const resolveLogo = (logoUuid: string) => logos.find((l) => l.uuid === logoUuid);

  if (loadingList && accountTypes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Carregando tipos de conta…
      </div>
    );
  }

  if (!loadingList && accountTypes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhum tipo de conta cadastrado. Use <strong className="text-foreground">Cadastrar</strong>{" "}
        para adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteAccountTypeDialog
        accountType={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Logo</th>
              <th className="px-4 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {accountTypes.map((row) => {
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
                            id: `account-type-view-${row.uuid}`,
                            title: "Visualizar tipo de conta",
                            content: (
                              <ViewAccountTypeDrawerContent
                                accountTypeUuid={row.uuid}
                                onClose={close}
                              />
                            ),
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
                            id: `account-type-edit-${row.uuid}`,
                            title: "Editar tipo de conta",
                            content: (
                              <EditAccountTypeForm
                                accountTypeUuid={row.uuid}
                                onSuccess={close}
                              />
                            ),
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
