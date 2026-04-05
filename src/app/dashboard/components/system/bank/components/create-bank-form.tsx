import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoPickerField } from "../../flag/components/logo-picker-field";
import { useLogoStore } from "../../logo/store";
import { useBankStore } from "../store";
import { createBankSchema, type CreateBankFormValues } from "../type";

type CreateBankFormProps = {
  onSuccess?: () => void;
};

export function CreateBankForm({ onSuccess }: CreateBankFormProps) {
  const createBank = useBankStore((s) => s.createBank);
  const loadingCreate = useBankStore((s) => s.loadingCreate);
  const errorCreate = useBankStore((s) => s.errorCreate);
  const logosCount = useLogoStore((s) => s.logos.length);

  useEffect(() => {
    useBankStore.setState({ errorCreate: null });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBankFormValues>({
    resolver: zodResolver(createBankSchema),
    defaultValues: {
      name: "",
      logoUuid: "",
    },
  });

  const onSubmit = async (values: CreateBankFormValues): Promise<void> => {
    const ok = await createBank({
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
          <FieldLabel htmlFor="bank-name">Nome</FieldLabel>
          <Input id="bank-name" autoComplete="off" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <LogoPickerField control={control} name="logoUuid" id="create-bank-logo" />
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
