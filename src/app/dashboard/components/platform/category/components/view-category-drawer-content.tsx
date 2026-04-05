import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useColorStore } from "../../../system/color/store";
import { useLogoStore } from "../../../system/logo/store";
import { EditCategoryForm } from "./edit-category-form";
import { useCategoryStore } from "../store";
import type { Category } from "../type";

type ViewCategoryDrawerContentProps = {
  categoryUuid: string;
  onClose: () => void;
};

export function ViewCategoryDrawerContent({
  categoryUuid,
  onClose,
}: ViewCategoryDrawerContentProps) {
  const fetchCategoryByUuid = useCategoryStore((s) => s.fetchCategoryByUuid);
  const logos = useLogoStore((s) => s.logos);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const colors = useColorStore((s) => s.colors);
  const fetchColors = useColorStore((s) => s.fetchColors);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (logos.length === 0) void fetchLogos();
    if (colors.length === 0) void fetchColors();
  }, [logos.length, colors.length, fetchLogos, fetchColors]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const c = await fetchCategoryByUuid(categoryUuid);
      if (!cancelled) {
        setCategory(c);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryUuid, fetchCategoryByUuid]);

  const logo = category ? logos.find((l) => l.uuid === category.logoUuid) : undefined;
  const color = category ? colors.find((c) => c.uuid === category.colorUuid) : undefined;

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Carregando…
      </p>
    );
  }

  if (!category) {
    return <p className="text-sm text-destructive">Não foi possível carregar a categoria.</p>;
  }

  if (mode === "edit") {
    return (
      <EditCategoryForm
        categoryUuid={categoryUuid}
        initialCategory={category}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-category-nome">Nome</FieldLabel>
          <Input id="view-category-nome" readOnly disabled value={category.nome} />
        </Field>
        <Field>
          <FieldLabel>Logo</FieldLabel>
          {logo ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <LogoSvgPreview
                svg={logo.svg}
                className="h-12 w-20"
                isIcon={logo.isIcon ?? true}
              />
              <span className="text-sm font-medium text-foreground">{logo.name}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Logo não encontrado ({category.logoUuid})</p>
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
            <p className="text-sm text-muted-foreground">Cor não encontrada ({category.colorUuid})</p>
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
