import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { inlineSvg } from "../inline-svg";
import { useLogoStore } from "../store";
import { createLogoSchema, type CreateLogoFormValues } from "../type";

type CreateLogoFormProps = {
  onSuccess?: () => void;
};

export function CreateLogoForm({ onSuccess }: CreateLogoFormProps) {
  const createLogo = useLogoStore((s) => s.createLogo);
  const loadingCreate = useLogoStore((s) => s.loadingCreate);
  const errorCreate = useLogoStore((s) => s.errorCreate);

  useEffect(() => {
    useLogoStore.setState({ errorCreate: null });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLogoFormValues>({
    resolver: zodResolver(createLogoSchema),
    defaultValues: {
      name: "",
      svg: "",
      isIcon: true,
    },
  });

  const onSubmit = async (values: CreateLogoFormValues): Promise<void> => {
    const ok = await createLogo({
      name: values.name.trim(),
      svg: inlineSvg(values.svg),
      isIcon: values.isIcon,
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
          <FieldLabel htmlFor="logo-name">Nome</FieldLabel>
          <Input id="logo-name" autoComplete="off" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="logo-svg">SVG</FieldLabel>
          <Textarea id="logo-svg" rows={8} spellCheck={false} {...register("svg")} />
          <FieldError errors={[errors.svg]} />
        </Field>
        <Controller
          control={control}
          name="isIcon"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="logo-is-icon"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="logo-is-icon" className="text-sm font-medium">
                  Ícone (monocromático — ajusta cor no tema claro/escuro)
                </label>
              </div>
            </Field>
          )}
        />
        {errorCreate ? <FieldError>{errorCreate}</FieldError> : null}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="submit" disabled={loadingCreate}>
            {loadingCreate ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
