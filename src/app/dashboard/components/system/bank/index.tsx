import { useEffect } from "react";
import { SystemPageHeader } from "../system-page-header";
import { BanksTable } from "./components/banks-table";
import { CreateBankForm } from "./components/create-bank-form";
import { useDrawer } from "@/hooks/drawer/use";
import { useBankStore } from "./store";
import { useLogoStore } from "../logo/store";

export function BankSystemView() {
  const { open, close } = useDrawer();
  const fetchBanks = useBankStore((s) => s.fetchBanks);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);

  useEffect(() => {
    void fetchBanks();
    void fetchLogos();
  }, [fetchBanks, fetchLogos]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Bancos"
        description="Bancos vinculados a logos do sistema."
        onRegister={() =>
          open({
            id: "create-bank",
            title: "Cadastrar banco",
            content: <CreateBankForm onSuccess={close} />,
          })
        }
      />
      <BanksTable />
    </div>
  );
}
