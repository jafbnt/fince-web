import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { PickerLoading } from "@/components/spinner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { creditCardLabel, type CreditCard } from "../../credit-card/type";
import { useCreditCardStore } from "../../credit-card/store";

type CreditCardPickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  id?: string;
  disabled?: boolean;
};

export function CreditCardPickerField<T extends FieldValues>({
  control,
  name,
  label = "Cartão de crédito",
  id = "cc-expense-card",
  disabled,
}: CreditCardPickerFieldProps<T>) {
  const creditCards = useCreditCardStore((s) => s.creditCards);
  const fetchCreditCards = useCreditCardStore((s) => s.fetchCreditCards);
  const loadingList = useCreditCardStore((s) => s.loadingList);
  const listLoaded = useCreditCardStore((s) => s.listLoaded);

  useEffect(() => {
    if (listLoaded) return;
    void fetchCreditCards();
  }, [listLoaded, fetchCreditCards]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {loadingList && creditCards.length === 0 ? (
            <PickerLoading />
          ) : creditCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum cartão cadastrado. Cadastre cartões na API (ex.: GET /api/credit-cards).
            </p>
          ) : (
            <div
              id={id}
              role="listbox"
              aria-label={label}
              className="max-h-52 overflow-y-auto rounded-3xl border border-border bg-input/30 p-2"
            >
              {creditCards.map((card: CreditCard) => {
                const selected = field.value === card.uuid;
                return (
                  <button
                    key={card.uuid}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disabled}
                    onClick={() => field.onChange(card.uuid)}
                    className={cn(
                      "flex w-full rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-muted/80",
                      selected && "bg-muted ring-1 ring-ring/40",
                      disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <span className="min-w-0 font-medium text-foreground">{creditCardLabel(card)}</span>
                  </button>
                );
              })}
            </div>
          )}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}
