import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoSvgPreview } from "../../logo/components/logo-svg-preview";
import { useLogoStore } from "../../logo/store";
import { EditBankForm } from "./edit-bank-form";
import { useBankStore } from "../store";
import type { Bank } from "../type";

type ViewBankDrawerContentProps = {
  bankUuid: string;
  onClose: () => void;
};

export function ViewBankDrawerContent({ bankUuid, onClose }: ViewBankDrawerContentProps) {
  const fetchBankByUuid = useBankStore((s) => s.fetchBankByUuid);
  const logos = useLogoStore((s) => s.logos);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const [bank, setBank] = useState<Bank | null>(null);
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
      const b = await fetchBankByUuid(bankUuid);
      if (!cancelled) {
        setBank(b);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bankUuid, fetchBankByUuid]);

  const linkedLogo = bank ? logos.find((l) => l.uuid === bank.logoUuid) : undefined;

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Carregando…
      </p>
    );
  }

  if (!bank) {
    return <p className="text-sm text-destructive">Não foi possível carregar o banco.</p>;
  }

  if (mode === "edit") {
    return (
      <EditBankForm
        bankUuid={bankUuid}
        initialBank={bank}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-bank-name">Nome</FieldLabel>
          <Input id="view-bank-name" readOnly disabled value={bank.name} />
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
            <p className="text-sm text-muted-foreground">Logo não encontrado ({bank.logoUuid})</p>
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
