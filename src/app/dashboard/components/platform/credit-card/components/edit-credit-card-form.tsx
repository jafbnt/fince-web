import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingCenter } from "@/components/spinner";
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
import {
  createCreditCardSchema,
  creditCardToFormDefaults,
  type CreateCreditCardFormValues,
  type CreditCard,
} from "../type";
import { FlagPickerField } from "./flag-picker-field";

type EditCreditCardFormProps = {
  creditCardUuid: string;
  initialCreditCard?: CreditCard;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditCreditCardForm({
  creditCardUuid,
  initialCreditCard,
  onSuccess,
  onCancel,
}: EditCreditCardFormProps) {
  const fetchCreditCardByUuid = useCreditCardStore((s) => s.fetchCreditCardByUuid);
  const updateCreditCard = useCreditCardStore((s) => s.updateCreditCard);
  const loadingUpdate = useCreditCardStore((s) => s.loadingUpdate);
  const errorUpdate = useCreditCardStore((s) => s.errorUpdate);
  const flagsCount = useFlagStore((s) => s.flags.length);
  const banksCount = useBankStore((s) => s.banks.length);
  const typesCount = useAccountTypeStore((s) => s.accountTypes.length);
  const logosCount = useLogoStore((s) => s.logos.length);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialCreditCard));
  const [prefillError, setPrefillError] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCreditCardFormValues>({
    resolver: zodResolver(createCreditCardSchema),
    defaultValues: initialCreditCard
      ? creditCardToFormDefaults(initialCreditCard)
      : {
          description: "",
          flagUuid: "",
          bankUuid: "",
          bankTypeUuid: "",
          closingDay: 1,
          dueDate: 1,
        },
  });

  useEffect(() => {
    useCreditCardStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialCreditCard) {
      reset(creditCardToFormDefaults(initialCreditCard));
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const c = await fetchCreditCardByUuid(creditCardUuid);
      if (cancelled) return;
      if (c) {
        reset(creditCardToFormDefaults(c));
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [creditCardUuid, initialCreditCard, fetchCreditCardByUuid, reset]);

  const onSubmit = async (values: CreateCreditCardFormValues): Promise<void> => {
    const ok = await updateCreditCard(creditCardUuid, {
      description: values.description.trim(),
      flagUuid: values.flagUuid,
      bankUuid: values.bankUuid,
      bankTypeUuid: values.bankTypeUuid,
      closingDay: values.closingDay,
      dueDate: values.dueDate,
    });
    if (ok) {
      onSuccess?.();
    }
  };

  const canSubmit = flagsCount > 0 && banksCount > 0 && typesCount > 0 && logosCount > 0;

  if (!prefillReady) {
    return <LoadingCenter />;
  }

  if (prefillError) {
    return <p className="text-sm text-destructive">Não foi possível carregar o cartão.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-credit-card-description">Descrição</FieldLabel>
          <Input id="edit-credit-card-description" autoComplete="off" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <FlagPickerField control={control} name="flagUuid" id="edit-credit-card-flag" />
        <BankPickerField control={control} name="bankUuid" id="edit-credit-card-bank" />
        <BankTypePickerField control={control} name="bankTypeUuid" id="edit-credit-card-bank-type" />
        <Field>
          <FieldLabel htmlFor="edit-credit-card-closing">Dia de fechamento</FieldLabel>
          <Input
            id="edit-credit-card-closing"
            type="number"
            min={1}
            max={31}
            step={1}
            {...register("closingDay", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.closingDay]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-credit-card-due">Dia de vencimento</FieldLabel>
          <Input
            id="edit-credit-card-due"
            type="number"
            min={1}
            max={31}
            step={1}
            {...register("dueDate", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.dueDate]} />
        </Field>
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
