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
import { useRevenueStore } from "../store";
import {
  createRevenueSchema,
  type CreateRevenueFormValues,
  formValuesToRevenuePayload,
  revenueNeedsDetailFetchForForm,
  revenueToFormDefaults,
  type Revenue,
} from "../type";
import { AccountPickerField } from "./account-picker-field";
import { CategoryPickerField } from "./category-picker-field";

type EditRevenueFormProps = {
  revenueUuid: string;
  initialRevenue?: Revenue;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditRevenueForm({
  revenueUuid,
  initialRevenue,
  onSuccess,
  onCancel,
}: EditRevenueFormProps) {
  const fetchRevenueByUuid = useRevenueStore((s) => s.fetchRevenueByUuid);
  const updateRevenue = useRevenueStore((s) => s.updateRevenue);
  const loadingUpdate = useRevenueStore((s) => s.loadingUpdate);
  const errorUpdate = useRevenueStore((s) => s.errorUpdate);
  const accountsCount = useAccountStore((s) => s.accounts.length);
  const categoriesCount = useCategoryStore((s) => s.categories.length);
  const [prefillReady, setPrefillReady] = useState(
    () => Boolean(initialRevenue && !revenueNeedsDetailFetchForForm(initialRevenue)),
  );
  const [prefillError, setPrefillError] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateRevenueFormValues>({
    resolver: zodResolver(createRevenueSchema),
    defaultValues: initialRevenue
      ? revenueToFormDefaults(initialRevenue)
      : {
          amount: 0,
          wasReceived: true,
          dateReceipt: "",
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

  useEffect(() => {
    useRevenueStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    const useInitialWithoutFetch =
      initialRevenue !== undefined && !revenueNeedsDetailFetchForForm(initialRevenue);

    if (useInitialWithoutFetch) {
      reset(revenueToFormDefaults(initialRevenue));
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const r = await fetchRevenueByUuid(revenueUuid);
      if (cancelled) return;
      if (r) {
        reset(revenueToFormDefaults(r));
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [revenueUuid, initialRevenue, fetchRevenueByUuid, reset]);

  const repeatEnabled = watch("repeatEnabled");

  const onSubmit = async (values: CreateRevenueFormValues): Promise<void> => {
    const ok = await updateRevenue(revenueUuid, formValuesToRevenuePayload(values));
    if (ok) {
      onSuccess?.();
    }
  };

  const canSubmit = accountsCount > 0 && categoriesCount > 0;

  if (!prefillReady) {
    return <LoadingCenter />;
  }

  if (prefillError) {
    return <p className="text-sm text-destructive">Não foi possível carregar a receita.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-revenue-description">Descrição</FieldLabel>
          <Input id="edit-revenue-description" autoComplete="off" {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="edit-revenue-amount">Valor (BRL)</FieldLabel>
              <BrlCentsBalanceInput
                id="edit-revenue-amount"
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
          <FieldLabel htmlFor="edit-revenue-date">Data de recebimento</FieldLabel>
          <Input id="edit-revenue-date" type="date" {...register("dateReceipt")} />
          <FieldError errors={[errors.dateReceipt]} />
        </Field>
        <Controller
          control={control}
          name="wasReceived"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="edit-revenue-was-received"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-revenue-was-received" className="text-sm font-medium">
                  Já recebido
                </label>
              </div>
            </Field>
          )}
        />
        <AccountPickerField control={control} name="accountUuid" id="edit-revenue-account" />
        <CategoryPickerField control={control} name="categoryUuid" id="edit-revenue-category" />
        <Field>
          <FieldLabel htmlFor="edit-revenue-notation">Anotação</FieldLabel>
          <Textarea id="edit-revenue-notation" rows={3} className="resize-y" {...register("notation")} />
          <FieldError errors={[errors.notation]} />
        </Field>
        <Controller
          control={control}
          name="ignoreTransaction"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="edit-revenue-ignore-tx"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-revenue-ignore-tx" className="text-sm font-medium">
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
                  id="edit-revenue-fixed-expense"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-revenue-fixed-expense" className="text-sm font-medium">
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
                  id="edit-revenue-repeat"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-revenue-repeat" className="text-sm font-medium">
                  Repetição habilitada
                </label>
              </div>
            </Field>
          )}
        />
        {repeatEnabled ? (
          <>
            <Field>
              <FieldLabel htmlFor="edit-revenue-repeat-count">Quantidade de repetições</FieldLabel>
              <Input
                id="edit-revenue-repeat-count"
                type="number"
                min={0}
                step={1}
                {...register("repeatCount", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.repeatCount]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-revenue-repeat-interval">Intervalo</FieldLabel>
              <Input
                id="edit-revenue-repeat-interval"
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
