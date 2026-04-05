import { useEffect } from "react";
import { SystemPageHeader } from "../../system/system-page-header";
import { useDrawer } from "@/hooks/drawer/use";
import { useCategoryStore } from "../category/store";
import { useCreditCardStore } from "../credit-card/store";
import { useLogoStore } from "../../system/logo/store";
import { useTagStore } from "../tag/store";
import { CreateCreditCardExpenseForm } from "./components/create-credit-card-expense-form";
import { CreditCardExpensesTable } from "./components/credit-card-expenses-table";
import { useCreditCardExpenseStore } from "./store";

export function CreditCardExpensesPlatformView() {
  const { open, close } = useDrawer();
  const fetchCreditCardExpenses = useCreditCardExpenseStore((s) => s.fetchCreditCardExpenses);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const fetchCreditCards = useCreditCardStore((s) => s.fetchCreditCards);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const fetchTags = useTagStore((s) => s.fetchTags);

  useEffect(() => {
    void fetchCreditCardExpenses();
    void fetchCategories();
    void fetchCreditCards();
    void fetchLogos();
    void fetchTags();
  }, [fetchCreditCardExpenses, fetchCategories, fetchCreditCards, fetchLogos, fetchTags]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Despesas cartão de crédito"
        description="Lançamentos vinculados a cartão, mês da fatura, categoria e recorrência."
        onRegister={() =>
          open({
            id: "create-credit-card-expense",
            title: "Cadastrar despesa de cartão",
            content: <CreateCreditCardExpenseForm onSuccess={close} />,
          })
        }
      />
      <CreditCardExpensesTable />
    </div>
  );
}
