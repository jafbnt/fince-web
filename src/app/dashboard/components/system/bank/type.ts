import { z } from "zod";

export type Bank = {
  uuid: string;
  name: string;
  logoUuid: string;
};

export type CreateBankPayload = {
  name: string;
  logoUuid: string;
};

export const createBankSchema = z.object({
  name: z.string().min(1, "Informe o nome do banco"),
  logoUuid: z.string().min(1, "Selecione um logo"),
});

export type CreateBankFormValues = z.infer<typeof createBankSchema>;
