import { z } from "zod";
import {
  dateInputToIsoUtcDate,
  isoToDateInputValue,
  revenueApiAmountToReais as expenseApiAmountToReais,
} from "../revenue/type";

export { expenseApiAmountToReais };

export type Expense = {
  uuid: string;
  amount: string | number;
  wasPaid: boolean;
  datePaid: string;
  description: string;
  categoryUuid: string;
  accountUuid: string;
  ignoreTransaction: boolean;
  tagUuid?: string | null;
  notation: string;
  fixedExpense: boolean;
  repeatEnabled: boolean;
  repeatCount: number;
  repeatInterval: string;
};

export type CreateExpensePayload = {
  amount: number;
  wasPaid: boolean;
  datePaid: string;
  description: string;
  categoryUuid: string;
  accountUuid: string;
  ignoreTransaction: boolean;
  tagUuid: string | null;
  notation: string;
  fixedExpense: boolean;
  repeatEnabled: boolean;
  repeatCount: number;
  repeatInterval: string;
};

export type UpdateExpensePayload = CreateExpensePayload;

export function formValuesToExpensePayload(values: CreateExpenseFormValues): CreateExpensePayload {
  const tag = values.tagUuid.trim();
  return {
    amount: Number(values.amount),
    wasPaid: values.wasPaid,
    datePaid: dateInputToIsoUtcDate(values.datePaid),
    description: values.description.trim(),
    categoryUuid: values.categoryUuid,
    accountUuid: values.accountUuid,
    ignoreTransaction: values.ignoreTransaction,
    tagUuid: tag ? tag : null,
    notation: values.notation.trim(),
    fixedExpense: values.fixedExpense,
    repeatEnabled: values.repeatEnabled,
    repeatCount: values.repeatCount,
    repeatInterval: values.repeatInterval.trim(),
  };
}

export const createExpenseSchema = z
  .object({
    amount: z.number().refine((n) => Number.isFinite(n), "Valor inválido"),
    wasPaid: z.boolean(),
    datePaid: z.string().min(1, "Informe a data do pagamento"),
    description: z.string().min(1, "Informe a descrição"),
    categoryUuid: z.string().min(1, "Selecione uma categoria"),
    accountUuid: z.string().min(1, "Selecione uma conta"),
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

export type CreateExpenseFormValues = z.infer<typeof createExpenseSchema>;

export function expenseToFormDefaults(e: Expense): CreateExpenseFormValues {
  return {
    amount: expenseApiAmountToReais(e.amount),
    wasPaid: e.wasPaid,
    datePaid: isoToDateInputValue(e.datePaid),
    description: e.description,
    categoryUuid: e.categoryUuid,
    accountUuid: e.accountUuid,
    tagUuid: e.tagUuid?.trim() ?? "",
    ignoreTransaction: e.ignoreTransaction,
    notation: e.notation,
    fixedExpense: e.fixedExpense,
    repeatEnabled: e.repeatEnabled,
    repeatCount: e.repeatCount,
    repeatInterval: e.repeatInterval ?? "",
  };
}
