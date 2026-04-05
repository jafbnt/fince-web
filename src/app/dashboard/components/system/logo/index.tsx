import { useEffect } from "react";
import { SystemPageHeader } from "../system-page-header";
import { CreateLogoForm } from "./components/create-logo-form";
import { LogosTable } from "./components/logos-table";
import { useDrawer } from "@/hooks/drawer/use";
import { useLogoStore } from "./store";

export function LogoSystemView() {
  const { open, close } = useDrawer();
  const fetchLogos = useLogoStore((s) => s.fetchLogos);

  useEffect(() => {
    void fetchLogos();
  }, [fetchLogos]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Logos"
        description="Identidade visual e arquivos de logo."
        onRegister={() =>
          open({
            id: "create-logo",
            title: "Cadastrar logo",
            content: <CreateLogoForm onSuccess={close} />,
          })
        }
      />
      <LogosTable />
    </div>
  );
}
