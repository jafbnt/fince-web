import { useEffect } from "react";
import { SystemPageHeader } from "../../system/system-page-header";
import { TransactionsTable } from "./components/transactions-table";
import { useTransactionStore } from "./store";

export function TransactionsPlatformView() {
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Transações"
        description="Movimentações consolidadas (despesas, cartão, etc.). Lista somente leitura via GET /api/transactions."
      />
      <TransactionsTable />
    </div>
  );
}
