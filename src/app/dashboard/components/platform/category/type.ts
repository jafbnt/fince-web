import { z } from "zod";

export type Category = {
  uuid: string;
  nome: string;
  logoUuid: string;
  colorUuid: string;
};

export type CreateCategoryPayload = {
  nome: string;
  logoUuid: string;
  colorUuid: string;
};

export const createCategorySchema = z.object({
  nome: z.string().min(1, "Informe o nome da categoria"),
  logoUuid: z.string().min(1, "Selecione um logo"),
  colorUuid: z.string().min(1, "Selecione uma cor"),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
