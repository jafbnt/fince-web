import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoPickerField } from "../../../system/flag/components/logo-picker-field";
import { useColorStore } from "../../../system/color/store";
import { useLogoStore } from "../../../system/logo/store";
import { ColorPickerField } from "./color-picker-field";
import { useCategoryStore } from "../store";
import { createCategorySchema, type CreateCategoryFormValues } from "../type";

type CreateCategoryFormProps = {
  onSuccess?: () => void;
};

export function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const createCategory = useCategoryStore((s) => s.createCategory);
  const loadingCreate = useCategoryStore((s) => s.loadingCreate);
  const errorCreate = useCategoryStore((s) => s.errorCreate);
  const logosCount = useLogoStore((s) => s.logos.length);
  const colorsCount = useColorStore((s) => s.colors.length);

  useEffect(() => {
    useCategoryStore.setState({ errorCreate: null });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      nome: "",
      logoUuid: "",
      colorUuid: "",
    },
  });

  const onSubmit = async (values: CreateCategoryFormValues): Promise<void> => {
    const ok = await createCategory({
      nome: values.nome.trim(),
      logoUuid: values.logoUuid,
      colorUuid: values.colorUuid,
    });
    if (ok) {
      reset();
      onSuccess?.();
    }
  };

  const canSubmit = logosCount > 0 && colorsCount > 0;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="category-nome">Nome</FieldLabel>
          <Input id="category-nome" autoComplete="off" {...register("nome")} />
          <FieldError errors={[errors.nome]} />
        </Field>
        <LogoPickerField control={control} name="logoUuid" id="create-category-logo" />
        <ColorPickerField control={control} name="colorUuid" id="create-category-color" />
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
