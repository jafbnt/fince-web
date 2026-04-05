import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useColorStore } from "../store";
import { createColorSchema, type Color, type CreateColorFormValues } from "../type";

type ColorEditFormProps = {
  colorUuid: string;
  initialColor?: Color;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ColorEditForm({ colorUuid, initialColor, onSuccess, onCancel }: ColorEditFormProps) {
  const fetchColorByUuid = useColorStore((s) => s.fetchColorByUuid);
  const updateColor = useColorStore((s) => s.updateColor);
  const loadingUpdate = useColorStore((s) => s.loadingUpdate);
  const errorUpdate = useColorStore((s) => s.errorUpdate);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialColor));
  const [prefillError, setPrefillError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateColorFormValues>({
    resolver: zodResolver(createColorSchema),
    defaultValues: {
      name: initialColor?.name ?? "",
      hex: initialColor?.hex ?? "",
    },
  });

  useEffect(() => {
    useColorStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialColor) {
      reset({ name: initialColor.name, hex: initialColor.hex });
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const c = await fetchColorByUuid(colorUuid);
      if (cancelled) return;
      if (c) {
        reset({ name: c.name, hex: c.hex });
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [colorUuid, initialColor, fetchColorByUuid, reset]);

  const onSubmit = async (values: CreateColorFormValues): Promise<void> => {
    const ok = await updateColor(colorUuid, {
      name: values.name.trim(),
      hex: values.hex.trim(),
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
    return <p className="text-sm text-destructive">Não foi possível carregar a cor.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-color-name">Nome</FieldLabel>
          <Input id="edit-color-name" autoComplete="off" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-color-hex">Hex</FieldLabel>
          <Input id="edit-color-hex" autoComplete="off" className="font-mono" {...register("hex")} />
          <FieldError errors={[errors.hex]} />
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
