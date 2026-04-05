import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { PickerLoading } from "@/components/spinner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useAccountStore } from "../../account/store";
import type { Account } from "../../account/type";
import { useBankStore } from "../../../system/bank/store";
import { useAccountTypeStore } from "../../../system/account-type/store";
import { LogoSvgPreview } from "../../../system/logo/components/logo-svg-preview";
import { useLogoStore } from "../../../system/logo/store";

type AccountPickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  id?: string;
  disabled?: boolean;
};

export function AccountPickerField<T extends FieldValues>({
  control,
  name,
  label = "Conta",
  id = "revenue-account",
  disabled,
}: AccountPickerFieldProps<T>) {
  const accounts = useAccountStore((s) => s.accounts);
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
  const loadingAccounts = useAccountStore((s) => s.loadingList);
  const banks = useBankStore((s) => s.banks);
  const accountTypes = useAccountTypeStore((s) => s.accountTypes);
  const logos = useLogoStore((s) => s.logos);
  const fetchBanks = useBankStore((s) => s.fetchBanks);
  const fetchTypes = useAccountTypeStore((s) => s.fetchAccountTypes);
  const fetchLogos = useLogoStore((s) => s.fetchLogos);
  const loadingBanks = useBankStore((s) => s.loadingList);
  const loadingTypes = useAccountTypeStore((s) => s.loadingList);
  const loadingLogos = useLogoStore((s) => s.loadingList);

  useEffect(() => {
    if (accounts.length === 0 && !loadingAccounts) {
      void fetchAccounts();
    }
  }, [accounts.length, loadingAccounts, fetchAccounts]);

  useEffect(() => {
    if (banks.length === 0 && !loadingBanks) void fetchBanks();
  }, [banks.length, loadingBanks, fetchBanks]);

  useEffect(() => {
    if (accountTypes.length === 0 && !loadingTypes) void fetchTypes();
  }, [accountTypes.length, loadingTypes, fetchTypes]);

  useEffect(() => {
    if (logos.length === 0 && !loadingLogos) void fetchLogos();
  }, [logos.length, loadingLogos, fetchLogos]);

  const bankLogo = (row: Account) => {
    const bank = banks.find((b) => b.uuid === row.bankUuid);
    const logo = bank ? logos.find((l) => l.uuid === bank.logoUuid) : undefined;
    return logo;
  };

  const typeLogo = (row: Account) => {
    const t = accountTypes.find((x) => x.uuid === row.bankTypeUuid);
    return t ? logos.find((l) => l.uuid === t.logoUuid) : undefined;
  };

  const loadingShell =
    (loadingAccounts && accounts.length === 0) ||
    (loadingBanks && banks.length === 0) ||
    (loadingTypes && accountTypes.length === 0) ||
    (loadingLogos && logos.length === 0);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {loadingShell ? (
            <PickerLoading />
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma conta cadastrada. Cadastre em Plataforma → Contas.
            </p>
          ) : (
            <div
              id={id}
              role="listbox"
              aria-label={label}
              className="max-h-52 overflow-y-auto rounded-3xl border border-border bg-input/30 p-2"
            >
              {accounts.map((row: Account) => {
                const selected = field.value === row.uuid;
                const bLogo = bankLogo(row);
                const tLogo = typeLogo(row);
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
                    <div className="flex shrink-0 items-center gap-1">
                      {bLogo ? (
                        <LogoSvgPreview
                          svg={bLogo.svg}
                          className="h-8 w-12"
                          isIcon={bLogo.isIcon ?? true}
                        />
                      ) : null}
                      {tLogo ? (
                        <LogoSvgPreview
                          svg={tLogo.svg}
                          className="h-8 w-12"
                          isIcon={tLogo.isIcon ?? true}
                        />
                      ) : null}
                    </div>
                    <span className="min-w-0 font-medium text-foreground">{row.description}</span>
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
