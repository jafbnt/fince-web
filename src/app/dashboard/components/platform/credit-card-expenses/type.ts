import { z } from "zod";
import {
  dateInputToIsoUtcDate,
  isoToDateInputValue,
  revenueApiAmountToReais as ccExpenseAmountToReais,
} from "../revenue/type";

export { ccExpenseAmountToReais };

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
  repeatEnabled: boolean;
  repeatCount: number;
  repeatInterval: string;
};

export type CreateCreditCardExpensePayload = {
  amount: number;
  datePaid: string;
  description: string;
  categoryUuid: string;
  creditCardUuid: string;
  invoiceDate: string;
  ignoreTransaction: boolean;
  tagUuid: string | null;
  notation: string;
  fixedExpense: boolean;
  repeatEnabled: boolean;
  repeatCount: number;
  repeatInterval: string;
};

export type UpdateCreditCardExpensePayload = CreateCreditCardExpensePayload;

/** Converte mês do input (yyyy-MM) em ISO do primeiro dia (UTC), ou repassa string já completa. */
export function invoiceMonthToIso(monthYyyyMm: string): string {
  const t = monthYyyyMm.trim();
  if (/^\d{4}-\d{2}$/.test(t)) {
    return dateInputToIsoUtcDate(`${t}-01`);
  }
  return t;
}

/** Resposta API → valor para `<input type="month">`. */
export function apiInvoiceDateToMonthValue(api: string): string {
  const s = api.trim();
  if (/^\d{4}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}`;
}

export function formValuesToCreditCardExpensePayload(
  values: CreateCreditCardExpenseFormValues,
): CreateCreditCardExpensePayload {
  const tag = values.tagUuid.trim();
  return {
    amount: Number(values.amount),
    datePaid: dateInputToIsoUtcDate(values.datePaid),
    description: values.description.trim(),
    categoryUuid: values.categoryUuid,
    creditCardUuid: values.creditCardUuid,
    invoiceDate: invoiceMonthToIso(values.invoiceDate),
    ignoreTransaction: values.ignoreTransaction,
    tagUuid: tag ? tag : null,
    notation: values.notation.trim(),
    fixedExpense: values.fixedExpense,
    repeatEnabled: values.repeatEnabled,
    repeatCount: values.repeatCount,
    repeatInterval: values.repeatInterval.trim(),
  };
}

export const createCreditCardExpenseSchema = z
  .object({
    amount: z.number().refine((n) => Number.isFinite(n), "Valor inválido"),
    datePaid: z.string().min(1, "Informe a data do pagamento"),
    description: z.string().min(1, "Informe a descrição"),
    categoryUuid: z.string().min(1, "Selecione uma categoria"),
    creditCardUuid: z.string().min(1, "Selecione um cartão"),
    invoiceDate: z.string().min(1, "Informe o mês da fatura"),
    tagUuid: z.string(),
    ignoreTransaction: z.boolean(),
    notation: z.string(),
    fixedExpense: z.boolean(),
    repeatEnabled: z.boolean(),
    repeatCount: z.number().int().min(0, "Quantidade inválida"),
    repeatInterval: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.repeatEnabled && !data.repeatInterval.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o intervalo (ex.: monthly, weekly)",
        path: ["repeatInterval"],
      });
    }
  });

export type CreateCreditCardExpenseFormValues = z.infer<typeof createCreditCardExpenseSchema>;

export function creditCardExpenseToFormDefaults(
  e: CreditCardExpense,
): CreateCreditCardExpenseFormValues {
  return {
    amount: ccExpenseAmountToReais(e.amount),
    datePaid: isoToDateInputValue(e.datePaid),
    description: e.description,
    categoryUuid: e.categoryUuid,
    creditCardUuid: e.creditCardUuid,
    invoiceDate: apiInvoiceDateToMonthValue(e.invoiceDate),
    tagUuid: e.tagUuid?.trim() ?? "",
    ignoreTransaction: e.ignoreTransaction,
    notation: e.notation,
    fixedExpense: e.fixedExpense,
    repeatEnabled: e.repeatEnabled,
    repeatCount: e.repeatCount,
    repeatInterval: e.repeatInterval ?? "",
  };
}
