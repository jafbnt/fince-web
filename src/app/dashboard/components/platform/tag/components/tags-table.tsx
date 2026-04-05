import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { LoadingCard } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { useTagStore } from "../store";
import type { Tag } from "../type";
import { DeleteTagDialog } from "./delete-tag-dialog";
import { EditTagForm } from "./edit-tag-form";
import { ViewTagDrawerContent } from "./view-tag-drawer-content";

export function TagsTable() {
  const { open, close } = useDrawer();
  const tags = useTagStore((s) => s.tags);
  const loadingList = useTagStore((s) => s.loadingList);
  const deleteTag = useTagStore((s) => s.deleteTag);
  const loadingDeleteUuid = useTagStore((s) => s.loadingDeleteUuid);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteTag(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  if (loadingList && tags.length === 0) {
    return <LoadingCard />;
  }

  if (!loadingList && tags.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhuma tag cadastrada. Use <strong className="text-foreground">Cadastrar</strong> para
        adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteTagDialog
        tag={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[400px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-foreground">Nome</th>
              <th className="px-4 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((row) => {
              const rowDeleting = loadingDeleteUuid === row.uuid;
              return (
                <tr
                  key={row.uuid}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.nome}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        aria-label="Visualizar"
                        title="Visualizar"
                        disabled={rowDeleting}
                        onClick={() =>
                          open({
                            id: `tag-view-${row.uuid}`,
                            title: "Visualizar tag",
                            content: <ViewTagDrawerContent tagUuid={row.uuid} onClose={close} />,
                          })
                        }
                      >
                        <EyeIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        aria-label="Editar"
                        title="Editar"
                        disabled={rowDeleting}
                        onClick={() =>
                          open({
                            id: `tag-edit-${row.uuid}`,
                            title: "Editar tag",
                            content: <EditTagForm tagUuid={row.uuid} onSuccess={close} />,
                          })
                        }
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        aria-label="Excluir"
                        title="Excluir"
                        disabled={rowDeleting}
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
