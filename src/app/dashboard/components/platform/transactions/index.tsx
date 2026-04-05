import { useEffect } from "react";
import { LoadingCard } from "@/components/spinner";
import { SystemPageHeader } from "../../system/system-page-header";
import { useTransactionStore } from "./store";

export function TransactionsPlatformView() {
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);
  const transactions = useTransactionStore((s) => s.transactions);
  const loadingList = useTransactionStore((s) => s.loadingList);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Transações"
        description="Movimentações financeiras consolidadas. Lista via GET /api/transactions."
      />
      {loadingList && transactions.length === 0 ? (
        <LoadingCard />
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhuma transação retornada ou endpoint ainda não disponível. Ajuste o tipo em{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-foreground">transactions/type.ts</code>{" "}
          quando a API estiver definida.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {transactions.length} transação(ões) — componentes de tabela e formulários podem ser
          adicionados em <code className="rounded bg-muted px-1 py-0.5 text-foreground">transactions/components/</code>.
        </div>
      )}
    </div>
  );
}
