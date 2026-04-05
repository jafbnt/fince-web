/** Cartão de crédito para pickers (GET /api/credit-cards). */
export type CreditCard = {
  uuid: string;
  name?: string;
  description?: string;
};

export function creditCardLabel(c: CreditCard): string {
  return c.name?.trim() || c.description?.trim() || "Cartão";
}
