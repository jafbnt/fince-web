import { useEffect, useState } from "react";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { creditCardLabel } from "../../credit-card/type";
import { useCreditCardStore } from "../../credit-card/store";
import { useCategoryStore } from "../../category/store";
import { useTagStore } from "../../tag/store";
import { EditCreditCardExpenseForm } from "./edit-credit-card-expense-form";
import { useCreditCardExpenseStore } from "../store";
import {
  ccExpenseAmountToReais,
  formatInstallmentOptionLabel,
  formatInvoiceDateForDisplay,
  type CreditCardExpense,
} from "../type";

type ViewCreditCardExpenseDrawerContentProps = {
  expenseUuid: string;
  onClose: () => void;
};

function formatBrl(reais: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

export function ViewCreditCardExpenseDrawerContent({
  expenseUuid,
  onClose,
}: ViewCreditCardExpenseDrawerContentProps) {
  const fetchCreditCardExpenseByUuid = useCreditCardExpenseStore((s) => s.fetchCreditCardExpenseByUuid);
  const fetchCreditCards = useCreditCardStore((s) => s.fetchCreditCards);
  const creditCards = useCreditCardStore((s) => s.creditCards);
  const categories = useCategoryStore((s) => s.categories);
  const tags = useTagStore((s) => s.tags);
  const [expense, setExpense] = useState<CreditCardExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (creditCards.length === 0) {
      void fetchCreditCards();
    }
  }, [creditCards.length, fetchCreditCards]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const e = await fetchCreditCardExpenseByUuid(expenseUuid);
      if (!cancelled) {
        setExpense(e);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [expenseUuid, fetchCreditCardExpenseByUuid]);

  if (loading) {
    return <LoadingCenter />;
  }

  if (!expense) {
    return <p className="text-sm text-destructive">Não foi possível carregar a despesa de cartão.</p>;
  }

  if (mode === "edit") {
    return (
      <EditCreditCardExpenseForm
        expenseUuid={expenseUuid}
        initialExpense={expense}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  const categoryNome = categories.find((c) => c.uuid === expense.categoryUuid)?.nome ?? "—";
  const card = creditCards.find((c) => c.uuid === expense.creditCardUuid);
  const cardLabel = card ? creditCardLabel(card) : "—";
  const tagNome = expense.tagUuid
    ? (tags.find((t) => t.uuid === expense.tagUuid)?.nome ?? expense.tagUuid)
    : "—";
  const totalReais = ccExpenseAmountToReais(expense.amount);
  const inst = expense.installments ?? 1;

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-cc-expense-description">Descrição</FieldLabel>
          <Input id="view-cc-expense-description" readOnly disabled value={expense.description} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-cc-expense-amount">Valor</FieldLabel>
          <Input
            id="view-cc-expense-amount"
            readOnly
            disabled
            value={formatBrl(ccExpenseAmountToReais(expense.amount))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-cc-expense-date">Data do pagamento</FieldLabel>
          <Input
            id="view-cc-expense-date"
            readOnly
            disabled
            value={new Date(expense.datePaid).toLocaleDateString("pt-BR")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-cc-expense-invoice">Data da fatura</FieldLabel>
          <Input
            id="view-cc-expense-invoice"
            readOnly
            disabled
            value={formatInvoiceDateForDisplay(expense.invoiceDate)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-cc-expense-card">Cartão</FieldLabel>
          <Input id="view-cc-expense-card" readOnly disabled value={cardLabel} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-cc-expense-category">Categoria</FieldLabel>
          <Input id="view-cc-expense-category" readOnly disabled value={categoryNome} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-cc-expense-tag">Tag</FieldLabel>
          <Input id="view-cc-expense-tag" readOnly disabled value={tagNome} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-cc-expense-notation">Anotação</FieldLabel>
          <Textarea id="view-cc-expense-notation" readOnly disabled rows={3} value={expense.notation} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-cc-expense-ignore-tx">Ignorar transação</FieldLabel>
          <Input
            id="view-cc-expense-ignore-tx"
            readOnly
            disabled
            value={expense.ignoreTransaction ? "Sim" : "Não"}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-cc-expense-recorrente">Recorrente</FieldLabel>
          <Input
            id="view-cc-expense-recorrente"
            readOnly
            disabled
            value={expense.fixedExpense ? "Sim" : "Não"}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-cc-expense-installments">Parcelas</FieldLabel>
          <Input
            id="view-cc-expense-installments"
            readOnly
            disabled
            value={
              expense.fixedExpense
                ? "—"
                : formatInstallmentOptionLabel(inst, totalReais)
            }
          />
        </Field>
      </FieldGroup>
      <div className="flex justify-end pt-2">
        <Button type="button" onClick={() => setMode("edit")}>
          Editar
        </Button>
      </div>
    </div>
  );
}
