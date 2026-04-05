import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { LoadingCard } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useAccountStore } from "../../account/store";
import { useCategoryStore } from "../../category/store";
import { DeleteRevenueDialog } from "./delete-revenue-dialog";
import { EditRevenueForm } from "./edit-revenue-form";
import { ViewRevenueDrawerContent } from "./view-revenue-drawer-content";
import { useRevenueStore } from "../store";
import { revenueApiAmountToReais, type Revenue } from "../type";

function formatBrl(reais: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

export function RevenuesTable() {
  const { open, close } = useDrawer();
  const revenues = useRevenueStore((s) => s.revenues);
  const loadingList = useRevenueStore((s) => s.loadingList);
  const deleteRevenue = useRevenueStore((s) => s.deleteRevenue);
  const loadingDeleteUuid = useRevenueStore((s) => s.loadingDeleteUuid);
  const categories = useCategoryStore((s) => s.categories);
  const accounts = useAccountStore((s) => s.accounts);
  const [deleteTarget, setDeleteTarget] = useState<Revenue | null>(null);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const ok = await deleteRevenue(deleteTarget.uuid);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  if (loadingList && revenues.length === 0) {
    return <LoadingCard />;
  }

  if (!loadingList && revenues.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhuma receita cadastrada. Use <strong className="text-foreground">Cadastrar</strong> para
        adicionar.
      </div>
    );
  }

  return (
    <>
      <DeleteRevenueDialog
        revenue={deleteTarget}
        open={deleteTarget !== null}
        loading={deleteTarget !== null && loadingDeleteUuid === deleteTarget.uuid}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[1040px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-3 text-left font-medium text-foreground">Descrição</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Valor</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Data</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Conta</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Categoria</th>
              <th className="px-3 py-3 text-left font-medium text-foreground">Recebido</th>
              <th className="px-3 py-3 text-right font-medium text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {revenues.map((row) => {
              const rowDeleting = loadingDeleteUuid === row.uuid;
              const catFallback = row.categoryUuid
                ? categories.find((c) => c.uuid === row.categoryUuid)
                : undefined;
              const accFallback = row.accountUuid
                ? accounts.find((a) => a.uuid === row.accountUuid)
                : undefined;
              return (
                <tr
                  key={row.uuid}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-3 font-medium text-foreground">{row.description}</td>
                  <td className="px-3 py-3 tabular-nums text-foreground">
                    {formatBrl(revenueApiAmountToReais(row.amount))}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {new Date(row.dateReceipt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="max-w-[260px] px-3 py-3">
                    {row.account ? (
                      <div className="flex min-w-0 items-center gap-2">
                        <LogoSvgPreview
                          svg={row.account.bankLogoSvg}
                          className="h-9 w-14 shrink-0"
                          isIcon={false}
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground">
                            {row.account.description}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {row.account.bankName} · {row.account.bankTypeName}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-foreground">{accFallback?.description ?? "—"}</span>
                    )}
                  </td>
                  <td className="max-w-[min(224px,100%)] px-3 py-3">
                    {row.category ? (
                      <div
                        className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-xl border border-black/10 py-0.5 pl-1 pr-2 text-gray-700 shadow-sm dark:border-white/20 dark:text-white"
                        style={{ backgroundColor: row.category.colorHex }}
                        title={`${row.category.nome} (${row.category.colorHex})`}
                      >
                        <div
                          className="flex size-7 shrink-0 items-center justify-center overflow-hidden"
                          aria-hidden
                        >
                          <LogoSvgPreview
                            svg={row.category.logoSvg}
                            className="h-5 w-5 rounded-none p-0 [&_circle]:fill-gray-700! dark:[&_circle]:fill-white! [&_path]:fill-gray-700! dark:[&_path]:fill-white! [&_rect]:fill-gray-700! dark:[&_rect]:fill-white!"
                            isIcon={false}
                          />
                        </div>
                        <span className="min-w-0 truncate text-xs font-semibold tracking-tight">
                          {row.category.nome}
                        </span>
                      </div>
                    ) : (
                      <span className="text-foreground">{catFallback?.nome ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-foreground">{row.wasReceived ? "Sim" : "Não"}</td>
                  <td className="px-3 py-3">
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
                            id: `revenue-view-${row.uuid}`,
                            title: "Visualizar receita",
                            content: <ViewRevenueDrawerContent revenueUuid={row.uuid} onClose={close} />,
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
                            id: `revenue-edit-${row.uuid}`,
                            title: "Editar receita",
                            content: <EditRevenueForm revenueUuid={row.uuid} initialRevenue={row} onSuccess={close} />,
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
