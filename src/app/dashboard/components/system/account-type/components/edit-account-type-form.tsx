import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoPickerField } from "../../flag/components/logo-picker-field";
import { useLogoStore } from "../../logo/store";
import { useAccountTypeStore } from "../store";
import {
  createAccountTypeSchema,
  type AccountType,
  type CreateAccountTypeFormValues,
} from "../type";

type EditAccountTypeFormProps = {
  accountTypeUuid: string;
  initialAccountType?: AccountType;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditAccountTypeForm({
  accountTypeUuid,
  initialAccountType,
  onSuccess,
  onCancel,
}: EditAccountTypeFormProps) {
  const fetchAccountTypeByUuid = useAccountTypeStore((s) => s.fetchAccountTypeByUuid);
  const updateAccountType = useAccountTypeStore((s) => s.updateAccountType);
  const loadingUpdate = useAccountTypeStore((s) => s.loadingUpdate);
  const errorUpdate = useAccountTypeStore((s) => s.errorUpdate);
  const logosCount = useLogoStore((s) => s.logos.length);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialAccountType));
  const [prefillError, setPrefillError] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAccountTypeFormValues>({
    resolver: zodResolver(createAccountTypeSchema),
    defaultValues: {
      name: initialAccountType?.name ?? "",
      logoUuid: initialAccountType?.logoUuid ?? "",
    },
  });

  useEffect(() => {
    useAccountTypeStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialAccountType) {
      reset({
        name: initialAccountType.name,
        logoUuid: initialAccountType.logoUuid,
      });
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const a = await fetchAccountTypeByUuid(accountTypeUuid);
      if (cancelled) return;
      if (a) {
        reset({ name: a.name, logoUuid: a.logoUuid });
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [accountTypeUuid, initialAccountType, fetchAccountTypeByUuid, reset]);

  const onSubmit = async (values: CreateAccountTypeFormValues): Promise<void> => {
    const ok = await updateAccountType(accountTypeUuid, {
      name: values.name.trim(),
      logoUuid: values.logoUuid,
    });
    if (ok) {
      onSuccess?.();
    }
  };

  if (!prefillReady) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Carregando…
      </p>
    );
  }

  if (prefillError) {
    return (
      <p className="text-sm text-destructive">Não foi possível carregar o tipo de conta.</p>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-account-type-name">Nome</FieldLabel>
          <Input id="edit-account-type-name" autoComplete="off" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <LogoPickerField
          control={control}
          name="logoUuid"
          id="edit-account-type-logo"
        />
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
