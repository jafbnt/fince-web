import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useBankStore } from "../../../system/bank/store";
import type { Bank } from "../../../system/bank/type";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useLogoStore } from "../../../system/logo/store";

type BankPickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  id?: string;
  disabled?: boolean;
};

export function BankPickerField<T extends FieldValues>({
  control,
  name,
  label = "Banco",
  id = "account-bank",
  disabled,
}: BankPickerFieldProps<T>) {
  const banks = useBankStore((s) => s.banks);
  const fetchBanks = useBankStore((s) => s.fetchBanks);
  const loadingBanks = useBankStore((s) => s.loadingList);
  const logos = useLogoStore((s) => s.logos);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const loadingLogos = useLogoStore((s) => s.loadingList);

  useEffect(() => {
    if (banks.length === 0 && !loadingBanks) {
      void fetchBanks();
    }
  }, [banks.length, loadingBanks, fetchBanks]);

  useEffect(() => {
    if (logos.length === 0 && !loadingLogos) {
      void fetchLogos();
    }
  }, [logos.length, loadingLogos, fetchLogos]);

  const logoForBank = (bank: Bank) => logos.find((l) => l.uuid === bank.logoUuid);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {(loadingBanks && banks.length === 0) || (loadingLogos && logos.length === 0) ? (
            <p className="text-sm text-muted-foreground">Carregando bancos…</p>
          ) : banks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum banco cadastrado. Cadastre em Sistema → Bancos.
            </p>
          ) : (
            <div
              id={id}
              role="listbox"
              aria-label={label}
              className="max-h-52 overflow-y-auto rounded-3xl border border-border bg-input/30 p-2"
            >
              {banks.map((bank: Bank) => {
                const selected = field.value === bank.uuid;
                const logo = logoForBank(bank);
                return (
                  <button
                    key={bank.uuid}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disabled}
                    onClick={() => field.onChange(bank.uuid)}
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
                    <span className="min-w-0 font-medium text-foreground">{bank.name}</span>
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
