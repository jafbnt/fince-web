import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
  type CreateCreditCardExpenseFormValues,
  formValuesToCreditCardExpensePayload,
} from "../type";
import { CreditCardPickerField } from "./credit-card-picker-field";

function defaultDateInputValue(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function defaultMonthInputValue(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}`;
}

type CreateCreditCardExpenseFormProps = {
  onSuccess?: () => void;
};

export function CreateCreditCardExpenseForm({ onSuccess }: CreateCreditCardExpenseFormProps) {
  const createCreditCardExpense = useCreditCardExpenseStore((s) => s.createCreditCardExpense);
  const loadingCreate = useCreditCardExpenseStore((s) => s.loadingCreate);
  const errorCreate = useCreditCardExpenseStore((s) => s.errorCreate);
  const categoriesCount = useCategoryStore((s) => s.categories.length);
  const creditCardsCount = useCreditCardStore((s) => s.creditCards.length);

  useEffect(() => {
    useCreditCardExpenseStore.setState({ errorCreate: null });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateCreditCardExpenseFormValues>({
    resolver: zodResolver(createCreditCardExpenseSchema),
    defaultValues: {
      amount: 0,
      datePaid: defaultDateInputValue(),
      description: "",
      categoryUuid: "",
      creditCardUuid: "",
      invoiceDate: defaultMonthInputValue(),
      tagUuid: "",
      ignoreTransaction: true,
      notation: "",
      fixedExpense: false,
      repeatEnabled: false,
      repeatCount: 0,
      repeatInterval: "",
    },
  });

  const repeatEnabled = watch("repeatEnabled");

  const onSubmit = async (values: CreateCreditCardExpenseFormValues): Promise<void> => {
    const ok = await createCreditCardExpense(formValuesToCreditCardExpensePayload(values));
    if (ok) {
      reset({
        amount: 0,
        datePaid: defaultDateInputValue(),
        description: "",
        categoryUuid: "",
        creditCardUuid: "",
        invoiceDate: defaultMonthInputValue(),
        tagUuid: "",
        ignoreTransaction: true,
        notation: "",
        fixedExpense: false,
        repeatEnabled: false,
        repeatCount: 0,
        repeatInterval: "",
      });
      onSuccess?.();
    }
  };

  const canSubmit = categoriesCount > 0 && creditCardsCount > 0;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="cc-expense-description">Descrição</FieldLabel>
          <Input id="cc-expense-description" autoComplete="off" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="cc-expense-amount">Valor (BRL)</FieldLabel>
              <BrlCentsBalanceInput
                id="cc-expense-amount"
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
          <FieldLabel htmlFor="cc-expense-date">Data do pagamento</FieldLabel>
          <Input id="cc-expense-date" type="date" {...register("datePaid")} />
          <FieldError errors={[errors.datePaid]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="cc-expense-invoice-month">Mês da fatura</FieldLabel>
          <Input id="cc-expense-invoice-month" type="month" {...register("invoiceDate")} />
          <FieldError errors={[errors.invoiceDate]} />
        </Field>
        <CreditCardPickerField control={control} name="creditCardUuid" id="create-cc-expense-card" />
        <CategoryPickerField control={control} name="categoryUuid" id="create-cc-expense-category" />
        <TagPickerField control={control} name="tagUuid" id="create-cc-expense-tag" />
        <Field>
          <FieldLabel htmlFor="cc-expense-notation">Anotação</FieldLabel>
          <Textarea id="cc-expense-notation" rows={3} className="resize-y" {...register("notation")} />
          <FieldError errors={[errors.notation]} />
        </Field>
        <Controller
          control={control}
          name="ignoreTransaction"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="cc-expense-ignore-tx"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="cc-expense-ignore-tx" className="text-sm font-medium">
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
                  id="cc-expense-fixed"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="cc-expense-fixed" className="text-sm font-medium">
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
                  id="cc-expense-repeat"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="cc-expense-repeat" className="text-sm font-medium">
                  Repetição habilitada
                </label>
              </div>
            </Field>
          )}
        />
        {repeatEnabled ? (
          <>
            <Field>
              <FieldLabel htmlFor="cc-expense-repeat-count">Quantidade de repetições</FieldLabel>
              <Input
                id="cc-expense-repeat-count"
                type="number"
                min={0}
                step={1}
                {...register("repeatCount", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.repeatCount]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="cc-expense-repeat-interval">Intervalo</FieldLabel>
              <Input
                id="cc-expense-repeat-interval"
                placeholder="ex. monthly, weekly"
                autoComplete="off"
                {...register("repeatInterval")}
              />
              <FieldError errors={[errors.repeatInterval]} />
            </Field>
          </>
        ) : null}
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
