import { useEffect } from "react";
import { SystemPageHeader } from "../../system/system-page-header";
import { useDrawer } from "@/hooks/drawer/use";
import { useAccountStore } from "../account/store";
import { useCategoryStore } from "../category/store";
import { useLogoStore } from "../../system/logo/store";
import { useTagStore } from "../tag/store";
import { CreateExpenseForm } from "./components/create-expense-form";
import { ExpensesTable } from "./components/expenses-table";
import { useExpenseStore } from "./store";

export function ExpensesPlatformView() {
  const { open, close } = useDrawer();
  const fetchExpenses = useExpenseStore((s) => s.fetchExpenses);
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const fetchTags = useTagStore((s) => s.fetchTags);

  useEffect(() => {
    void fetchExpenses();
    void fetchAccounts();
    void fetchCategories();
    void fetchLogos();
    void fetchTags();
  }, [fetchExpenses, fetchAccounts, fetchCategories, fetchLogos, fetchTags]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Despesas"
        description="Saídas com conta, categoria, tag opcional e recorrência."
        onRegister={() =>
          open({
            id: "create-expense",
            title: "Cadastrar despesa",
            content: <CreateExpenseForm onSuccess={close} />,
          })
        }
      />
      <ExpensesTable />
    </div>
  );
}
