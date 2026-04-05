import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoPickerField } from "../../../system/flag/components/logo-picker-field";
import { useColorStore } from "../../../system/color/store";
import { useLogoStore } from "../../../system/logo/store";
import { ColorPickerField } from "./color-picker-field";
import { useCategoryStore } from "../store";
import { createCategorySchema, type Category, type CreateCategoryFormValues } from "../type";

type EditCategoryFormProps = {
  categoryUuid: string;
  initialCategory?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditCategoryForm({
  categoryUuid,
  initialCategory,
  onSuccess,
  onCancel,
}: EditCategoryFormProps) {
  const fetchCategoryByUuid = useCategoryStore((s) => s.fetchCategoryByUuid);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const loadingUpdate = useCategoryStore((s) => s.loadingUpdate);
  const errorUpdate = useCategoryStore((s) => s.errorUpdate);
  const logosCount = useLogoStore((s) => s.logos.length);
  const colorsCount = useColorStore((s) => s.colors.length);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialCategory));
  const [prefillError, setPrefillError] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      nome: initialCategory?.nome ?? "",
      logoUuid: initialCategory?.logoUuid ?? "",
      colorUuid: initialCategory?.colorUuid ?? "",
    },
  });

  useEffect(() => {
    useCategoryStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialCategory) {
      reset({
        nome: initialCategory.nome,
        logoUuid: initialCategory.logoUuid,
        colorUuid: initialCategory.colorUuid,
      });
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const c = await fetchCategoryByUuid(categoryUuid);
      if (cancelled) return;
      if (c) {
        reset({ nome: c.nome, logoUuid: c.logoUuid, colorUuid: c.colorUuid });
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryUuid, initialCategory, fetchCategoryByUuid, reset]);

  const onSubmit = async (values: CreateCategoryFormValues): Promise<void> => {
    const ok = await updateCategory(categoryUuid, {
      nome: values.nome.trim(),
      logoUuid: values.logoUuid,
      colorUuid: values.colorUuid,
    });
    if (ok) {
      onSuccess?.();
    }
  };

  const canSubmit = logosCount > 0 && colorsCount > 0;

  if (!prefillReady) {
    return <LoadingCenter />;
  }

  if (prefillError) {
    return <p className="text-sm text-destructive">Não foi possível carregar a categoria.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-category-nome">Nome</FieldLabel>
          <Input id="edit-category-nome" autoComplete="off" {...register("nome")} />
          <FieldError errors={[errors.nome]} />
        </Field>
        <LogoPickerField control={control} name="logoUuid" id="edit-category-logo" />
        <ColorPickerField control={control} name="colorUuid" id="edit-category-color" />
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
