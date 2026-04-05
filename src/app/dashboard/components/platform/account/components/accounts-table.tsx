import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { useBankStore } from "../../../system/bank/store";
import { useAccountTypeStore } from "../../../system/account-type/store";
import { useColorStore } from "../../../system/color/store";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useLogoStore } from "../../../system/logo/store";
import { useAccountStore } from "../store";
import type { Account } from "../type";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { EditAccountForm } from "./edit-account-form";
import { ViewAccountDrawerContent } from "./view-account-drawer-content";

function formatBalance(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function AccountsTable() {
  const { open, close } = useDrawer();
  const accounts = useAccountStore((s) => s.accounts);
  const loadingList = useAccountStore((s) => s.loadingList);
  const deleteAccount = useAccountStore((s) => s.deleteAccount);
  const loadingDeleteUuid = useAccountStore((s) => s.loadingDeleteUuid);
  const banks = useBankStore((s) => s.banks);
  const accountTypes = useAccountTypeStore((s) => s.accountTypes);
  const logos = useLogoStore((s) => s.logos);
  const colors = useColorStore((s) => s.colors);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteAccount(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  const bankThumb = (bankUuid: string) => {
    const bank = banks.find((b) => b.uuid === bankUuid);
    const logo = bank ? logos.find((l) => l.uuid === bank.logoUuid) : undefined;
    return { bank, logo };
  };

  const typeThumb = (typeUuid: string) => {
    const t = accountTypes.find((x) => x.uuid === typeUuid);
    const logo = t ? logos.find((l) => l.uuid === t.logoUuid) : undefined;
    return { type: t, logo };
  };

  if (loadingList && accounts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Carregando contas…
      </div>
    );
  }

  if (!loadingList && accounts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhuma conta cadastrada. Use <strong className="text-foreground">Cadastrar</strong> para
        adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteAccountDialog
        account={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-3 text-left font-medium text-foreground">Descrição</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Saldo</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Banco</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Tipo</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Cor</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Afeta saldo</th>
              <th className="px-3 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((row) => {
              const rowDeleting = loadingDeleteUuid === row.uuid;
              const b = bankThumb(row.bankUuid);
              const tp = typeThumb(row.bankTypeUuid);
              const color = colors.find((c) => c.uuid === row.colorUuid);
              return (
                <tr
                  key={row.uuid}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="max-w-[200px] truncate px-3 py-3 font-medium text-foreground">
                    {row.description}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-foreground">
                    {formatBalance(row.balance)}
                  </td>
                  <td className="px-3 py-3">
                    {b.logo ? (
                      <div className="flex items-center gap-2">
                        <LogoSvgPreview
                          svg={b.logo.svg}
                          className="h-8 w-12"
                          isIcon={b.logo.isIcon ?? true}
                        />
                        <span className="text-muted-foreground">{b.bank?.name}</span>
                      </div>
                    ) : b.bank ? (
                      <span className="text-xs text-muted-foreground">{b.bank.name}</span>
                    ) : (
                      <code className="text-xs text-muted-foreground">{row.bankUuid}</code>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {tp.logo ? (
                      <div className="flex items-center gap-2">
                        <LogoSvgPreview
                          svg={tp.logo.svg}
                          className="h-8 w-12"
                          isIcon={tp.logo.isIcon ?? true}
                        />
                        <span className="text-muted-foreground">{tp.type?.name}</span>
                      </div>
                    ) : tp.type ? (
                      <span className="text-xs text-muted-foreground">{tp.type.name}</span>
                    ) : (
                      <code className="text-xs text-muted-foreground">{row.bankTypeUuid}</code>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {color ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="size-6 shrink-0 rounded-md border border-border shadow-sm"
                          style={{ backgroundColor: color.hex }}
                          aria-hidden
                        />
                        <span className="text-muted-foreground">{color.name}</span>
                      </div>
                    ) : (
                      <code className="text-xs text-muted-foreground">{row.colorUuid}</code>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {row.affectsBalance ? "Sim" : "Não"}
                  </td>
                  <td className="px-3 py-3">
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
                            id: `account-view-${row.uuid}`,
                            title: "Visualizar conta",
                            content: (
                              <ViewAccountDrawerContent accountUuid={row.uuid} onClose={close} />
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
                            id: `account-edit-${row.uuid}`,
                            title: "Editar conta",
                            content: <EditAccountForm accountUuid={row.uuid} onSuccess={close} />,
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
