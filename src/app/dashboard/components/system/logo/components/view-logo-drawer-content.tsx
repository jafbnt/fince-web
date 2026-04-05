import { useEffect, useState } from "react";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogoSvgPreview } from "./logo-svg-preview";
import { EditLogoForm } from "./edit-logo-form";
import { useLogoStore } from "../store";
import type { Logo } from "../type";

type ViewLogoDrawerContentProps = {
  logoUuid: string;
  onClose: () => void;
};

export function ViewLogoDrawerContent({ logoUuid, onClose }: ViewLogoDrawerContentProps) {
  const fetchLogoByUuid = useLogoStore((s) => s.fetchLogoByUuid);
  const [logo, setLogo] = useState<Logo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const l = await fetchLogoByUuid(logoUuid);
      if (!cancelled) {
        setLogo(l);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [logoUuid, fetchLogoByUuid]);

  if (loading) {
    return <LoadingCenter />;
  }

  if (!logo) {
    return <p className="text-sm text-destructive">Não foi possível carregar o logo.</p>;
  }

  if (mode === "edit") {
    return (
      <EditLogoForm
        logoUuid={logoUuid}
        initialLogo={logo}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-logo-name">Nome</FieldLabel>
          <Input id="view-logo-name" readOnly disabled value={logo.name} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-logo-is-icon">Ícone</FieldLabel>
          <Input
            id="view-logo-is-icon"
            readOnly
            disabled
            value={logo.isIcon ? "Sim (monocromático)" : "Não (colorido)"}
          />
        </Field>
        <Field>
          <FieldLabel>Miniatura</FieldLabel>
          <LogoSvgPreview svg={logo.svg} className="h-16 w-32" isIcon={logo.isIcon ?? true} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-logo-svg">SVG</FieldLabel>
          <Textarea id="view-logo-svg" readOnly disabled rows={6} value={logo.svg} className="font-mono text-xs" />
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
