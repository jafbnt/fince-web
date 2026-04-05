import { useEffect } from "react";
import { SystemPageHeader } from "../../system/system-page-header";
import { useCreditCardExpenseStore } from "../credit-card-expenses/store";
import { useExpenseStore } from "../expenses/store";
import { useRevenueStore } from "../revenue/store";
import { TransactionsRegistrationsCharts } from "./components/transactions-registrations-charts";
import { TransactionsTable } from "./components/transactions-table";
import { useTransactionStore } from "./store";

export function TransactionsPlatformView() {
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);
  const fetchRevenues = useRevenueStore((s) => s.fetchRevenues);
  const fetchExpenses = useExpenseStore((s) => s.fetchExpenses);
  const fetchCreditCardExpenses = useCreditCardExpenseStore((s) => s.fetchCreditCardExpenses);

  useEffect(() => {
    void fetchTransactions();
    void fetchRevenues();
    void fetchExpenses();
    void fetchCreditCardExpenses();
  }, [fetchTransactions, fetchRevenues, fetchExpenses, fetchCreditCardExpenses]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Transações"
        description="Movimentações consolidadas (despesas, cartão, etc.). Lista somente leitura via GET /api/transactions."
      />
      <TransactionsRegistrationsCharts />
      <TransactionsTable />
    </div>
  );
}
