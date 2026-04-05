import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBankStore } from "../../../system/bank/store";
import { useAccountTypeStore } from "../../../system/account-type/store";
import { useColorStore } from "../../../system/color/store";
import { useLogoStore } from "../../../system/logo/store";
import { ColorPickerField } from "../../category/components/color-picker-field";
import { BankPickerField } from "./bank-picker-field";
import { BankTypePickerField } from "./bank-type-picker-field";
import { BrlCentsBalanceInput } from "./brl-cents-balance-input";
import { useAccountStore } from "../store";
import { createAccountSchema, type Account, type CreateAccountFormValues } from "../type";

type EditAccountFormProps = {
  accountUuid: string;
  initialAccount?: Account;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditAccountForm({
  accountUuid,
  initialAccount,
  onSuccess,
  onCancel,
}: EditAccountFormProps) {
  const fetchAccountByUuid = useAccountStore((s) => s.fetchAccountByUuid);
  const updateAccount = useAccountStore((s) => s.updateAccount);
  const loadingUpdate = useAccountStore((s) => s.loadingUpdate);
  const errorUpdate = useAccountStore((s) => s.errorUpdate);
  const banksCount = useBankStore((s) => s.banks.length);
  const typesCount = useAccountTypeStore((s) => s.accountTypes.length);
  const colorsCount = useColorStore((s) => s.colors.length);
  const logosCount = useLogoStore((s) => s.logos.length);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialAccount));
  const [prefillError, setPrefillError] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      description: initialAccount?.description ?? "",
      balance: initialAccount?.balance ?? 0,
      bankUuid: initialAccount?.bankUuid ?? "",
      bankTypeUuid: initialAccount?.bankTypeUuid ?? "",
      colorUuid: initialAccount?.colorUuid ?? "",
      affectsBalance: initialAccount?.affectsBalance ?? true,
    },
  });

  useEffect(() => {
    useAccountStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialAccount) {
      reset({
        description: initialAccount.description,
        balance: initialAccount.balance,
        bankUuid: initialAccount.bankUuid,
        bankTypeUuid: initialAccount.bankTypeUuid,
        colorUuid: initialAccount.colorUuid,
        affectsBalance: initialAccount.affectsBalance,
      });
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const a = await fetchAccountByUuid(accountUuid);
      if (cancelled) return;
      if (a) {
        reset({
          description: a.description,
          balance: a.balance,
          bankUuid: a.bankUuid,
          bankTypeUuid: a.bankTypeUuid,
          colorUuid: a.colorUuid,
          affectsBalance: a.affectsBalance,
        });
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [accountUuid, initialAccount, fetchAccountByUuid, reset]);

  const onSubmit = async (values: CreateAccountFormValues): Promise<void> => {
    const ok = await updateAccount(accountUuid, {
      description: values.description.trim(),
      balance: Number(values.balance),
      bankUuid: values.bankUuid,
      bankTypeUuid: values.bankTypeUuid,
      colorUuid: values.colorUuid,
      affectsBalance: values.affectsBalance,
    });
    if (ok) {
      onSuccess?.();
    }
  };

  const canSubmit =
    banksCount > 0 && typesCount > 0 && colorsCount > 0 && logosCount > 0;

  if (!prefillReady) {
    return <LoadingCenter />;
  }

  if (prefillError) {
    return <p className="text-sm text-destructive">Não foi possível carregar a conta.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-account-description">Descrição</FieldLabel>
          <Input id="edit-account-description" autoComplete="off" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <Controller
          control={control}
          name="balance"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="edit-account-balance">Saldo</FieldLabel>
              <BrlCentsBalanceInput
                id="edit-account-balance"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
        <BankPickerField control={control} name="bankUuid" id="edit-account-bank" />
        <BankTypePickerField control={control} name="bankTypeUuid" id="edit-account-bank-type" />
        <ColorPickerField control={control} name="colorUuid" id="edit-account-color" />
        <Controller
          control={control}
          name="affectsBalance"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="edit-account-affects-balance"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-account-affects-balance" className="text-sm font-medium">
                  Afeta saldo
                </label>
              </div>
            </Field>
          )}
        />
        {errorUpdate ? <FieldError>{errorUpdate}</FieldError> : null}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loadingUpdate}>
              Voltar
            </Button>
          ) : null}
          <Button type="submit" disabled={loadingUpdate || !canSubmit}>
            {loadingUpdate ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
