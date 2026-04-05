import { z } from "zod";
import {
  dateInputToIsoUtcDate,
  isoToDateInputValue,
  revenueApiAmountToReais as ccExpenseAmountToReais,
} from "../revenue/type";

export { ccExpenseAmountToReais };

export const CREDIT_CARD_EXPENSE_MAX_INSTALLMENTS = 12;

export type CreditCardExpense = {
  uuid: string;
  amount: string | number;
  datePaid: string;
  description: string;
  categoryUuid: string;
  creditCardUuid: string;
  invoiceDate: string;
  ignoreTransaction: boolean;
  tagUuid?: string | null;
  notation: string;
  fixedExpense: boolean;
  installments?: number;
};

export type CreateCreditCardExpensePayload = {
  amount: number;
  datePaid: string;
  description: string;
  categoryUuid: string;
  creditCardUuid: string;
  /** API: `yyyy-MM-dd` (ex.: `"2026-05-01"`). */
  invoiceDate: string;
  ignoreTransaction: boolean;
  tagUuid: string | null;
  notation: string;
  fixedExpense: boolean;
  installments: number;
};

export type UpdateCreditCardExpensePayload = CreateCreditCardExpensePayload;

/**
 * Resposta API (`yyyy-MM-dd` ou ISO) → valor para `<input type="date">`.
 */
export function apiInvoiceDateToDateInputValue(api: string): string {
  const s = api.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s]|$)/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return isoToDateInputValue(s);
}

/**
 * `<input type="date">` → `yyyy-MM-dd` para create/update (igual ao GET list).
 */
export function invoiceDateFormToApiPayload(dateStr: string): string {
  const t = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const parsed = isoToDateInputValue(t);
  return /^\d{4}-\d{2}-\d{2}$/.test(parsed) ? parsed : t;
}

/** Exibição pt-BR da data da fatura (API `yyyy-MM-dd` ou ISO). */
export function formatInvoiceDateForDisplay(api: string): string {
  const s = api.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) {
    const [, y, mo, day] = m;
    return `${day}/${mo}/${y}`;
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const brlFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Rótulo para opção de parcelas (valor total em reais no formulário). */
export function formatInstallmentOptionLabel(installmentCount: number, amountReais: number): string {
  if (!Number.isFinite(amountReais) || amountReais <= 0) {
    return `${installmentCount}x`;
  }
  const per = amountReais / installmentCount;
  return `${installmentCount} x ${brlFmt.format(per)}`;
}

export function formValuesToCreditCardExpensePayload(
  values: CreateCreditCardExpenseFormValues,
): CreateCreditCardExpensePayload {
  const tag = values.tagUuid.trim();
  const installments =
    values.fixedExpense || !(Number.isFinite(values.amount) && values.amount > 0)
      ? 1
      : values.installments;
  return {
    amount: Number(values.amount),
    datePaid: dateInputToIsoUtcDate(values.datePaid),
    description: values.description.trim(),
    categoryUuid: values.categoryUuid,
    creditCardUuid: values.creditCardUuid,
    invoiceDate: invoiceDateFormToApiPayload(values.invoiceDate),
    ignoreTransaction: values.ignoreTransaction,
    tagUuid: tag ? tag : null,
    notation: values.notation.trim(),
    fixedExpense: values.fixedExpense,
    installments: Math.min(
      CREDIT_CARD_EXPENSE_MAX_INSTALLMENTS,
      Math.max(1, Math.trunc(installments)),
    ),
  };
}

export const createCreditCardExpenseSchema = z
  .object({
    amount: z.number().refine((n) => Number.isFinite(n), "Valor inválido"),
    datePaid: z.string().min(1, "Informe a data do pagamento"),
    description: z.string().min(1, "Informe a descrição"),
    categoryUuid: z.string().min(1, "Selecione uma categoria"),
    creditCardUuid: z.string().min(1, "Selecione um cartão"),
    invoiceDate: z.string().min(1, "Informe a data da fatura"),
    tagUuid: z.string(),
    ignoreTransaction: z.boolean(),
    notation: z.string(),
    fixedExpense: z.boolean(),
    installments: z
      .number()
      .int()
      .min(1, "Parcelas entre 1 e 12")
      .max(CREDIT_CARD_EXPENSE_MAX_INSTALLMENTS, "Parcelas entre 1 e 12"),
  });

export type CreateCreditCardExpenseFormValues = z.infer<typeof createCreditCardExpenseSchema>;

function normalizeInstallmentsFromApi(e: CreditCardExpense): number {
  const n = e.installments;
  if (typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= CREDIT_CARD_EXPENSE_MAX_INSTALLMENTS) {
    return n;
  }
  if (typeof n === "string") {
    const v = parseInt(n, 10);
    if (Number.isInteger(v) && v >= 1 && v <= CREDIT_CARD_EXPENSE_MAX_INSTALLMENTS) return v;
  }
  return 1;
}

export function creditCardExpenseToFormDefaults(
  e: CreditCardExpense,
): CreateCreditCardExpenseFormValues {
  return {
    amount: ccExpenseAmountToReais(e.amount),
    datePaid: isoToDateInputValue(e.datePaid),
    description: e.description,
    categoryUuid: e.categoryUuid,
    creditCardUuid: e.creditCardUuid,
    invoiceDate: apiInvoiceDateToDateInputValue(e.invoiceDate),
    tagUuid: e.tagUuid?.trim() ?? "",
    ignoreTransaction: e.ignoreTransaction,
    notation: e.notation,
    fixedExpense: e.fixedExpense,
    installments: normalizeInstallmentsFromApi(e),
  };
}
