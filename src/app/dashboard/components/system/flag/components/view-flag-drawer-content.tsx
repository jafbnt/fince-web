import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoSvgPreview } from "../../logo/components/logo-svg-preview";
import { useLogoStore } from "../../logo/store";
import { EditFlagForm } from "./edit-flag-form";
import { useFlagStore } from "../store";
import type { Flag } from "../type";

type ViewFlagDrawerContentProps = {
  flagUuid: string;
  onClose: () => void;
};

export function ViewFlagDrawerContent({ flagUuid, onClose }: ViewFlagDrawerContentProps) {
  const fetchFlagByUuid = useFlagStore((s) => s.fetchFlagByUuid);
  const logos = useLogoStore((s) => s.logos);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const [flag, setFlag] = useState<Flag | null>(null);
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
      const f = await fetchFlagByUuid(flagUuid);
      if (!cancelled) {
        setFlag(f);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [flagUuid, fetchFlagByUuid]);

  const linkedLogo = flag ? logos.find((l) => l.uuid === flag.logoUuid) : undefined;

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Carregando…
      </p>
    );
  }

  if (!flag) {
    return <p className="text-sm text-destructive">Não foi possível carregar a bandeira.</p>;
  }

  if (mode === "edit") {
    return (
      <EditFlagForm
        flagUuid={flagUuid}
        initialFlag={flag}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-flag-name">Nome</FieldLabel>
          <Input id="view-flag-name" readOnly disabled value={flag.name} />
        </Field>
        <Field>
          <FieldLabel>Logo</FieldLabel>
          {linkedLogo ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <LogoSvgPreview svg={linkedLogo.svg} className="h-12 w-20" />
              <span className="text-sm font-medium text-foreground">{linkedLogo.name}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Logo não encontrado ({flag.logoUuid})</p>
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
