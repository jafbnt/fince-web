import { z } from "zod";

export type Tag = {
  uuid: string;
  nome: string;
};

export type CreateTagPayload = {
  nome: string;
};

export const createTagSchema = z.object({
  nome: z.string().min(1, "Informe o nome da tag"),
});

export type CreateTagFormValues = z.infer<typeof createTagSchema>;
