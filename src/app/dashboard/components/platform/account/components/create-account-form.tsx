import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { createAccountSchema, type CreateAccountFormValues } from "../type";

type CreateAccountFormProps = {
  onSuccess?: () => void;
};

export function CreateAccountForm({ onSuccess }: CreateAccountFormProps) {
  const createAccount = useAccountStore((s) => s.createAccount);
  const loadingCreate = useAccountStore((s) => s.loadingCreate);
  const errorCreate = useAccountStore((s) => s.errorCreate);
  const banksCount = useBankStore((s) => s.banks.length);
  const typesCount = useAccountTypeStore((s) => s.accountTypes.length);
  const colorsCount = useColorStore((s) => s.colors.length);
  const logosCount = useLogoStore((s) => s.logos.length);

  useEffect(() => {
    useAccountStore.setState({ errorCreate: null });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      description: "",
      balance: 0,
      bankUuid: "",
      bankTypeUuid: "",
      colorUuid: "",
      affectsBalance: true,
    },
  });

  const onSubmit = async (values: CreateAccountFormValues): Promise<void> => {
    const ok = await createAccount({
      description: values.description.trim(),
      balance: Number(values.balance),
      bankUuid: values.bankUuid,
      bankTypeUuid: values.bankTypeUuid,
      colorUuid: values.colorUuid,
      affectsBalance: values.affectsBalance,
    });
    if (ok) {
      reset();
      onSuccess?.();
    }
  };

  const canSubmit =
    banksCount > 0 && typesCount > 0 && colorsCount > 0 && logosCount > 0;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="account-description">Descrição</FieldLabel>
          <Input id="account-description" autoComplete="off" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <Controller
          control={control}
          name="balance"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="account-balance">Saldo</FieldLabel>
              <BrlCentsBalanceInput
                id="account-balance"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
        <BankPickerField control={control} name="bankUuid" id="create-account-bank" />
        <BankTypePickerField control={control} name="bankTypeUuid" id="create-account-bank-type" />
        <ColorPickerField control={control} name="colorUuid" id="create-account-color" />
        <Controller
          control={control}
          name="affectsBalance"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="create-account-affects-balance"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="create-account-affects-balance" className="text-sm font-medium">
                  Afeta saldo
                </label>
              </div>
            </Field>
          )}
        />
        {errorCreate ? <FieldError>{errorCreate}</FieldError> : null}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="submit" disabled={loadingCreate || !canSubmit}>
            {loadingCreate ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
