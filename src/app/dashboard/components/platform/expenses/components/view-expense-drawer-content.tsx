import { useEffect, useState } from "react";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAccountStore } from "../../account/store";
import { useCategoryStore } from "../../category/store";
import { useTagStore } from "../../tag/store";
import { EditExpenseForm } from "./edit-expense-form";
import { useExpenseStore } from "../store";
import { expenseApiAmountToReais, type Expense } from "../type";

type ViewExpenseDrawerContentProps = {
  expenseUuid: string;
  onClose: () => void;
};

function formatBrl(reais: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

export function ViewExpenseDrawerContent({ expenseUuid, onClose }: ViewExpenseDrawerContentProps) {
  const fetchExpenseByUuid = useExpenseStore((s) => s.fetchExpenseByUuid);
  const categories = useCategoryStore((s) => s.categories);
  const accounts = useAccountStore((s) => s.accounts);
  const tags = useTagStore((s) => s.tags);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const e = await fetchExpenseByUuid(expenseUuid);
      if (!cancelled) {
        setExpense(e);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [expenseUuid, fetchExpenseByUuid]);

  if (loading) {
    return <LoadingCenter />;
  }

  if (!expense) {
    return <p className="text-sm text-destructive">Não foi possível carregar a despesa.</p>;
  }

  if (mode === "edit") {
    return (
      <EditExpenseForm
        expenseUuid={expenseUuid}
        initialExpense={expense}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  const categoryNome = categories.find((c) => c.uuid === expense.categoryUuid)?.nome ?? "—";
  const accountDesc = accounts.find((a) => a.uuid === expense.accountUuid)?.description ?? "—";
  const tagNome = expense.tagUuid
    ? (tags.find((t) => t.uuid === expense.tagUuid)?.nome ?? expense.tagUuid)
    : "—";

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-expense-description">Descrição</FieldLabel>
          <Input id="view-expense-description" readOnly disabled value={expense.description} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-expense-amount">Valor</FieldLabel>
          <Input
            id="view-expense-amount"
            readOnly
            disabled
            value={formatBrl(expenseApiAmountToReais(expense.amount))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-expense-date">Data do pagamento</FieldLabel>
          <Input
            id="view-expense-date"
            readOnly
            disabled
            value={new Date(expense.datePaid).toLocaleDateString("pt-BR")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-expense-paid">Já pago</FieldLabel>
          <Input id="view-expense-paid" readOnly disabled value={expense.wasPaid ? "Sim" : "Não"} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-expense-account">Conta</FieldLabel>
          <Input id="view-expense-account" readOnly disabled value={accountDesc} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-expense-category">Categoria</FieldLabel>
          <Input id="view-expense-category" readOnly disabled value={categoryNome} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-expense-tag">Tag</FieldLabel>
          <Input id="view-expense-tag" readOnly disabled value={tagNome} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-expense-notation">Anotação</FieldLabel>
          <Textarea id="view-expense-notation" readOnly disabled rows={3} value={expense.notation} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-expense-ignore-tx">Ignorar transação</FieldLabel>
          <Input
            id="view-expense-ignore-tx"
            readOnly
            disabled
            value={expense.ignoreTransaction ? "Sim" : "Não"}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-expense-fixed">Despesa fixa</FieldLabel>
          <Input
            id="view-expense-fixed"
            readOnly
            disabled
            value={expense.fixedExpense ? "Sim" : "Não"}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-expense-repeat-en">Repetição</FieldLabel>
          <Input
            id="view-expense-repeat-en"
            readOnly
            disabled
            value={expense.repeatEnabled ? "Sim" : "Não"}
          />
        </Field>
        {expense.repeatEnabled ? (
          <>
            <Field>
              <FieldLabel htmlFor="view-expense-repeat-count">Quantidade</FieldLabel>
              <Input
                id="view-expense-repeat-count"
                readOnly
                disabled
                value={String(expense.repeatCount)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="view-expense-repeat-int">Intervalo</FieldLabel>
              <Input
                id="view-expense-repeat-int"
                readOnly
                disabled
                value={expense.repeatInterval || "—"}
              />
            </Field>
          </>
        ) : null}
      </FieldGroup>
      <div className="flex justify-end pt-2">
        <Button type="button" onClick={() => setMode("edit")}>
          Editar
        </Button>
      </div>
    </div>
  );
}
