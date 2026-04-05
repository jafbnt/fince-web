import { z } from "zod";

/** Item retornado pelo GET list / GET por uuid / PATCH. */
export type Revenue = {
  uuid: string;
  amount: string | number;
  wasReceived: boolean;
  dateReceipt: string;
  description: string;
  categoryUuid: string;
  accountUuid: string;
  ignoreTransaction: boolean;
  transactionUuid?: string | null;
  tagUuid?: string | null;
  notation: string;
  fixedExpense: boolean;
  repeatEnabled: boolean;
  repeatCount: number;
  repeatInterval: string;
};

export type CreateRevenuePayload = {
  amount: number;
  wasReceived: boolean;
  dateReceipt: string;
  description: string;
  categoryUuid: string;
  accountUuid: string;
  files: [];
  ignoreTransaction: boolean;
  transactionUuid: string | null;
  notation: string;
  fixedExpense: boolean;
  repeatEnabled: boolean;
  repeatCount: number;
  repeatInterval: string;
};

export type UpdateRevenuePayload = CreateRevenuePayload;

/**
 * Converte amount da API para reais do formulário/UI.
 * - Inteiro em string: `"380"` → 380 (reais).
 * - Decimal: `"3,80"` / `"3.8"` → 3,8 reais.
 */
export function revenueApiAmountToReais(amount: string | number): number {
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? amount : 0;
  }
  const t = amount.trim();
  if (t === "") return 0;
  if (/[.,]/.test(t)) {
    const n = Number(t.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

/** ISO da API → valor de `<input type="date">` (data civil em UTC, alinhada ao que enviamos). */
export function isoToDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

/** `yyyy-MM-dd` do formulário → ISO meia-noite UTC desse dia civil. */
export function dateInputToIsoUtcDate(dateStr: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) {
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
  }
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  return new Date(Date.UTC(y, mo - 1, day, 0, 0, 0, 0)).toISOString();
}

export function formValuesToRevenuePayload(values: CreateRevenueFormValues): CreateRevenuePayload {
  return {
    amount: Number(values.amount),
    wasReceived: values.wasReceived,
    dateReceipt: dateInputToIsoUtcDate(values.dateReceipt),
    description: values.description.trim(),
    categoryUuid: values.categoryUuid,
    accountUuid: values.accountUuid,
    files: [],
    ignoreTransaction: values.ignoreTransaction,
    transactionUuid: null,
    notation: values.notation.trim(),
    fixedExpense: values.fixedExpense,
    repeatEnabled: values.repeatEnabled,
    repeatCount: values.repeatCount,
    repeatInterval: values.repeatInterval.trim(),
  };
}

export const createRevenueSchema = z
  .object({
    amount: z.number().refine((n) => Number.isFinite(n), "Valor inválido"),
    wasReceived: z.boolean(),
    dateReceipt: z.string().min(1, "Informe a data do recebimento"),
    description: z.string().min(1, "Informe a descrição"),
    categoryUuid: z.string().min(1, "Selecione uma categoria"),
    accountUuid: z.string().min(1, "Selecione uma conta"),
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

export type CreateRevenueFormValues = z.infer<typeof createRevenueSchema>;

export function revenueToFormDefaults(r: Revenue): CreateRevenueFormValues {
  return {
    amount: revenueApiAmountToReais(r.amount),
    wasReceived: r.wasReceived,
    dateReceipt: isoToDateInputValue(r.dateReceipt),
    description: r.description,
    categoryUuid: r.categoryUuid,
    accountUuid: r.accountUuid,
    ignoreTransaction: r.ignoreTransaction,
    notation: r.notation,
    fixedExpense: r.fixedExpense,
    repeatEnabled: r.repeatEnabled,
    repeatCount: r.repeatCount,
    repeatInterval: r.repeatInterval ?? "",
  };
}
