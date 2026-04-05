import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { PickerLoading } from "@/components/spinner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useFlagStore } from "../../../system/flag/store";
import type { Flag } from "../../../system/flag/type";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useLogoStore } from "../../../system/logo/store";

type FlagPickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  id?: string;
  disabled?: boolean;
};

export function FlagPickerField<T extends FieldValues>({
  control,
  name,
  label = "Bandeira",
  id = "credit-card-flag",
  disabled,
}: FlagPickerFieldProps<T>) {
  const flags = useFlagStore((s) => s.flags);
  const fetchFlags = useFlagStore((s) => s.fetchFlags);
  const loadingFlags = useFlagStore((s) => s.loadingList);
  const logos = useLogoStore((s) => s.logos);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const loadingLogos = useLogoStore((s) => s.loadingList);

  useEffect(() => {
    if (flags.length > 0) return;
    void fetchFlags();
  }, [flags.length, fetchFlags]);

  useEffect(() => {
    if (logos.length > 0) return;
    void fetchLogos();
  }, [logos.length, fetchLogos]);

  const logoForFlag = (flag: Flag) => logos.find((l) => l.uuid === flag.logoUuid);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {(loadingFlags && flags.length === 0) || (loadingLogos && logos.length === 0) ? (
            <PickerLoading />
          ) : flags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma bandeira cadastrada. Cadastre em Sistema → Bandeiras.
            </p>
          ) : (
            <div
              id={id}
              role="listbox"
              aria-label={label}
              className="max-h-52 overflow-y-auto rounded-3xl border border-border bg-input/30 p-2"
            >
              {flags.map((flag: Flag) => {
                const selected = field.value === flag.uuid;
                const logo = logoForFlag(flag);
                return (
                  <button
                    key={flag.uuid}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disabled}
                    onClick={() => field.onChange(flag.uuid)}
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
                        className="h-10 w-16 shrink-0"
                        isIcon={logo.isIcon ?? true}
                      />
                    ) : (
                      <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                        —
                      </span>
                    )}
                    <span className="min-w-0 font-medium text-foreground">{flag.name}</span>
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
