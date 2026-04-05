import { z } from "zod";

export type AccountType = {
  uuid: string;
  name: string;
  logoUuid: string;
};

export type CreateAccountTypePayload = {
  name: string;
  logoUuid: string;
};

export const createAccountTypeSchema = z.object({
  name: z.string().min(1, "Informe o nome do tipo de conta"),
  logoUuid: z.string().min(1, "Selecione um logo"),
});

export type CreateAccountTypeFormValues = z.infer<typeof createAccountTypeSchema>;
