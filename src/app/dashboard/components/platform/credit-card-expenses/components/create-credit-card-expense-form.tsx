import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
  formatInstallmentOptionLabel,
  type CreateCreditCardExpenseFormValues,
  formValuesToCreditCardExpensePayload,
} from "../type";
import { CreditCardPickerField } from "./credit-card-picker-field";

function defaultDateInputValue(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Primeiro dia do mês atual (padrão comum para data de fatura). */
function defaultInvoiceDateInputValue(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-01`;
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
    setValue,
    formState: { errors },
  } = useForm<CreateCreditCardExpenseFormValues>({
    resolver: zodResolver(createCreditCardExpenseSchema),
    defaultValues: {
      amount: 0,
      datePaid: defaultDateInputValue(),
      description: "",
      categoryUuid: "",
      creditCardUuid: "",
      invoiceDate: defaultInvoiceDateInputValue(),
      tagUuid: "",
      ignoreTransaction: true,
      notation: "",
      fixedExpense: false,
      installments: 1,
    },
  });

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
    const ok = await createCreditCardExpense(formValuesToCreditCardExpensePayload(values));
    if (ok) {
      reset({
        amount: 0,
        datePaid: defaultDateInputValue(),
        description: "",
        categoryUuid: "",
        creditCardUuid: "",
        invoiceDate: defaultInvoiceDateInputValue(),
        tagUuid: "",
        ignoreTransaction: true,
        notation: "",
        fixedExpense: false,
        installments: 1,
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
          <FieldLabel htmlFor="cc-expense-invoice-date">Data da fatura</FieldLabel>
          <Input id="cc-expense-invoice-date" type="date" {...register("invoiceDate")} />
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
                  id="cc-expense-recorrente"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="cc-expense-recorrente" className="text-sm font-medium">
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
                <FieldLabel id="cc-expense-installments-label">Parcelas</FieldLabel>
                <div
                  id="cc-expense-installments"
                  role="listbox"
                  aria-labelledby="cc-expense-installments-label"
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
