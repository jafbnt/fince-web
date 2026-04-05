import { z } from "zod";

export type Logo = {
  uuid: string;
  name: string;
  svg: string;
};

export type CreateLogoPayload = {
  name: string;
  svg: string;
};

export const createLogoSchema = z.object({
  name: z.string().min(1, "Informe o nome do logo"),
  svg: z
    .string()
    .min(1, "Cole o SVG")
    .refine((s) => /<svg\b/i.test(s.trim()), "Inclua um documento SVG válido (tag svg)"),
});

export type CreateLogoFormValues = z.infer<typeof createLogoSchema>;
