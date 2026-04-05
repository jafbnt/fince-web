import { useEffect } from "react";
import { SystemPageHeader } from "../system-page-header";
import { CreateFlagForm } from "./components/create-flag-form";
import { FlagsTable } from "./components/flags-table";
import { useDrawer } from "@/hooks/drawer/use";
import { useFlagStore } from "./store";
import { useLogoStore } from "../logo/store";

export function FlagSystemView() {
  const { open, close } = useDrawer();
  const fetchFlags = useFlagStore((s) => s.fetchFlags);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);

  useEffect(() => {
    void fetchFlags();
    void fetchLogos();
  }, [fetchFlags, fetchLogos]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Bandeiras"
        description="Bandeiras vinculadas a logos do sistema."
        onRegister={() =>
          open({
            id: "create-flag",
            title: "Cadastrar bandeira",
            content: <CreateFlagForm onSuccess={close} />,
          })
        }
      />
      <FlagsTable />
    </div>
  );
}
