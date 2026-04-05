import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { PickerLoading } from "@/components/spinner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useAccountTypeStore } from "../../../system/account-type/store";
import type { AccountType } from "../../../system/account-type/type";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useLogoStore } from "../../../system/logo/store";

type BankTypePickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  id?: string;
  disabled?: boolean;
};

/** Campo `bankTypeUuid` da API — lista tipos de conta (Sistema → Tipos de conta). */
export function BankTypePickerField<T extends FieldValues>({
  control,
  name,
  label = "Tipo de conta",
  id = "account-bank-type",
  disabled,
}: BankTypePickerFieldProps<T>) {
  const accountTypes = useAccountTypeStore((s) => s.accountTypes);
  const fetchAccountTypes = useAccountTypeStore((s) => s.fetchAccountTypes);
  const loadingTypes = useAccountTypeStore((s) => s.loadingList);
  const logos = useLogoStore((s) => s.logos);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const loadingLogos = useLogoStore((s) => s.loadingList);

  useEffect(() => {
    if (accountTypes.length === 0 && !loadingTypes) {
      void fetchAccountTypes();
    }
  }, [accountTypes.length, loadingTypes, fetchAccountTypes]);

  useEffect(() => {
    if (logos.length === 0 && !loadingLogos) {
      void fetchLogos();
    }
  }, [logos.length, loadingLogos, fetchLogos]);

  const logoForType = (t: AccountType) => logos.find((l) => l.uuid === t.logoUuid);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {(loadingTypes && accountTypes.length === 0) || (loadingLogos && logos.length === 0) ? (
            <PickerLoading />
          ) : accountTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum tipo de conta cadastrado. Cadastre em Sistema → Tipos de Conta.
            </p>
          ) : (
            <div
              id={id}
              role="listbox"
              aria-label={label}
              className="max-h-52 overflow-y-auto rounded-3xl border border-border bg-input/30 p-2"
            >
              {accountTypes.map((t: AccountType) => {
                const selected = field.value === t.uuid;
                const logo = logoForType(t);
                return (
                  <button
                    key={t.uuid}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disabled}
                    onClick={() => field.onChange(t.uuid)}
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
                    <span className="min-w-0 font-medium text-foreground">{t.name}</span>
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
