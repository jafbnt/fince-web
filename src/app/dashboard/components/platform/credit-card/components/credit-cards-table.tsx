import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { LoadingCard } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { useBankStore } from "../../../system/bank/store";
import { useAccountTypeStore } from "../../../system/account-type/store";
import { useFlagStore } from "../../../system/flag/store";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useLogoStore } from "../../../system/logo/store";
import { DeleteCreditCardDialog } from "./delete-credit-card-dialog";
import { EditCreditCardForm } from "./edit-credit-card-form";
import { ViewCreditCardDrawerContent } from "./view-credit-card-drawer-content";
import { useCreditCardStore } from "../store";
import type { CreditCard } from "../type";

export function CreditCardsTable() {
  const { open, close } = useDrawer();
  const creditCards = useCreditCardStore((s) => s.creditCards);
  const loadingList = useCreditCardStore((s) => s.loadingList);
  const deleteCreditCard = useCreditCardStore((s) => s.deleteCreditCard);
  const loadingDeleteUuid = useCreditCardStore((s) => s.loadingDeleteUuid);
  const banks = useBankStore((s) => s.banks);
  const flags = useFlagStore((s) => s.flags);
  const accountTypes = useAccountTypeStore((s) => s.accountTypes);
  const logos = useLogoStore((s) => s.logos);
  const [deleteTarget, setDeleteTarget] = useState<CreditCard | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteCreditCard(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  const flagThumb = (flagUuid: string) => {
    const flag = flags.find((f) => f.uuid === flagUuid);
    const logo = flag ? logos.find((l) => l.uuid === flag.logoUuid) : undefined;
    return { flag, logo };
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

  if (loadingList && creditCards.length === 0) {
    return <LoadingCard />;
  }

  if (!loadingList && creditCards.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhum cartão cadastrado. Use <strong className="text-foreground">Cadastrar</strong> para
        adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteCreditCardDialog
        creditCard={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[1024px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-3 text-left font-medium text-foreground">Descrição</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Bandeira</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Banco</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Tipo</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Fechamento</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Vencimento</th>
              <th className="px-3 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {creditCards.map((row) => {
              const rowDeleting = loadingDeleteUuid === row.uuid;
              const fl = flagThumb(row.flagUuid);
              const b = bankThumb(row.bankUuid);
              const tp = typeThumb(row.bankTypeUuid);
              return (
                <tr
                  key={row.uuid}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="max-w-[200px] truncate px-3 py-3 font-medium text-foreground">
                    {row.description}
                  </td>
                  <td className="px-3 py-3">
                    {fl.logo ? (
                      <div className="flex items-center gap-2">
                        <LogoSvgPreview
                          svg={fl.logo.svg}
                          className="h-8 w-12"
                          isIcon={fl.logo.isIcon ?? true}
                        />
                        <span className="text-muted-foreground">{fl.flag?.name}</span>
                      </div>
                    ) : fl.flag ? (
                      <span className="text-xs text-muted-foreground">{fl.flag.name}</span>
                    ) : (
                      <code className="text-xs text-muted-foreground">{row.flagUuid}</code>
                    )}
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
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">
                    Dia {row.closingDay}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">
                    Dia {row.dueDate}
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
                            id: `credit-card-view-${row.uuid}`,
                            title: "Visualizar cartão",
                            content: (
                              <ViewCreditCardDrawerContent creditCardUuid={row.uuid} onClose={close} />
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
                            id: `credit-card-edit-${row.uuid}`,
                            title: "Editar cartão",
                            content: (
                              <EditCreditCardForm
                                creditCardUuid={row.uuid}
                                initialCreditCard={row}
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
