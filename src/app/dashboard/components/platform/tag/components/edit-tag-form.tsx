import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTagStore } from "../store";
import { createTagSchema, type CreateTagFormValues, type Tag } from "../type";

type EditTagFormProps = {
  tagUuid: string;
  initialTag?: Tag;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditTagForm({ tagUuid, initialTag, onSuccess, onCancel }: EditTagFormProps) {
  const fetchTagByUuid = useTagStore((s) => s.fetchTagByUuid);
  const updateTag = useTagStore((s) => s.updateTag);
  const loadingUpdate = useTagStore((s) => s.loadingUpdate);
  const errorUpdate = useTagStore((s) => s.errorUpdate);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialTag));
  const [prefillError, setPrefillError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTagFormValues>({
    resolver: zodResolver(createTagSchema),
    defaultValues: { nome: initialTag?.nome ?? "" },
  });

  useEffect(() => {
    useTagStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialTag) {
      reset({ nome: initialTag.nome });
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const t = await fetchTagByUuid(tagUuid);
      if (cancelled) return;
      if (t) {
        reset({ nome: t.nome });
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [tagUuid, initialTag, fetchTagByUuid, reset]);

  const onSubmit = async (values: CreateTagFormValues): Promise<void> => {
    const ok = await updateTag(tagUuid, { nome: values.nome.trim() });
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
    return <p className="text-sm text-destructive">Não foi possível carregar a tag.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-tag-nome">Nome</FieldLabel>
          <Input id="edit-tag-nome" autoComplete="off" {...register("nome")} />
          <FieldError errors={[errors.nome]} />
        </Field>
        {errorUpdate ? <FieldError>{errorUpdate}</FieldError> : null}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loadingUpdate}>
              Voltar
            </Button>
          ) : null}
          <Button type="submit" disabled={loadingUpdate}>
            {loadingUpdate ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
