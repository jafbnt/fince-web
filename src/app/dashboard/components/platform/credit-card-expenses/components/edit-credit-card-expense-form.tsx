import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BrlCentsBalanceInput } from "../../account/components/brl-cents-balance-input";
import { CategoryPickerField } from "../../revenue/components/category-picker-field";
import { useCategoryStore } from "../../category/store";
import { useCreditCardStore } from "../../credit-card/store";
import { TagPickerField } from "../../expenses/components/tag-picker-field";
import { useCreditCardExpenseStore } from "../store";
import {
  createCreditCardExpenseSchema,
  CREDIT_CARD_EXPENSE_MAX_INSTALLMENTS,
  creditCardExpenseToFormDefaults,
  formatInstallmentOptionLabel,
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
    setValue,
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
          installments: 1,
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

  const fixedExpense = watch("fixedExpense");
  const amount = watch("amount");
  const showInstallments =
    !fixedExpense && Number.isFinite(amount) && amount > 0;

  useEffect(() => {
    if (fixedExpense) {
      setValue("installments", 1);
    }
  }, [fixedExpense, setValue]);

  useEffect(() => {
    if (!Number.isFinite(amount) || amount <= 0) {
      setValue("installments", 1);
    }
  }, [amount, setValue]);

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
          <FieldLabel htmlFor="edit-cc-expense-invoice-date">Data da fatura</FieldLabel>
          <Input id="edit-cc-expense-invoice-date" type="date" {...register("invoiceDate")} />
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
                  id="edit-cc-expense-recorrente"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-cc-expense-recorrente" className="text-sm font-medium">
                  Recorrente
                </label>
              </div>
            </Field>
          )}
        />
        {showInstallments ? (
          <Controller
            control={control}
            name="installments"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel id="edit-cc-expense-installments-label">Parcelas</FieldLabel>
                <div
                  id="edit-cc-expense-installments"
                  role="listbox"
                  aria-labelledby="edit-cc-expense-installments-label"
                  className="max-h-52 overflow-y-auto rounded-3xl border border-border bg-input/30 p-2"
                >
                  {Array.from({ length: CREDIT_CARD_EXPENSE_MAX_INSTALLMENTS }, (_, i) => i + 1).map(
                    (n) => {
                      const selected = field.value === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => field.onChange(n)}
                          className={cn(
                            "flex w-full rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                            "hover:bg-muted/80",
                            selected && "bg-muted ring-1 ring-ring/40",
                          )}
                        >
                          {formatInstallmentOptionLabel(n, amount)}
                        </button>
                      );
                    },
                  )}
                </div>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </Field>
            )}
          />
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
