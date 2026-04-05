import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoPickerField } from "../../flag/components/logo-picker-field";
import { useLogoStore } from "../../logo/store";
import { useBankStore } from "../store";
import { createBankSchema, type Bank, type CreateBankFormValues } from "../type";

type EditBankFormProps = {
  bankUuid: string;
  initialBank?: Bank;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditBankForm({ bankUuid, initialBank, onSuccess, onCancel }: EditBankFormProps) {
  const fetchBankByUuid = useBankStore((s) => s.fetchBankByUuid);
  const updateBank = useBankStore((s) => s.updateBank);
  const loadingUpdate = useBankStore((s) => s.loadingUpdate);
  const errorUpdate = useBankStore((s) => s.errorUpdate);
  const logosCount = useLogoStore((s) => s.logos.length);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialBank));
  const [prefillError, setPrefillError] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBankFormValues>({
    resolver: zodResolver(createBankSchema),
    defaultValues: {
      name: initialBank?.name ?? "",
      logoUuid: initialBank?.logoUuid ?? "",
    },
  });

  useEffect(() => {
    useBankStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialBank) {
      reset({ name: initialBank.name, logoUuid: initialBank.logoUuid });
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const b = await fetchBankByUuid(bankUuid);
      if (cancelled) return;
      if (b) {
        reset({ name: b.name, logoUuid: b.logoUuid });
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [bankUuid, initialBank, fetchBankByUuid, reset]);

  const onSubmit = async (values: CreateBankFormValues): Promise<void> => {
    const ok = await updateBank(bankUuid, {
      name: values.name.trim(),
      logoUuid: values.logoUuid,
    });
    if (ok) {
      onSuccess?.();
    }
  };

  if (!prefillReady) {
    return <LoadingCenter />;
  }

  if (prefillError) {
    return <p className="text-sm text-destructive">Não foi possível carregar o banco.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-bank-name">Nome</FieldLabel>
          <Input id="edit-bank-name" autoComplete="off" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <LogoPickerField control={control} name="logoUuid" id="edit-bank-logo" />
        {errorUpdate ? <FieldError>{errorUpdate}</FieldError> : null}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loadingUpdate}>
              Voltar
            </Button>
          ) : null}
          <Button type="submit" disabled={loadingUpdate || logosCount === 0}>
            {loadingUpdate ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
