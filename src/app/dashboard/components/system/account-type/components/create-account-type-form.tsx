import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoPickerField } from "../../flag/components/logo-picker-field";
import { useLogoStore } from "../../logo/store";
import { useAccountTypeStore } from "../store";
import { createAccountTypeSchema, type CreateAccountTypeFormValues } from "../type";

type CreateAccountTypeFormProps = {
  onSuccess?: () => void;
};

export function CreateAccountTypeForm({ onSuccess }: CreateAccountTypeFormProps) {
  const createAccountType = useAccountTypeStore((s) => s.createAccountType);
  const loadingCreate = useAccountTypeStore((s) => s.loadingCreate);
  const errorCreate = useAccountTypeStore((s) => s.errorCreate);
  const logosCount = useLogoStore((s) => s.logos.length);

  useEffect(() => {
    useAccountTypeStore.setState({ errorCreate: null });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAccountTypeFormValues>({
    resolver: zodResolver(createAccountTypeSchema),
    defaultValues: { name: "", logoUuid: "" },
  });

  const onSubmit = async (values: CreateAccountTypeFormValues): Promise<void> => {
    const ok = await createAccountType({
      name: values.name.trim(),
      logoUuid: values.logoUuid,
    });
    if (ok) {
      reset();
      onSuccess?.();
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="account-type-name">Nome</FieldLabel>
          <Input id="account-type-name" autoComplete="off" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <LogoPickerField
          control={control}
          name="logoUuid"
          id="create-account-type-logo"
        />
        {errorCreate ? <FieldError>{errorCreate}</FieldError> : null}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="submit" disabled={loadingCreate || logosCount === 0}>
            {loadingCreate ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
