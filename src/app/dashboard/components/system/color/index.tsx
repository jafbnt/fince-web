import { useEffect } from "react";
import { SystemPageHeader } from "../system-page-header";
import { CreateColorForm } from "./components/create-color-form";
import { ColorsTable } from "./components/colors-table";
import { useDrawer } from "@/hooks/drawer/use";
import { useColorStore } from "./store";

export function ColorSystemView() {
  const { open, close } = useDrawer();
  const fetchColors = useColorStore((s) => s.fetchColors);

  useEffect(() => {
    void fetchColors();
  }, [fetchColors]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Cores"
        description="Paleta e tokens de cor do sistema."
        onRegister={() =>
          open({
            id: "create-color",
            title: "Cadastrar cor",
            content: <CreateColorForm onSuccess={close} />,
          })
        }
      />
      <ColorsTable />
    </div>
  );
}
