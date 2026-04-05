import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoSvgPreview } from "../../logo/components/logo-svg-preview";
import { useLogoStore } from "../../logo/store";
import { EditAccountTypeForm } from "./edit-account-type-form";
import { useAccountTypeStore } from "../store";
import type { AccountType } from "../type";

type ViewAccountTypeDrawerContentProps = {
  accountTypeUuid: string;
  onClose: () => void;
};

export function ViewAccountTypeDrawerContent({
  accountTypeUuid,
  onClose,
}: ViewAccountTypeDrawerContentProps) {
  const fetchAccountTypeByUuid = useAccountTypeStore((s) => s.fetchAccountTypeByUuid);
  const logos = useLogoStore((s) => s.logos);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (logos.length === 0) {
      void fetchLogos();
    }
  }, [logos.length, fetchLogos]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const a = await fetchAccountTypeByUuid(accountTypeUuid);
      if (!cancelled) {
        setAccountType(a);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountTypeUuid, fetchAccountTypeByUuid]);

  const linkedLogo = accountType ? logos.find((l) => l.uuid === accountType.logoUuid) : undefined;

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Carregando…
      </p>
    );
  }

  if (!accountType) {
    return (
      <p className="text-sm text-destructive">Não foi possível carregar o tipo de conta.</p>
    );
  }

  if (mode === "edit") {
    return (
      <EditAccountTypeForm
        accountTypeUuid={accountTypeUuid}
        initialAccountType={accountType}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-account-type-name">Nome</FieldLabel>
          <Input id="view-account-type-name" readOnly disabled value={accountType.name} />
        </Field>
        <Field>
          <FieldLabel>Logo</FieldLabel>
          {linkedLogo ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <LogoSvgPreview
                svg={linkedLogo.svg}
                className="h-12 w-20"
                isIcon={linkedLogo.isIcon ?? true}
              />
              <span className="text-sm font-medium text-foreground">{linkedLogo.name}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Logo não encontrado ({accountType.logoUuid})
            </p>
          )}
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
