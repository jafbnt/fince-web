import { useEffect } from "react";
import { SystemPageHeader } from "../../system/system-page-header";
import { useDrawer } from "@/hooks/drawer/use";
import { useAccountStore } from "../account/store";
import { useCategoryStore } from "../category/store";
import { useLogoStore } from "../../system/logo/store";
import { CreateRevenueForm } from "./components/create-revenue-form";
import { RevenuesTable } from "./components/revenues-table";
import { useRevenueStore } from "./store";

export function RevenuePlatformView() {
  const { open, close } = useDrawer();
  const fetchRevenues = useRevenueStore((s) => s.fetchRevenues);
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);

  useEffect(() => {
    void fetchRevenues();
    void fetchAccounts();
    void fetchCategories();
    void fetchLogos();
  }, [fetchRevenues, fetchAccounts, fetchCategories, fetchLogos]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Receitas"
        description="Entradas financeiras com conta, categoria, valor e recorrência."
        onRegister={() =>
          open({
            id: "create-revenue",
            title: "Cadastrar receita",
            content: <CreateRevenueForm onSuccess={close} />,
          })
        }
      />
      <RevenuesTable />
    </div>
  );
}
