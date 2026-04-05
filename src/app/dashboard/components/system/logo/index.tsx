import { SystemPageHeader } from "../system-page-header";
import { LogoSection } from "./components/logo-section";

export function LogoSystemView() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader title="Logos" description="Identidade visual e arquivos de logo." />
      <LogoSection />
    </div>
  );
}
