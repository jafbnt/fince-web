import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BrlCentsBalanceInput } from "../../account/components/brl-cents-balance-input";
import { useAccountStore } from "../../account/store";
import { useCategoryStore } from "../../category/store";
import { AccountPickerField } from "../../revenue/components/account-picker-field";
import { CategoryPickerField } from "../../revenue/components/category-picker-field";
import { useExpenseStore } from "../store";
import {
  createExpenseSchema,
  type CreateExpenseFormValues,
  formValuesToExpensePayload,
} from "../type";
import { TagPickerField } from "./tag-picker-field";

function defaultDateInputValue(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

type CreateExpenseFormProps = {
  onSuccess?: () => void;
};

export function CreateExpenseForm({ onSuccess }: CreateExpenseFormProps) {
  const createExpense = useExpenseStore((s) => s.createExpense);
  const loadingCreate = useExpenseStore((s) => s.loadingCreate);
  const errorCreate = useExpenseStore((s) => s.errorCreate);
  const accountsCount = useAccountStore((s) => s.accounts.length);
  const categoriesCount = useCategoryStore((s) => s.categories.length);

  useEffect(() => {
    useExpenseStore.setState({ errorCreate: null });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amount: 0,
      wasPaid: true,
      datePaid: defaultDateInputValue(),
      description: "",
      categoryUuid: "",
      accountUuid: "",
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

  const onSubmit = async (values: CreateExpenseFormValues): Promise<void> => {
    const ok = await createExpense(formValuesToExpensePayload(values));
    if (ok) {
      reset({
        amount: 0,
        wasPaid: true,
        datePaid: defaultDateInputValue(),
        description: "",
        categoryUuid: "",
        accountUuid: "",
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

  const canSubmit = accountsCount > 0 && categoriesCount > 0;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="expense-description">Descrição</FieldLabel>
          <Input id="expense-description" autoComplete="off" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="expense-amount">Valor (BRL)</FieldLabel>
              <BrlCentsBalanceInput
                id="expense-amount"
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
          <FieldLabel htmlFor="expense-date">Data do pagamento</FieldLabel>
          <Input id="expense-date" type="date" {...register("datePaid")} />
          <FieldError errors={[errors.datePaid]} />
        </Field>
        <Controller
          control={control}
          name="wasPaid"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="expense-was-paid"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="expense-was-paid" className="text-sm font-medium">
                  Já pago
                </label>
              </div>
            </Field>
          )}
        />
        <AccountPickerField control={control} name="accountUuid" id="create-expense-account" />
        <CategoryPickerField control={control} name="categoryUuid" id="create-expense-category" />
        <TagPickerField control={control} name="tagUuid" id="create-expense-tag" />
        <Field>
          <FieldLabel htmlFor="expense-notation">Anotação</FieldLabel>
          <Textarea id="expense-notation" rows={3} className="resize-y" {...register("notation")} />
          <FieldError errors={[errors.notation]} />
        </Field>
        <Controller
          control={control}
          name="ignoreTransaction"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="expense-ignore-tx"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="expense-ignore-tx" className="text-sm font-medium">
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
                  id="expense-fixed-expense"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="expense-fixed-expense" className="text-sm font-medium">
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
                  id="expense-repeat"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="expense-repeat" className="text-sm font-medium">
                  Repetição habilitada
                </label>
              </div>
            </Field>
          )}
        />
        {repeatEnabled ? (
          <>
            <Field>
              <FieldLabel htmlFor="expense-repeat-count">Quantidade de repetições</FieldLabel>
              <Input
                id="expense-repeat-count"
                type="number"
                min={0}
                step={1}
                {...register("repeatCount", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.repeatCount]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="expense-repeat-interval">Intervalo</FieldLabel>
              <Input
                id="expense-repeat-interval"
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
