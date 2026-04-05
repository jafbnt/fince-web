import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { formatInvoiceDateForDisplay } from "../../credit-card-expenses/type";
import { revenueApiAmountToReais } from "../../revenue/type";
import {
  transactionSourceLabel,
  triBoolPt,
  type Transaction,
} from "../type";

type ViewTransactionDrawerContentProps = {
  transaction: Transaction;
};

function formatBrl(reais: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

function formatDateIso(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function ViewTransactionDrawerContent({ transaction: t }: ViewTransactionDrawerContentProps) {
  const installmentsLabel =
    t.installments != null && Number.isFinite(t.installments) ? `${t.installments}x` : "—";

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="tx-source">Origem</FieldLabel>
          <Input
            id="tx-source"
            readOnly
            disabled
            value={transactionSourceLabel(String(t.source))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-uuid">UUID</FieldLabel>
          <Input id="tx-uuid" readOnly disabled value={t.uuid} className="font-mono text-xs" />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-description">Descrição</FieldLabel>
          <Input id="tx-description" readOnly disabled value={t.description} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-amount">Valor</FieldLabel>
          <Input
            id="tx-amount"
            readOnly
            disabled
            value={formatBrl(revenueApiAmountToReais(t.amount))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-occurred">Data da movimentação</FieldLabel>
          <Input id="tx-occurred" readOnly disabled value={formatDateIso(t.occurredAt)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-notation">Anotação</FieldLabel>
          <Textarea
            id="tx-notation"
            readOnly
            disabled
            value={t.notation?.trim() ? t.notation : "—"}
            rows={3}
          />
        </Field>
        <Field>
          <FieldLabel>Categoria</FieldLabel>
          {t.category ? (
            <div
              className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-xl border border-black/10 py-0.5 pl-1 pr-2 text-gray-700 shadow-sm dark:border-white/20 dark:text-white"
              style={{ backgroundColor: t.category.colorHex }}
            >
              <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden" aria-hidden>
                <LogoSvgPreview
                  svg={t.category.logoSvg}
                  className="h-5 w-5 rounded-none p-0 [&_circle]:fill-gray-700! dark:[&_circle]:fill-white! [&_path]:fill-gray-700! dark:[&_path]:fill-white! [&_rect]:fill-gray-700! dark:[&_rect]:fill-white!"
                  isIcon={false}
                />
              </div>
              <span className="min-w-0 truncate text-xs font-semibold tracking-tight">
                {t.category.nome}
              </span>
            </div>
          ) : (
            <Input readOnly disabled value="—" />
          )}
        </Field>
        <Field>
          <FieldLabel>Tag</FieldLabel>
          <Input readOnly disabled value={t.tag?.nome ?? "—"} />
        </Field>
        <Field>
          <FieldLabel>Conta</FieldLabel>
          {t.account ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <LogoSvgPreview
                svg={t.account.bankLogoSvg}
                className="h-12 w-20 shrink-0"
                isIcon={false}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{t.account.description}</div>
                <div className="text-xs text-muted-foreground">
                  {t.account.bankName} · {t.account.bankTypeName}
                </div>
              </div>
            </div>
          ) : (
            <Input readOnly disabled value="—" />
          )}
        </Field>
        <Field>
          <FieldLabel>Cartão de crédito</FieldLabel>
          {t.creditCard ? (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <LogoSvgPreview
                svg={t.creditCard.bankLogoSvg}
                className="h-12 w-20 shrink-0"
                isIcon={false}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{t.creditCard.description}</div>
                <div className="text-xs text-muted-foreground">
                  {t.creditCard.bankName} · {t.creditCard.bankTypeName} · {t.creditCard.flagName}
                </div>
              </div>
              <LogoSvgPreview
                svg={t.creditCard.flagLogoSvg}
                className="h-8 w-12 shrink-0"
                isIcon={false}
              />
            </div>
          ) : (
            <Input readOnly disabled value="—" />
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-received">Recebido</FieldLabel>
          <Input id="tx-received" readOnly disabled value={triBoolPt(t.wasReceived)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-date-receipt">Data de recebimento</FieldLabel>
          <Input id="tx-date-receipt" readOnly disabled value={formatDateIso(t.dateReceipt)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-paid">Pago</FieldLabel>
          <Input id="tx-paid" readOnly disabled value={triBoolPt(t.wasPaid)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-date-paid">Data de pagamento</FieldLabel>
          <Input id="tx-date-paid" readOnly disabled value={formatDateIso(t.datePaid)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-fixed">Recorrente</FieldLabel>
          <Input id="tx-fixed" readOnly disabled value={t.fixedExpense ? "Sim" : "Não"} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-repeat">Repetição ativa</FieldLabel>
          <Input id="tx-repeat" readOnly disabled value={triBoolPt(t.repeatEnabled)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-repeat-count">Repetições</FieldLabel>
          <Input
            id="tx-repeat-count"
            readOnly
            disabled
            value={t.repeatCount != null ? String(t.repeatCount) : "—"}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-repeat-interval">Intervalo</FieldLabel>
          <Input
            id="tx-repeat-interval"
            readOnly
            disabled
            value={t.repeatInterval?.trim() ? t.repeatInterval : "—"}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-installments">Parcelas</FieldLabel>
          <Input id="tx-installments" readOnly disabled value={installmentsLabel} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tx-invoice">Data da fatura</FieldLabel>
          <Input
            id="tx-invoice"
            readOnly
            disabled
            value={t.invoiceDate ? formatInvoiceDateForDisplay(t.invoiceDate) : "—"}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
