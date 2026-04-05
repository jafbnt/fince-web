import { useEffect } from "react";
import { SystemPageHeader } from "../system-page-header";
import { AccountTypesTable } from "./components/account-types-table";
import { CreateAccountTypeForm } from "./components/create-account-type-form";
import { useDrawer } from "@/hooks/drawer/use";
import { useLogoStore } from "../logo/store";
import { useAccountTypeStore } from "./store";

export function AccountTypeSystemView() {
  const { open, close } = useDrawer();
  const fetchAccountTypes = useAccountTypeStore((s) => s.fetchAccountTypes);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);

  useEffect(() => {
    void fetchAccountTypes();
    void fetchLogos();
  }, [fetchAccountTypes, fetchLogos]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Tipos de conta"
        description="Classificações e permissões por tipo de conta."
        onRegister={() =>
          open({
            id: "create-account-type",
            title: "Cadastrar tipo de conta",
            content: <CreateAccountTypeForm onSuccess={close} />,
          })
        }
      />
      <AccountTypesTable />
    </div>
  );
}
