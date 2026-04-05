import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { LoadingCard } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { creditCardLabel } from "../../credit-card/type";
import { useCreditCardStore } from "../../credit-card/store";
import { useCategoryStore } from "../../category/store";
import { useTagStore } from "../../tag/store";
import { DeleteCreditCardExpenseDialog } from "./delete-credit-card-expense-dialog";
import { EditCreditCardExpenseForm } from "./edit-credit-card-expense-form";
import { ViewCreditCardExpenseDrawerContent } from "./view-credit-card-expense-drawer-content";
import { useCreditCardExpenseStore } from "../store";
import {
  ccExpenseAmountToReais,
  formatInstallmentOptionLabel,
  formatInvoiceDateForDisplay,
  type CreditCardExpense,
} from "../type";

function formatBrl(reais: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

export function CreditCardExpensesTable() {
  const { open, close } = useDrawer();
  const creditCardExpenses = useCreditCardExpenseStore((s) => s.creditCardExpenses);
  const loadingList = useCreditCardExpenseStore((s) => s.loadingList);
  const deleteCreditCardExpense = useCreditCardExpenseStore((s) => s.deleteCreditCardExpense);
  const loadingDeleteUuid = useCreditCardExpenseStore((s) => s.loadingDeleteUuid);
  const categories = useCategoryStore((s) => s.categories);
  const creditCards = useCreditCardStore((s) => s.creditCards);
  const tags = useTagStore((s) => s.tags);
  const [deleteTarget, setDeleteTarget] = useState<CreditCardExpense | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteCreditCardExpense(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  if (loadingList && creditCardExpenses.length === 0) {
    return <LoadingCard />;
  }

  if (!loadingList && creditCardExpenses.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhuma despesa de cartão cadastrada. Use <strong className="text-foreground">Cadastrar</strong>{" "}
        para adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteCreditCardExpenseDialog
        expense={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[1220px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-3 text-left font-medium text-foreground">Descrição</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Valor</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Parcelas</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Pagamento</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Data fatura</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Cartão</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Categoria</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Tag</th>
              <th className="px-3 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {creditCardExpenses.map((row) => {
              const rowDeleting = loadingDeleteUuid === row.uuid;
              const cat = categories.find((c) => c.uuid === row.categoryUuid);
              const card = creditCards.find((c) => c.uuid === row.creditCardUuid);
              const tag = row.tagUuid ? tags.find((t) => t.uuid === row.tagUuid) : undefined;
              return (
                <tr
                  key={row.uuid}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-3 font-medium text-foreground">{row.description}</td>
                  <td className="px-3 py-3 tabular-nums text-foreground">
                    {formatBrl(ccExpenseAmountToReais(row.amount))}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-3 text-muted-foreground">
                    {row.fixedExpense
                      ? "—"
                      : formatInstallmentOptionLabel(row.installments ?? 1, ccExpenseAmountToReais(row.amount))}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {new Date(row.datePaid).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatInvoiceDateForDisplay(row.invoiceDate)}
                  </td>
                  <td className="max-w-[160px] truncate px-3 py-3 text-foreground">
                    {card ? creditCardLabel(card) : "—"}
                  </td>
                  <td className="max-w-[160px] truncate px-3 py-3 text-foreground">
                    {cat?.nome ?? "—"}
                  </td>
                  <td className="max-w-[120px] truncate px-3 py-3 text-foreground">
                    {tag?.nome ?? "—"}
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
                            id: `cc-expense-view-${row.uuid}`,
                            title: "Visualizar despesa de cartão",
                            content: (
                              <ViewCreditCardExpenseDrawerContent expenseUuid={row.uuid} onClose={close} />
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
                            id: `cc-expense-edit-${row.uuid}`,
                            title: "Editar despesa de cartão",
                            content: (
                              <EditCreditCardExpenseForm
                                expenseUuid={row.uuid}
                                initialExpense={row}
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
