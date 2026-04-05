import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BrlCentsBalanceInput } from "../../account/components/brl-cents-balance-input";
import { CategoryPickerField } from "../../revenue/components/category-picker-field";
import { useCategoryStore } from "../../category/store";
import { useCreditCardStore } from "../../credit-card/store";
import { TagPickerField } from "../../expenses/components/tag-picker-field";
import { useCreditCardExpenseStore } from "../store";
import {
  createCreditCardExpenseSchema,
  creditCardExpenseToFormDefaults,
  type CreateCreditCardExpenseFormValues,
  formValuesToCreditCardExpensePayload,
  type CreditCardExpense,
} from "../type";
import { CreditCardPickerField } from "./credit-card-picker-field";

type EditCreditCardExpenseFormProps = {
  expenseUuid: string;
  initialExpense?: CreditCardExpense;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditCreditCardExpenseForm({
  expenseUuid,
  initialExpense,
  onSuccess,
  onCancel,
}: EditCreditCardExpenseFormProps) {
  const fetchCreditCardExpenseByUuid = useCreditCardExpenseStore((s) => s.fetchCreditCardExpenseByUuid);
  const updateCreditCardExpense = useCreditCardExpenseStore((s) => s.updateCreditCardExpense);
  const loadingUpdate = useCreditCardExpenseStore((s) => s.loadingUpdate);
  const errorUpdate = useCreditCardExpenseStore((s) => s.errorUpdate);
  const categoriesCount = useCategoryStore((s) => s.categories.length);
  const creditCardsCount = useCreditCardStore((s) => s.creditCards.length);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialExpense));
  const [prefillError, setPrefillError] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateCreditCardExpenseFormValues>({
    resolver: zodResolver(createCreditCardExpenseSchema),
    defaultValues: initialExpense
      ? creditCardExpenseToFormDefaults(initialExpense)
      : {
          amount: 0,
          datePaid: "",
          description: "",
          categoryUuid: "",
          creditCardUuid: "",
          invoiceDate: "",
          tagUuid: "",
          ignoreTransaction: true,
          notation: "",
          fixedExpense: false,
          repeatEnabled: false,
          repeatCount: 0,
          repeatInterval: "",
        },
  });

  useEffect(() => {
    useCreditCardExpenseStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialExpense) {
      reset(creditCardExpenseToFormDefaults(initialExpense));
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const e = await fetchCreditCardExpenseByUuid(expenseUuid);
      if (cancelled) return;
      if (e) {
        reset(creditCardExpenseToFormDefaults(e));
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [expenseUuid, initialExpense, fetchCreditCardExpenseByUuid, reset]);

  const repeatEnabled = watch("repeatEnabled");

  const onSubmit = async (values: CreateCreditCardExpenseFormValues): Promise<void> => {
    const ok = await updateCreditCardExpense(expenseUuid, formValuesToCreditCardExpensePayload(values));
    if (ok) {
      onSuccess?.();
    }
  };

  const canSubmit = categoriesCount > 0 && creditCardsCount > 0;

  if (!prefillReady) {
    return <LoadingCenter />;
  }

  if (prefillError) {
    return <p className="text-sm text-destructive">Não foi possível carregar a despesa de cartão.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-cc-expense-description">Descrição</FieldLabel>
          <Input id="edit-cc-expense-description" autoComplete="off" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="edit-cc-expense-amount">Valor (BRL)</FieldLabel>
              <BrlCentsBalanceInput
                id="edit-cc-expense-amount"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
        <Field>
          <FieldLabel htmlFor="edit-cc-expense-date">Data do pagamento</FieldLabel>
          <Input id="edit-cc-expense-date" type="date" {...register("datePaid")} />
          <FieldError errors={[errors.datePaid]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-cc-expense-invoice-month">Mês da fatura</FieldLabel>
          <Input id="edit-cc-expense-invoice-month" type="month" {...register("invoiceDate")} />
          <FieldError errors={[errors.invoiceDate]} />
        </Field>
        <CreditCardPickerField control={control} name="creditCardUuid" id="edit-cc-expense-card" />
        <CategoryPickerField control={control} name="categoryUuid" id="edit-cc-expense-category" />
        <TagPickerField control={control} name="tagUuid" id="edit-cc-expense-tag" />
        <Field>
          <FieldLabel htmlFor="edit-cc-expense-notation">Anotação</FieldLabel>
          <Textarea id="edit-cc-expense-notation" rows={3} className="resize-y" {...register("notation")} />
          <FieldError errors={[errors.notation]} />
        </Field>
        <Controller
          control={control}
          name="ignoreTransaction"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="edit-cc-expense-ignore-tx"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-cc-expense-ignore-tx" className="text-sm font-medium">
                  Ignorar transação
                </label>
              </div>
            </Field>
          )}
        />
        <Controller
          control={control}
          name="fixedExpense"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="edit-cc-expense-fixed"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-cc-expense-fixed" className="text-sm font-medium">
                  Despesa fixa
                </label>
              </div>
            </Field>
          )}
        />
        <Controller
          control={control}
          name="repeatEnabled"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="edit-cc-expense-repeat"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-cc-expense-repeat" className="text-sm font-medium">
                  Repetição habilitada
                </label>
              </div>
            </Field>
          )}
        />
        {repeatEnabled ? (
          <>
            <Field>
              <FieldLabel htmlFor="edit-cc-expense-repeat-count">Quantidade de repetições</FieldLabel>
              <Input
                id="edit-cc-expense-repeat-count"
                type="number"
                min={0}
                step={1}
                {...register("repeatCount", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.repeatCount]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-cc-expense-repeat-interval">Intervalo</FieldLabel>
              <Input
                id="edit-cc-expense-repeat-interval"
                placeholder="ex. monthly, weekly"
                autoComplete="off"
                {...register("repeatInterval")}
              />
              <FieldError errors={[errors.repeatInterval]} />
            </Field>
          </>
        ) : null}
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
