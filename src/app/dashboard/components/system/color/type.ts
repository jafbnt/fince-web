import { z } from "zod";

export type Color = {
  uuid: string;
  name: string;
  hex: string;
};

export type CreateColorPayload = {
  name: string;
  hex: string;
};

export const createColorSchema = z.object({
  name: z.string().min(1, "Informe o nome da cor"),
  hex: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, "Use um hex no formato #RRGGBB (ex: #84cc16)"),
});

export type CreateColorFormValues = z.infer<typeof createColorSchema>;
