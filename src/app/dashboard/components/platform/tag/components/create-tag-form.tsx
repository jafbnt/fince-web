import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTagStore } from "../store";
import { createTagSchema, type CreateTagFormValues } from "../type";

type CreateTagFormProps = {
  onSuccess?: () => void;
};

export function CreateTagForm({ onSuccess }: CreateTagFormProps) {
  const createTag = useTagStore((s) => s.createTag);
  const loadingCreate = useTagStore((s) => s.loadingCreate);
  const errorCreate = useTagStore((s) => s.errorCreate);

  useEffect(() => {
    useTagStore.setState({ errorCreate: null });
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTagFormValues>({
    resolver: zodResolver(createTagSchema),
    defaultValues: { nome: "" },
  });

  const onSubmit = async (values: CreateTagFormValues): Promise<void> => {
    const ok = await createTag({ nome: values.nome.trim() });
    if (ok) {
      reset();
      onSuccess?.();
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="tag-nome">Nome</FieldLabel>
          <Input id="tag-nome" autoComplete="off" {...register("nome")} />
          <FieldError errors={[errors.nome]} />
        </Field>
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
