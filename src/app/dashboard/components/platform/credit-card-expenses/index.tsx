import { SystemPageHeader } from "../../system/system-page-header";

export function CreditCardExpensesPlatformView() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Despesas cartão de crédito"
        description="Lançamentos e faturas de cartão. Integração com a API em breve."
      />
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Módulo em construção.
      </div>
    </div>
  );
}
