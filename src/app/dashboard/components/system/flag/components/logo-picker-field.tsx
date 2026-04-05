import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { PickerLoading } from "@/components/spinner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { LogoSvgPreview } from "../../logo/components/logo-svg-preview";
import { useLogoStore } from "../../logo/store";
import type { Logo } from "../../logo/type";

type LogoPickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  id?: string;
  disabled?: boolean;
};

export function LogoPickerField<T extends FieldValues>({
  control,
  name,
  label = "Logo",
  id = "flag-logo",
  disabled,
}: LogoPickerFieldProps<T>) {
  const logos = useLogoStore((s) => s.logos);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const loadingLogos = useLogoStore((s) => s.loadingList);

  useEffect(() => {
    if (logos.length === 0 && !loadingLogos) {
      void fetchLogos();
    }
  }, [logos.length, loadingLogos, fetchLogos]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {loadingLogos && logos.length === 0 ? (
            <PickerLoading />
          ) : logos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum logo cadastrado. Cadastre um logo em Sistema → Logos.
            </p>
          ) : (
            <div
              id={id}
              role="listbox"
              aria-label={label}
              className="max-h-52 overflow-y-auto rounded-3xl border border-border bg-input/30 p-2"
            >
              {logos.map((logo: Logo) => {
                const selected = field.value === logo.uuid;
                return (
                  <button
                    key={logo.uuid}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disabled}
                    onClick={() => field.onChange(logo.uuid)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-muted/80",
                      selected && "bg-muted ring-1 ring-ring/40",
                      disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <LogoSvgPreview
                      svg={logo.svg}
                      className="h-10 w-16 shrink-0"
                      isIcon={logo.isIcon ?? true}
                    />
                    <span className="min-w-0 font-medium text-foreground">{logo.name}</span>
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
