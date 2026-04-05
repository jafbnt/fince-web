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
import { useRevenueStore } from "../store";
import {
  createRevenueSchema,
  type CreateRevenueFormValues,
  formValuesToRevenuePayload,
} from "../type";
import { AccountPickerField } from "./account-picker-field";
import { CategoryPickerField } from "./category-picker-field";

function defaultDateInputValue(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

type CreateRevenueFormProps = {
  onSuccess?: () => void;
};

export function CreateRevenueForm({ onSuccess }: CreateRevenueFormProps) {
  const createRevenue = useRevenueStore((s) => s.createRevenue);
  const loadingCreate = useRevenueStore((s) => s.loadingCreate);
  const errorCreate = useRevenueStore((s) => s.errorCreate);
  const accountsCount = useAccountStore((s) => s.accounts.length);
  const categoriesCount = useCategoryStore((s) => s.categories.length);

  useEffect(() => {
    useRevenueStore.setState({ errorCreate: null });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateRevenueFormValues>({
    resolver: zodResolver(createRevenueSchema),
    defaultValues: {
      amount: 0,
      wasReceived: true,
      dateReceipt: defaultDateInputValue(),
      description: "",
      categoryUuid: "",
      accountUuid: "",
      ignoreTransaction: true,
      notation: "",
      fixedExpense: false,
      repeatEnabled: false,
      repeatCount: 0,
      repeatInterval: "",
    },
  });

  const repeatEnabled = watch("repeatEnabled");

  const onSubmit = async (values: CreateRevenueFormValues): Promise<void> => {
    const ok = await createRevenue(formValuesToRevenuePayload(values));
    if (ok) {
      reset({
        amount: 0,
        wasReceived: true,
        dateReceipt: defaultDateInputValue(),
        description: "",
        categoryUuid: "",
        accountUuid: "",
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
          <FieldLabel htmlFor="revenue-description">Descrição</FieldLabel>
          <Input id="revenue-description" autoComplete="off" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="revenue-amount">Valor (BRL)</FieldLabel>
              <BrlCentsBalanceInput
                id="revenue-amount"
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
          <FieldLabel htmlFor="revenue-date">Data de recebimento</FieldLabel>
          <Input id="revenue-date" type="date" {...register("dateReceipt")} />
          <FieldError errors={[errors.dateReceipt]} />
        </Field>
        <Controller
          control={control}
          name="wasReceived"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="revenue-was-received"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="revenue-was-received" className="text-sm font-medium">
                  Já recebido
                </label>
              </div>
            </Field>
          )}
        />
        <AccountPickerField control={control} name="accountUuid" id="create-revenue-account" />
        <CategoryPickerField control={control} name="categoryUuid" id="create-revenue-category" />
        <Field>
          <FieldLabel htmlFor="revenue-notation">Anotação</FieldLabel>
          <Textarea id="revenue-notation" rows={3} className="resize-y" {...register("notation")} />
          <FieldError errors={[errors.notation]} />
        </Field>
        <Controller
          control={control}
          name="ignoreTransaction"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="revenue-ignore-tx"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="revenue-ignore-tx" className="text-sm font-medium">
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
                  id="revenue-fixed-expense"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="revenue-fixed-expense" className="text-sm font-medium">
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
                  id="revenue-repeat"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="revenue-repeat" className="text-sm font-medium">
                  Repetição habilitada
                </label>
              </div>
            </Field>
          )}
        />
        {repeatEnabled ? (
          <>
            <Field>
              <FieldLabel htmlFor="revenue-repeat-count">Quantidade de repetições</FieldLabel>
              <Input
                id="revenue-repeat-count"
                type="number"
                min={0}
                step={1}
                {...register("repeatCount", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.repeatCount]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="revenue-repeat-interval">Intervalo</FieldLabel>
              <Input
                id="revenue-repeat-interval"
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
