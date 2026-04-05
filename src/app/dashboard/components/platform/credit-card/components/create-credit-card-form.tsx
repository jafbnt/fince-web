import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBankStore } from "../../../system/bank/store";
import { useAccountTypeStore } from "../../../system/account-type/store";
import { useFlagStore } from "../../../system/flag/store";
import { useLogoStore } from "../../../system/logo/store";
import { BankPickerField } from "../../account/components/bank-picker-field";
import { BankTypePickerField } from "../../account/components/bank-type-picker-field";
import { useCreditCardStore } from "../store";
import { createCreditCardSchema, type CreateCreditCardFormValues } from "../type";
import { FlagPickerField } from "./flag-picker-field";

type CreateCreditCardFormProps = {
  onSuccess?: () => void;
};

export function CreateCreditCardForm({ onSuccess }: CreateCreditCardFormProps) {
  const createCreditCard = useCreditCardStore((s) => s.createCreditCard);
  const loadingCreate = useCreditCardStore((s) => s.loadingCreate);
  const errorCreate = useCreditCardStore((s) => s.errorCreate);
  const flagsCount = useFlagStore((s) => s.flags.length);
  const banksCount = useBankStore((s) => s.banks.length);
  const typesCount = useAccountTypeStore((s) => s.accountTypes.length);
  const logosCount = useLogoStore((s) => s.logos.length);

  useEffect(() => {
    useCreditCardStore.setState({ errorCreate: null });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCreditCardFormValues>({
    resolver: zodResolver(createCreditCardSchema),
    defaultValues: {
      description: "",
      flagUuid: "",
      bankUuid: "",
      bankTypeUuid: "",
      closingDay: 1,
      dueDate: 1,
    },
  });

  const onSubmit = async (values: CreateCreditCardFormValues): Promise<void> => {
    const ok = await createCreditCard({
      description: values.description.trim(),
      flagUuid: values.flagUuid,
      bankUuid: values.bankUuid,
      bankTypeUuid: values.bankTypeUuid,
      closingDay: values.closingDay,
      dueDate: values.dueDate,
    });
    if (ok) {
      reset({
        description: "",
        flagUuid: "",
        bankUuid: "",
        bankTypeUuid: "",
        closingDay: 1,
        dueDate: 1,
      });
      onSuccess?.();
    }
  };

  const canSubmit = flagsCount > 0 && banksCount > 0 && typesCount > 0 && logosCount > 0;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="credit-card-description">Descrição</FieldLabel>
          <Input id="credit-card-description" autoComplete="off" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <FlagPickerField control={control} name="flagUuid" id="create-credit-card-flag" />
        <BankPickerField control={control} name="bankUuid" id="create-credit-card-bank" />
        <BankTypePickerField control={control} name="bankTypeUuid" id="create-credit-card-bank-type" />
        <Field>
          <FieldLabel htmlFor="credit-card-closing">Dia de fechamento</FieldLabel>
          <Input
            id="credit-card-closing"
            type="number"
            min={1}
            max={31}
            step={1}
            {...register("closingDay", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.closingDay]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="credit-card-due">Dia de vencimento</FieldLabel>
          <Input
            id="credit-card-due"
            type="number"
            min={1}
            max={31}
            step={1}
            {...register("dueDate", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.dueDate]} />
        </Field>
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
