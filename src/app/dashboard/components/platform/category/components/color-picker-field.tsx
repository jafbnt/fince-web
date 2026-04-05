import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useColorStore } from "../../../system/color/store";
import type { Color } from "../../../system/color/type";

type ColorPickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  id?: string;
  disabled?: boolean;
};

export function ColorPickerField<T extends FieldValues>({
  control,
  name,
  label = "Cor",
  id = "category-color",
  disabled,
}: ColorPickerFieldProps<T>) {
  const colors = useColorStore((s) => s.colors);
  const fetchColors = useColorStore((s) => s.fetchColors);
  const loadingColors = useColorStore((s) => s.loadingList);

  useEffect(() => {
    if (colors.length === 0 && !loadingColors) {
      void fetchColors();
    }
  }, [colors.length, loadingColors, fetchColors]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {loadingColors && colors.length === 0 ? (
            <p className="text-sm text-muted-foreground">Carregando cores…</p>
          ) : colors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma cor cadastrada. Cadastre em Sistema → Cores.
            </p>
          ) : (
            <div
              id={id}
              role="listbox"
              aria-label={label}
              className="max-h-52 overflow-y-auto rounded-3xl border border-border bg-input/30 p-2"
            >
              {colors.map((color: Color) => {
                const selected = field.value === color.uuid;
                return (
                  <button
                    key={color.uuid}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disabled}
                    onClick={() => field.onChange(color.uuid)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-muted/80",
                      selected && "bg-muted ring-1 ring-ring/40",
                      disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <span
                      className="size-8 shrink-0 rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden
                    />
                    <span className="min-w-0 font-medium text-foreground">{color.name}</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">{color.hex}</span>
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
