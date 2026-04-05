import { useEffect } from "react";
import { SystemPageHeader } from "../../system/system-page-header";
import { CreateTagForm } from "./components/create-tag-form";
import { TagsTable } from "./components/tags-table";
import { useDrawer } from "@/hooks/drawer/use";
import { useTagStore } from "./store";

export function TagPlatformView() {
  const { open, close } = useDrawer();
  const fetchTags = useTagStore((s) => s.fetchTags);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SystemPageHeader
        title="Tags"
        description="Etiquetas simples para classificar itens na plataforma."
        onRegister={() =>
          open({
            id: "create-tag",
            title: "Cadastrar tag",
            content: <CreateTagForm onSuccess={close} />,
          })
        }
      />
      <TagsTable />
    </div>
  );
}
