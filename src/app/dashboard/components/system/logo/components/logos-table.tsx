import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { LoadingCard } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { useLogoStore } from "../store";
import type { Logo } from "../type";
import { DeleteLogoDialog } from "./delete-logo-dialog";
import { EditLogoForm } from "./edit-logo-form";
import { LogoSvgPreview } from "./logo-svg-preview";
import { ViewLogoDrawerContent } from "./view-logo-drawer-content";

function truncateSvgInline(svg: string, max = 64): string {
  const one = svg.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max)}…`;
}

export function LogosTable() {
  const { open, close } = useDrawer();
  const logos = useLogoStore((s) => s.logos);
  const loadingList = useLogoStore((s) => s.loadingList);
  const deleteLogo = useLogoStore((s) => s.deleteLogo);
  const loadingDeleteUuid = useLogoStore((s) => s.loadingDeleteUuid);
  const [deleteTarget, setDeleteTarget] = useState<Logo | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteLogo(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  if (loadingList && logos.length === 0) {
    return <LoadingCard />;
  }

  if (!loadingList && logos.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhum logo cadastrado. Use <strong className="text-foreground">Cadastrar</strong> para
        adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteLogoDialog
        logo={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Ícone</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">SVG</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Miniatura</th>
              <th className="px-4 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {logos.map((row) => {
              const rowDeleting = loadingDeleteUuid === row.uuid;
              return (
                <tr
                  key={row.uuid}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.isIcon ?? true ? "Sim" : "Não"}
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    <code className="block break-all font-mono text-xs text-muted-foreground">
                      {truncateSvgInline(row.svg)}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <LogoSvgPreview svg={row.svg} isIcon={row.isIcon ?? true} />
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
                            id: `logo-view-${row.uuid}`,
                            title: "Visualizar logo",
                            content: <ViewLogoDrawerContent logoUuid={row.uuid} onClose={close} />,
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
                            id: `logo-edit-${row.uuid}`,
                            title: "Editar logo",
                            content: <EditLogoForm logoUuid={row.uuid} onSuccess={close} />,
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
