import { EyeIcon } from "lucide-react";
import { LoadingCard } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/drawer/use";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { revenueApiAmountToReais } from "../../revenue/type";
import { useTransactionStore } from "../store";
import { transactionSourceLabel, triBoolPt, type Transaction } from "../type";
import { ViewTransactionDrawerContent } from "./view-transaction-drawer-content";

function formatBrl(reais: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

function formatOccurred(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function AccountOrCardCell({ row }: { row: Transaction }) {
  if (row.account) {
    return (
      <div className="flex min-w-0 max-w-[280px] items-center gap-2">
        <LogoSvgPreview
          svg={row.account.bankLogoSvg}
          className="h-9 w-14 shrink-0"
          isIcon={false}
        />
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{row.account.description}</div>
          <div className="truncate text-xs text-muted-foreground">
            {row.account.bankName} · {row.account.bankTypeName}
          </div>
        </div>
      </div>
    );
  }
  if (row.creditCard) {
    return (
      <div className="flex min-w-0 max-w-[300px] items-center gap-2">
        <LogoSvgPreview
          svg={row.creditCard.bankLogoSvg}
          className="h-9 w-14 shrink-0"
          isIcon={false}
        />
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{row.creditCard.description}</div>
          <div className="truncate text-xs text-muted-foreground">
            {row.creditCard.bankName} · {row.creditCard.flagName}
          </div>
        </div>
        <LogoSvgPreview
          svg={row.creditCard.flagLogoSvg}
          className="h-7 w-10 shrink-0"
          isIcon={false}
        />
      </div>
    );
  }
  return <span className="text-muted-foreground">—</span>;
}

export function TransactionsTable() {
  const { open } = useDrawer();
  const transactions = useTransactionStore((s) => s.transactions);
  const loadingList = useTransactionStore((s) => s.loadingList);

  if (loadingList && transactions.length === 0) {
    return <LoadingCard />;
  }

  if (!loadingList && transactions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhuma transação retornada pela API.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[1180px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-3 py-3 text-left font-medium text-foreground">Origem</th>
            <th className="px-3 py-3 text-left font-medium text-foreground">Descrição</th>
            <th className="px-3 py-3 text-left font-medium text-foreground">Valor</th>
            <th className="px-3 py-3 text-left font-medium text-foreground">Data</th>
            <th className="px-3 py-3 text-left font-medium text-foreground">Categoria</th>
            <th className="px-3 py-3 text-left font-medium text-foreground">Conta / cartão</th>
            <th className="px-3 py-3 text-left font-medium text-foreground">Tag</th>
            <th className="px-3 py-3 text-left font-medium text-foreground">Pago</th>
            <th className="px-3 py-3 text-left font-medium text-foreground">Parc.</th>
            <th className="px-3 py-3 text-right font-medium text-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((row) => (
            <tr key={row.uuid} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="whitespace-nowrap px-3 py-3 text-foreground">
                {transactionSourceLabel(String(row.source))}
              </td>
              <td className="max-w-[220px] px-3 py-3">
                <div className="truncate font-medium text-foreground">{row.description}</div>
                {row.notation?.trim() ? (
                  <div className="truncate text-xs text-muted-foreground">{row.notation}</div>
                ) : null}
              </td>
              <td className="px-3 py-3 tabular-nums text-foreground">
                {formatBrl(revenueApiAmountToReais(row.amount))}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                {formatOccurred(row.occurredAt)}
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
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-3 py-3">
                <AccountOrCardCell row={row} />
              </td>
              <td className="max-w-[140px] truncate px-3 py-3 text-foreground">
                {row.tag?.nome ?? "—"}
              </td>
              <td className="px-3 py-3 text-foreground">{triBoolPt(row.wasPaid)}</td>
              <td className="px-3 py-3 text-muted-foreground">
                {row.installments != null && Number.isFinite(row.installments)
                  ? `${row.installments}x`
                  : "—"}
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    aria-label="Visualizar"
                    title="Visualizar"
                    onClick={() =>
                      open({
                        id: `transaction-view-${row.uuid}`,
                        title: "Visualizar transação",
                        content: <ViewTransactionDrawerContent transaction={row} />,
                      })
                    }
                  >
                    <EyeIcon className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
