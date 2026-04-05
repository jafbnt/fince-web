import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LoadingCenter } from "@/components/spinner";
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
  expenseToFormDefaults,
  formValuesToExpensePayload,
  type Expense,
} from "../type";
import { TagPickerField } from "./tag-picker-field";

type EditExpenseFormProps = {
  expenseUuid: string;
  initialExpense?: Expense;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditExpenseForm({
  expenseUuid,
  initialExpense,
  onSuccess,
  onCancel,
}: EditExpenseFormProps) {
  const fetchExpenseByUuid = useExpenseStore((s) => s.fetchExpenseByUuid);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const loadingUpdate = useExpenseStore((s) => s.loadingUpdate);
  const errorUpdate = useExpenseStore((s) => s.errorUpdate);
  const accountsCount = useAccountStore((s) => s.accounts.length);
  const categoriesCount = useCategoryStore((s) => s.categories.length);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialExpense));
  const [prefillError, setPrefillError] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: initialExpense
      ? expenseToFormDefaults(initialExpense)
      : {
          amount: 0,
          wasPaid: true,
          datePaid: "",
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

  useEffect(() => {
    useExpenseStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialExpense) {
      reset(expenseToFormDefaults(initialExpense));
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const e = await fetchExpenseByUuid(expenseUuid);
      if (cancelled) return;
      if (e) {
        reset(expenseToFormDefaults(e));
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [expenseUuid, initialExpense, fetchExpenseByUuid, reset]);

  const repeatEnabled = watch("repeatEnabled");

  const onSubmit = async (values: CreateExpenseFormValues): Promise<void> => {
    const ok = await updateExpense(expenseUuid, formValuesToExpensePayload(values));
    if (ok) {
      onSuccess?.();
    }
  };

  const canSubmit = accountsCount > 0 && categoriesCount > 0;

  if (!prefillReady) {
    return <LoadingCenter />;
  }

  if (prefillError) {
    return <p className="text-sm text-destructive">Não foi possível carregar a despesa.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-expense-description">Descrição</FieldLabel>
          <Input id="edit-expense-description" autoComplete="off" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="edit-expense-amount">Valor (BRL)</FieldLabel>
              <BrlCentsBalanceInput
                id="edit-expense-amount"
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
          <FieldLabel htmlFor="edit-expense-date">Data do pagamento</FieldLabel>
          <Input id="edit-expense-date" type="date" {...register("datePaid")} />
          <FieldError errors={[errors.datePaid]} />
        </Field>
        <Controller
          control={control}
          name="wasPaid"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="edit-expense-was-paid"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-expense-was-paid" className="text-sm font-medium">
                  Já pago
                </label>
              </div>
            </Field>
          )}
        />
        <AccountPickerField control={control} name="accountUuid" id="edit-expense-account" />
        <CategoryPickerField control={control} name="categoryUuid" id="edit-expense-category" />
        <TagPickerField control={control} name="tagUuid" id="edit-expense-tag" />
        <Field>
          <FieldLabel htmlFor="edit-expense-notation">Anotação</FieldLabel>
          <Textarea id="edit-expense-notation" rows={3} className="resize-y" {...register("notation")} />
          <FieldError errors={[errors.notation]} />
        </Field>
        <Controller
          control={control}
          name="ignoreTransaction"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="edit-expense-ignore-tx"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-expense-ignore-tx" className="text-sm font-medium">
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
                  id="edit-expense-fixed-expense"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-expense-fixed-expense" className="text-sm font-medium">
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
                  id="edit-expense-repeat"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-expense-repeat" className="text-sm font-medium">
                  Repetição habilitada
                </label>
              </div>
            </Field>
          )}
        />
        {repeatEnabled ? (
          <>
            <Field>
              <FieldLabel htmlFor="edit-expense-repeat-count">Quantidade de repetições</FieldLabel>
              <Input
                id="edit-expense-repeat-count"
                type="number"
                min={0}
                step={1}
                {...register("repeatCount", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.repeatCount]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-expense-repeat-interval">Intervalo</FieldLabel>
              <Input
                id="edit-expense-repeat-interval"
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
