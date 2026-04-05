import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { PickerLoading } from "@/components/spinner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useColorStore } from "../../../system/color/store";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useLogoStore } from "../../../system/logo/store";
import { useCategoryStore } from "../../category/store";
import type { Category } from "../../category/type";

type CategoryPickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  id?: string;
  disabled?: boolean;
};

export function CategoryPickerField<T extends FieldValues>({
  control,
  name,
  label = "Categoria",
  id = "revenue-category",
  disabled,
}: CategoryPickerFieldProps<T>) {
  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const loadingCategories = useCategoryStore((s) => s.loadingList);
  const logos = useLogoStore((s) => s.logos);
  const colors = useColorStore((s) => s.colors);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const fetchColors = useColorStore((s) => s.fetchColors);
  const loadingLogos = useLogoStore((s) => s.loadingList);
  const loadingColors = useColorStore((s) => s.loadingList);

  useEffect(() => {
    if (categories.length === 0 && !loadingCategories) {
      void fetchCategories();
    }
  }, [categories.length, loadingCategories, fetchCategories]);

  useEffect(() => {
    if (logos.length === 0 && !loadingLogos) void fetchLogos();
  }, [logos.length, loadingLogos, fetchLogos]);

  useEffect(() => {
    if (colors.length === 0 && !loadingColors) void fetchColors();
  }, [colors.length, loadingColors, fetchColors]);

  const logoFor = (row: Category) => logos.find((l) => l.uuid === row.logoUuid);
  const colorFor = (row: Category) => colors.find((c) => c.uuid === row.colorUuid);

  const loadingShell =
    (loadingCategories && categories.length === 0) ||
    (loadingLogos && logos.length === 0) ||
    (loadingColors && colors.length === 0);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {loadingShell ? (
            <PickerLoading />
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria cadastrada. Cadastre em Plataforma → Categorias.
            </p>
          ) : (
            <div
              id={id}
              role="listbox"
              aria-label={label}
              className="max-h-52 overflow-y-auto rounded-3xl border border-border bg-input/30 p-2"
            >
              {categories.map((row: Category) => {
                const selected = field.value === row.uuid;
                const logo = logoFor(row);
                const color = colorFor(row);
                return (
                  <button
                    key={row.uuid}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disabled}
                    onClick={() => field.onChange(row.uuid)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-muted/80",
                      selected && "bg-muted ring-1 ring-ring/40",
                      disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    {logo ? (
                      <LogoSvgPreview
                        svg={logo.svg}
                        className="h-9 w-14 shrink-0"
                        isIcon={logo.isIcon ?? true}
                      />
                    ) : (
                      <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                        —
                      </span>
                    )}
                    <span className="min-w-0 flex-1 font-medium text-foreground">{row.nome}</span>
                    {color ? (
                      <span
                        className="size-6 shrink-0 rounded-full border border-border shadow-sm"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}
