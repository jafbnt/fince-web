import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBankStore } from "../../../system/bank/store";
import { useAccountTypeStore } from "../../../system/account-type/store";
import { useColorStore } from "../../../system/color/store";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useLogoStore } from "../../../system/logo/store";
import { EditAccountForm } from "./edit-account-form";
import { useAccountStore } from "../store";
import type { Account } from "../type";

type ViewAccountDrawerContentProps = {
  accountUuid: string;
  onClose: () => void;
};

function formatBalance(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ViewAccountDrawerContent({ accountUuid, onClose }: ViewAccountDrawerContentProps) {
  const fetchAccountByUuid = useAccountStore((s) => s.fetchAccountByUuid);
  const banks = useBankStore((s) => s.banks);
  const fetchBanks = useBankStore((s) => s.fetchBanks);
  const accountTypes = useAccountTypeStore((s) => s.accountTypes);
  const fetchAccountTypes = useAccountTypeStore((s) => s.fetchAccountTypes);
  const logos = useLogoStore((s) => s.logos);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const colors = useColorStore((s) => s.colors);
  const fetchColors = useColorStore((s) => s.fetchColors);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (banks.length === 0) void fetchBanks();
    if (accountTypes.length === 0) void fetchAccountTypes();
    if (logos.length === 0) void fetchLogos();
    if (colors.length === 0) void fetchColors();
  }, [
    banks.length,
    accountTypes.length,
    logos.length,
    colors.length,
    fetchBanks,
    fetchAccountTypes,
    fetchLogos,
    fetchColors,
  ]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const a = await fetchAccountByUuid(accountUuid);
      if (!cancelled) {
        setAccount(a);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountUuid, fetchAccountByUuid]);

  const bank = account ? banks.find((b) => b.uuid === account.bankUuid) : undefined;
  const bankLogo = bank ? logos.find((l) => l.uuid === bank.logoUuid) : undefined;
  const accType = account ? accountTypes.find((t) => t.uuid === account.bankTypeUuid) : undefined;
  const typeLogo = accType ? logos.find((l) => l.uuid === accType.logoUuid) : undefined;
  const color = account ? colors.find((c) => c.uuid === account.colorUuid) : undefined;

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Carregando…
      </p>
    );
  }

  if (!account) {
    return <p className="text-sm text-destructive">Não foi possível carregar a conta.</p>;
  }

  if (mode === "edit") {
    return (
      <EditAccountForm
        accountUuid={accountUuid}
        initialAccount={account}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-account-description">Descrição</FieldLabel>
          <Input id="view-account-description" readOnly disabled value={account.description} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-account-balance">Saldo</FieldLabel>
          <Input id="view-account-balance" readOnly disabled value={formatBalance(account.balance)} />
        </Field>
        <Field>
          <FieldLabel>Banco</FieldLabel>
          {bankLogo ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <LogoSvgPreview
                svg={bankLogo.svg}
                className="h-12 w-20"
                isIcon={bankLogo.isIcon ?? true}
              />
              <span className="text-sm font-medium text-foreground">{bank?.name}</span>
            </div>
          ) : bank ? (
            <p className="text-sm text-muted-foreground">{bank.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Banco não encontrado ({account.bankUuid})</p>
          )}
        </Field>
        <Field>
          <FieldLabel>Tipo de conta</FieldLabel>
          {typeLogo ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <LogoSvgPreview
                svg={typeLogo.svg}
                className="h-12 w-20"
                isIcon={typeLogo.isIcon ?? true}
              />
              <span className="text-sm font-medium text-foreground">{accType?.name}</span>
            </div>
          ) : accType ? (
            <p className="text-sm text-muted-foreground">{accType.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tipo não encontrado ({account.bankTypeUuid})
            </p>
          )}
        </Field>
        <Field>
          <FieldLabel>Cor</FieldLabel>
          {color ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <span
                className="size-10 shrink-0 rounded-lg border border-border shadow-sm"
                style={{ backgroundColor: color.hex }}
                aria-hidden
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{color.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{color.hex}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Cor não encontrada ({account.colorUuid})</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="view-account-affects">Afeta saldo</FieldLabel>
          <Input
            id="view-account-affects"
            readOnly
            disabled
            value={account.affectsBalance ? "Sim" : "Não"}
          />
        </Field>
      </FieldGroup>
      <div className="flex justify-end pt-2">
        <Button type="button" onClick={() => setMode("edit")}>
          Editar
        </Button>
      </div>
    </div>
  );
}
