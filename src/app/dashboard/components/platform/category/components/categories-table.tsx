import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { LoadingCard } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useColorStore } from "../../../system/color/store";
import { useLogoStore } from "../../../system/logo/store";
import { useCategoryStore } from "../store";
import type { Category } from "../type";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { EditCategoryForm } from "./edit-category-form";
import { ViewCategoryDrawerContent } from "./view-category-drawer-content";

export function CategoriesTable() {
  const { open, close } = useDrawer();
  const categories = useCategoryStore((s) => s.categories);
  const loadingList = useCategoryStore((s) => s.loadingList);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const loadingDeleteUuid = useCategoryStore((s) => s.loadingDeleteUuid);
  const logos = useLogoStore((s) => s.logos);
  const colors = useColorStore((s) => s.colors);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteCategory(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  const logoForCategory = (row: Category) => logos.find((l) => l.uuid === row.logoUuid);
  const colorForCategory = (row: Category) => colors.find((c) => c.uuid === row.colorUuid);

  if (loadingList && categories.length === 0) {
    return <LoadingCard />;
  }

  if (!loadingList && categories.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhuma categoria cadastrada. Use <strong className="text-foreground">Cadastrar</strong> para
        adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteCategoryDialog
        category={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Miniatura</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Cor</th>
              <th className="px-4 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((row) => {
              const rowDeleting = loadingDeleteUuid === row.uuid;
              const logo = logoForCategory(row);
              const color = colorForCategory(row);
              return (
                <tr
                  key={row.uuid}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.nome}</td>
                  <td className="px-4 py-3">
                    {logo ? (
                      <div className="flex items-center gap-3">
                        <LogoSvgPreview svg={logo.svg} isIcon={logo.isIcon ?? true} />
                        <span className="text-muted-foreground">{logo.name}</span>
                      </div>
                    ) : (
                      <code className="text-xs text-muted-foreground">{row.logoUuid}</code>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {color ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="size-7 shrink-0 rounded-md border border-border shadow-sm"
                          style={{ backgroundColor: color.hex }}
                          aria-hidden
                        />
                        <span className="text-muted-foreground">{color.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{color.hex}</span>
                      </div>
                    ) : (
                      <code className="text-xs text-muted-foreground">{row.colorUuid}</code>
                    )}
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
                            id: `category-view-${row.uuid}`,
                            title: "Visualizar categoria",
                            content: (
                              <ViewCategoryDrawerContent categoryUuid={row.uuid} onClose={close} />
                            ),
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
                            id: `category-edit-${row.uuid}`,
                            title: "Editar categoria",
                            content: <EditCategoryForm categoryUuid={row.uuid} onSuccess={close} />,
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
