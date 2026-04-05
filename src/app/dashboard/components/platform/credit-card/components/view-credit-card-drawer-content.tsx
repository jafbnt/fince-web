import { useEffect, useState } from "react";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBankStore } from "../../../system/bank/store";
import { useAccountTypeStore } from "../../../system/account-type/store";
import { useFlagStore } from "../../../system/flag/store";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useLogoStore } from "../../../system/logo/store";
import { EditCreditCardForm } from "./edit-credit-card-form";
import { useCreditCardStore } from "../store";
import type { CreditCard } from "../type";

type ViewCreditCardDrawerContentProps = {
  creditCardUuid: string;
  onClose: () => void;
};

export function ViewCreditCardDrawerContent({
  creditCardUuid,
  onClose,
}: ViewCreditCardDrawerContentProps) {
  const fetchCreditCardByUuid = useCreditCardStore((s) => s.fetchCreditCardByUuid);
  const flags = useFlagStore((s) => s.flags);
  const fetchFlags = useFlagStore((s) => s.fetchFlags);
  const banks = useBankStore((s) => s.banks);
  const fetchBanks = useBankStore((s) => s.fetchBanks);
  const accountTypes = useAccountTypeStore((s) => s.accountTypes);
  const fetchAccountTypes = useAccountTypeStore((s) => s.fetchAccountTypes);
  const logos = useLogoStore((s) => s.logos);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const [card, setCard] = useState<CreditCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (flags.length === 0) void fetchFlags();
    if (banks.length === 0) void fetchBanks();
    if (accountTypes.length === 0) void fetchAccountTypes();
    if (logos.length === 0) void fetchLogos();
  }, [
    flags.length,
    banks.length,
    accountTypes.length,
    logos.length,
    fetchFlags,
    fetchBanks,
    fetchAccountTypes,
    fetchLogos,
  ]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const c = await fetchCreditCardByUuid(creditCardUuid);
      if (!cancelled) {
        setCard(c);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [creditCardUuid, fetchCreditCardByUuid]);

  const flag = card ? flags.find((f) => f.uuid === card.flagUuid) : undefined;
  const flagLogo = flag ? logos.find((l) => l.uuid === flag.logoUuid) : undefined;
  const bank = card ? banks.find((b) => b.uuid === card.bankUuid) : undefined;
  const bankLogo = bank ? logos.find((l) => l.uuid === bank.logoUuid) : undefined;
  const accType = card ? accountTypes.find((t) => t.uuid === card.bankTypeUuid) : undefined;
  const typeLogo = accType ? logos.find((l) => l.uuid === accType.logoUuid) : undefined;

  if (loading) {
    return <LoadingCenter />;
  }

  if (!card) {
    return <p className="text-sm text-destructive">Não foi possível carregar o cartão.</p>;
  }

  if (mode === "edit") {
    return (
      <EditCreditCardForm
        creditCardUuid={creditCardUuid}
        initialCreditCard={card}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-credit-card-description">Descrição</FieldLabel>
          <Input id="view-credit-card-description" readOnly disabled value={card.description} />
        </Field>
        <Field>
          <FieldLabel>Bandeira</FieldLabel>
          {flagLogo ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <LogoSvgPreview
                svg={flagLogo.svg}
                className="h-12 w-20"
                isIcon={flagLogo.isIcon ?? true}
              />
              <span className="text-sm font-medium text-foreground">{flag?.name}</span>
            </div>
          ) : flag ? (
            <p className="text-sm text-muted-foreground">{flag.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Bandeira não encontrada ({card.flagUuid})</p>
          )}
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
            <p className="text-sm text-muted-foreground">Banco não encontrado ({card.bankUuid})</p>
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
              Tipo não encontrado ({card.bankTypeUuid})
            </p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="view-credit-card-closing">Dia de fechamento</FieldLabel>
          <Input id="view-credit-card-closing" readOnly disabled value={String(card.closingDay)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-credit-card-due">Dia de vencimento</FieldLabel>
          <Input id="view-credit-card-due" readOnly disabled value={String(card.dueDate)} />
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
