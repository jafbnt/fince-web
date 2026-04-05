import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoPickerField } from "./logo-picker-field";
import { useLogoStore } from "../../logo/store";
import { useFlagStore } from "../store";
import { createFlagSchema, type CreateFlagFormValues } from "../type";

type CreateFlagFormProps = {
  onSuccess?: () => void;
};

export function CreateFlagForm({ onSuccess }: CreateFlagFormProps) {
  const createFlag = useFlagStore((s) => s.createFlag);
  const loadingCreate = useFlagStore((s) => s.loadingCreate);
  const errorCreate = useFlagStore((s) => s.errorCreate);
  const logosCount = useLogoStore((s) => s.logos.length);

  useEffect(() => {
    useFlagStore.setState({ errorCreate: null });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFlagFormValues>({
    resolver: zodResolver(createFlagSchema),
    defaultValues: {
      name: "",
      logoUuid: "",
    },
  });

  const onSubmit = async (values: CreateFlagFormValues): Promise<void> => {
    const ok = await createFlag({
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
          <FieldLabel htmlFor="flag-name">Nome</FieldLabel>
          <Input id="flag-name" autoComplete="off" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <LogoPickerField control={control} name="logoUuid" id="create-flag-logo" />
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
