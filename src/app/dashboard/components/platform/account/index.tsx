import { useEffect } from "react";
import { SystemPageHeader } from "../../system/system-page-header";
import { AccountsTable } from "./components/accounts-table";
import { CreateAccountForm } from "./components/create-account-form";
import { useDrawer } from "@/hooks/drawer/use";
import { useAccountStore } from "./store";
import { useBankStore } from "../../system/bank/store";
import { useAccountTypeStore } from "../../system/account-type/store";
import { useColorStore } from "../../system/color/store";
import { useLogoStore } from "../../system/logo/store";

export function AccountPlatformView() {
  const { open, close } = useDrawer();
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
  const fetchBanks = useBankStore((s) => s.fetchBanks);
  const fetchAccountTypes = useAccountTypeStore((s) => s.fetchAccountTypes);
  const fetchColors = useColorStore((s) => s.fetchColors);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);

  useEffect(() => {
    void fetchAccounts();
    void fetchBanks();
    void fetchAccountTypes();
    void fetchColors();
    void fetchLogos();
  }, [fetchAccounts, fetchBanks, fetchAccountTypes, fetchColors, fetchLogos]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Contas"
        description="Contas bancárias com banco, tipo, cor e impacto no saldo."
        onRegister={() =>
          open({
            id: "create-account",
            title: "Cadastrar conta",
            content: <CreateAccountForm onSuccess={close} />,
          })
        }
      />
      <AccountsTable />
    </div>
  );
}
