import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { LoadingCard } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { useColorStore } from "../store";
import type { Color } from "../type";
import { ColorEditForm } from "./edit-color-form";
import { DeleteColorDialog } from "./delete-color-dialog";
import { ViewColorDrawerContent } from "./view-color-drawer-content";

export function ColorsTable() {
  const { open, close } = useDrawer();
  const colors = useColorStore((s) => s.colors);
  const loadingList = useColorStore((s) => s.loadingList);
  const deleteColor = useColorStore((s) => s.deleteColor);
  const loadingDeleteUuid = useColorStore((s) => s.loadingDeleteUuid);
  const [deleteTarget, setDeleteTarget] = useState<Color | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteColor(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  if (loadingList && colors.length === 0) {
    return <LoadingCard />;
  }

  if (!loadingList && colors.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhuma cor cadastrada. Use <strong className="text-foreground">Cadastrar</strong> para
        adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteColorDialog
        color={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Hex</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Cor</th>
              <th className="px-4 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {colors.map((row) => {
              const rowDeleting = loadingDeleteUuid === row.uuid;
              return (
                <tr
                  key={row.uuid}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row.hex}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block size-8 rounded-lg border border-border shadow-inner"
                      style={{ backgroundColor: row.hex }}
                      title={row.hex}
                    />
                  </td>
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
                            id: `color-view-${row.uuid}`,
                            title: "Visualizar cor",
                            content: <ViewColorDrawerContent colorUuid={row.uuid} onClose={close} />,
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
                            id: `color-edit-${row.uuid}`,
                            title: "Editar cor",
                            content: <ColorEditForm colorUuid={row.uuid} onSuccess={close} />,
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
