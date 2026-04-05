/**
 * Transações consolidadas (GET /api/transactions).
 */
/** Valores conhecidos: `expense`, `credit_card_expense`, `revenue`; a API pode enviar outros. */
export type TransactionSource = string;

export type TransactionListCategory = {
  nome: string;
  logoSvg: string;
  colorHex: string;
};

export type TransactionListAccount = {
  description: string;
  bankName: string;
  bankLogoSvg: string;
  bankTypeName: string;
};

export type TransactionListCreditCard = {
  description: string;
  bankName: string;
  bankLogoSvg: string;
  bankTypeName: string;
  flagName: string;
  flagLogoSvg: string;
};

export type TransactionListTag = {
  nome: string;
  uuid?: string;
};

export type Transaction = {
  source: TransactionSource;
  uuid: string;
  amount: string | number;
  occurredAt: string;
  description: string;
  notation: string;
  category: TransactionListCategory | null;
  tag: TransactionListTag | null;
  account: TransactionListAccount | null;
  creditCard: TransactionListCreditCard | null;
  wasReceived: boolean | null;
  dateReceipt: string | null;
  wasPaid: boolean | null;
  datePaid: string | null;
  fixedExpense: boolean;
  repeatEnabled: boolean | null;
  repeatCount: number | null;
  repeatInterval: string | null;
  installments: number | null;
  invoiceDate: string | null;
};

export function transactionSourceLabel(source: string): string {
  switch (source) {
    case "expense":
      return "Despesa";
    case "credit_card_expense":
      return "Cartão";
    case "revenue":
      return "Receita";
    default:
      return source;
  }
}

export function triBoolPt(v: boolean | null | undefined): string {
  if (v === true) return "Sim";
  if (v === false) return "Não";
  return "—";
}
