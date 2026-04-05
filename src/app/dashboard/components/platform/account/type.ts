import { z } from "zod";

export type Account = {
  uuid: string;
  description: string;
  balance: number;
  bankUuid: string;
  bankTypeUuid: string;
  colorUuid: string;
  affectsBalance: boolean;
};

export type CreateAccountPayload = {
  description: string;
  balance: number;
  bankUuid: string;
  bankTypeUuid: string;
  colorUuid: string;
  affectsBalance: boolean;
};

export const createAccountSchema = z.object({
  description: z.string().min(1, "Informe a descrição"),
  balance: z.number().refine((n) => Number.isFinite(n), "Saldo inválido"),
  bankUuid: z.string().min(1, "Selecione um banco"),
  bankTypeUuid: z.string().min(1, "Selecione o tipo de conta"),
  colorUuid: z.string().min(1, "Selecione uma cor"),
  affectsBalance: z.boolean(),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
