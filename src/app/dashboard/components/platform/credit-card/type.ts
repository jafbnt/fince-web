import { z } from "zod";

export type CreditCard = {
  uuid: string;
  description: string;
  flagUuid: string;
  bankUuid: string;
  bankTypeUuid: string;
  closingDay: number;
  dueDate: number;
};

export type CreateCreditCardPayload = {
  description: string;
  flagUuid: string;
  bankUuid: string;
  bankTypeUuid: string;
  closingDay: number;
  dueDate: number;
};

export type UpdateCreditCardPayload = CreateCreditCardPayload;

export const createCreditCardSchema = z.object({
  description: z.string().min(1, "Informe a descrição"),
  flagUuid: z.string().min(1, "Selecione uma bandeira"),
  bankUuid: z.string().min(1, "Selecione um banco"),
  bankTypeUuid: z.string().min(1, "Selecione um tipo de conta"),
  closingDay: z
    .number()
    .int()
    .min(1, "Dia entre 1 e 31")
    .max(31, "Dia entre 1 e 31"),
  dueDate: z
    .number()
    .int()
    .min(1, "Dia entre 1 e 31")
    .max(31, "Dia entre 1 e 31"),
});

export type CreateCreditCardFormValues = z.infer<typeof createCreditCardSchema>;

export function creditCardLabel(c: Pick<CreditCard, "description"> & { name?: string }): string {
  return c.description?.trim() || c.name?.trim() || "Cartão";
}

export function creditCardToFormDefaults(c: CreditCard): CreateCreditCardFormValues {
  return {
    description: c.description,
    flagUuid: c.flagUuid,
    bankUuid: c.bankUuid,
    bankTypeUuid: c.bankTypeUuid,
    closingDay: c.closingDay,
    dueDate: c.dueDate,
  };
}
