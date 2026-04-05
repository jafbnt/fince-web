import { useEffect, useState } from "react";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAccountStore } from "../../account/store";
import { useCategoryStore } from "../../category/store";
import { EditRevenueForm } from "./edit-revenue-form";
import { useRevenueStore } from "../store";
import { revenueApiAmountToReais, type Revenue } from "../type";

type ViewRevenueDrawerContentProps = {
  revenueUuid: string;
  onClose: () => void;
};

function formatBrl(reais: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

export function ViewRevenueDrawerContent({ revenueUuid, onClose }: ViewRevenueDrawerContentProps) {
  const fetchRevenueByUuid = useRevenueStore((s) => s.fetchRevenueByUuid);
  const categories = useCategoryStore((s) => s.categories);
  const accounts = useAccountStore((s) => s.accounts);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await fetchRevenueByUuid(revenueUuid);
      if (!cancelled) {
        setRevenue(r);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [revenueUuid, fetchRevenueByUuid]);

  if (loading) {
    return <LoadingCenter />;
  }

  if (!revenue) {
    return <p className="text-sm text-destructive">Não foi possível carregar a receita.</p>;
  }

  if (mode === "edit") {
    return (
      <EditRevenueForm
        revenueUuid={revenueUuid}
        initialRevenue={revenue}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  const categoryNome = categories.find((c) => c.uuid === revenue.categoryUuid)?.nome ?? "—";
  const accountDesc = accounts.find((a) => a.uuid === revenue.accountUuid)?.description ?? "—";
  const receivedLabel = revenue.wasReceived ? "Sim" : "Não";

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-revenue-description">Descrição</FieldLabel>
          <Input id="view-revenue-description" readOnly disabled value={revenue.description} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-revenue-amount">Valor</FieldLabel>
          <Input
            id="view-revenue-amount"
            readOnly
            disabled
            value={formatBrl(revenueApiAmountToReais(revenue.amount))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-revenue-date">Data de recebimento</FieldLabel>
          <Input
            id="view-revenue-date"
            readOnly
            disabled
            value={new Date(revenue.dateReceipt).toLocaleDateString("pt-BR")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-revenue-received">Já recebido</FieldLabel>
          <Input id="view-revenue-received" readOnly disabled value={receivedLabel} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-revenue-account">Conta</FieldLabel>
          <Input id="view-revenue-account" readOnly disabled value={accountDesc} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-revenue-category">Categoria</FieldLabel>
          <Input id="view-revenue-category" readOnly disabled value={categoryNome} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-revenue-notation">Anotação</FieldLabel>
          <Textarea id="view-revenue-notation" readOnly disabled rows={3} value={revenue.notation} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-revenue-ignore-tx">Ignorar transação</FieldLabel>
          <Input
            id="view-revenue-ignore-tx"
            readOnly
            disabled
            value={revenue.ignoreTransaction ? "Sim" : "Não"}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-revenue-fixed">Despesa fixa</FieldLabel>
          <Input
            id="view-revenue-fixed"
            readOnly
            disabled
            value={revenue.fixedExpense ? "Sim" : "Não"}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-revenue-repeat-en">Repetição</FieldLabel>
          <Input
            id="view-revenue-repeat-en"
            readOnly
            disabled
            value={revenue.repeatEnabled ? "Sim" : "Não"}
          />
        </Field>
        {revenue.repeatEnabled ? (
          <>
            <Field>
              <FieldLabel htmlFor="view-revenue-repeat-count">Quantidade</FieldLabel>
              <Input
                id="view-revenue-repeat-count"
                readOnly
                disabled
                value={String(revenue.repeatCount)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="view-revenue-repeat-int">Intervalo</FieldLabel>
              <Input
                id="view-revenue-repeat-int"
                readOnly
                disabled
                value={revenue.repeatInterval || "—"}
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
