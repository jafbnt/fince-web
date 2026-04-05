import { z } from "zod";

export type Flag = {
  uuid: string;
  name: string;
  logoUuid: string;
};

export type CreateFlagPayload = {
  name: string;
  logoUuid: string;
};

export const createFlagSchema = z.object({
  name: z.string().min(1, "Informe o nome da bandeira"),
  logoUuid: z.string().min(1, "Selecione um logo"),
});

export type CreateFlagFormValues = z.infer<typeof createFlagSchema>;
