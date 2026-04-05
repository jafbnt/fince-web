import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { LoadingCard } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { useAccountStore } from "../../account/store";
import { useCategoryStore } from "../../category/store";
import { useTagStore } from "../../tag/store";
import { DeleteExpenseDialog } from "./delete-expense-dialog";
import { EditExpenseForm } from "./edit-expense-form";
import { ViewExpenseDrawerContent } from "./view-expense-drawer-content";
import { useExpenseStore } from "../store";
import { expenseApiAmountToReais, type Expense } from "../type";

function formatBrl(reais: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

export function ExpensesTable() {
  const { open, close } = useDrawer();
  const expenses = useExpenseStore((s) => s.expenses);
  const loadingList = useExpenseStore((s) => s.loadingList);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const loadingDeleteUuid = useExpenseStore((s) => s.loadingDeleteUuid);
  const categories = useCategoryStore((s) => s.categories);
  const accounts = useAccountStore((s) => s.accounts);
  const tags = useTagStore((s) => s.tags);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteExpense(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  if (loadingList && expenses.length === 0) {
    return <LoadingCard />;
  }

  if (!loadingList && expenses.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhuma despesa cadastrada. Use <strong className="text-foreground">Cadastrar</strong> para
        adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteExpenseDialog
        expense={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-3 text-left font-medium text-foreground">Descrição</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Valor</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Data</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Conta</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Categoria</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Tag</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Pago</th>
              <th className="px-3 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((row) => {
              const rowDeleting = loadingDeleteUuid === row.uuid;
              const cat = categories.find((c) => c.uuid === row.categoryUuid);
              const acc = accounts.find((a) => a.uuid === row.accountUuid);
              const tag = row.tagUuid ? tags.find((t) => t.uuid === row.tagUuid) : undefined;
              return (
                <tr
                  key={row.uuid}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-3 font-medium text-foreground">{row.description}</td>
                  <td className="px-3 py-3 tabular-nums text-foreground">
                    {formatBrl(expenseApiAmountToReais(row.amount))}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {new Date(row.datePaid).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="max-w-[180px] truncate px-3 py-3 text-foreground">
                    {acc?.description ?? "—"}
                  </td>
                  <td className="max-w-[160px] truncate px-3 py-3 text-foreground">
                    {cat?.nome ?? "—"}
                  </td>
                  <td className="max-w-[120px] truncate px-3 py-3 text-foreground">
                    {tag?.nome ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-foreground">{row.wasPaid ? "Sim" : "Não"}</td>
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
                            id: `expense-view-${row.uuid}`,
                            title: "Visualizar despesa",
                            content: <ViewExpenseDrawerContent expenseUuid={row.uuid} onClose={close} />,
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
                            id: `expense-edit-${row.uuid}`,
                            title: "Editar despesa",
                            content: <EditExpenseForm expenseUuid={row.uuid} initialExpense={row} onSuccess={close} />,
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
