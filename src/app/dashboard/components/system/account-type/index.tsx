import { SystemPageHeader } from "../system-page-header";
import { AccountTypeSection } from "./components/account-type-section";

export function AccountTypeSystemView() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Tipos de conta"
        description="Classificações e permissões por tipo de conta."
      />
      <AccountTypeSection />
    </div>
  );
}
