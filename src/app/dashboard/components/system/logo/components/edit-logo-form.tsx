import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { inlineSvg } from "../inline-svg";
import { useLogoStore } from "../store";
import { createLogoSchema, type CreateLogoFormValues, type Logo } from "../type";

type EditLogoFormProps = {
  logoUuid: string;
  initialLogo?: Logo;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditLogoForm({ logoUuid, initialLogo, onSuccess, onCancel }: EditLogoFormProps) {
  const fetchLogoByUuid = useLogoStore((s) => s.fetchLogoByUuid);
  const updateLogo = useLogoStore((s) => s.updateLogo);
  const loadingUpdate = useLogoStore((s) => s.loadingUpdate);
  const errorUpdate = useLogoStore((s) => s.errorUpdate);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialLogo));
  const [prefillError, setPrefillError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLogoFormValues>({
    resolver: zodResolver(createLogoSchema),
    defaultValues: {
      name: initialLogo?.name ?? "",
      svg: initialLogo?.svg ?? "",
    },
  });

  useEffect(() => {
    useLogoStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialLogo) {
      reset({ name: initialLogo.name, svg: initialLogo.svg });
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const logo = await fetchLogoByUuid(logoUuid);
      if (cancelled) return;
      if (logo) {
        reset({ name: logo.name, svg: logo.svg });
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [logoUuid, initialLogo, fetchLogoByUuid, reset]);

  const onSubmit = async (values: CreateLogoFormValues): Promise<void> => {
    const ok = await updateLogo(logoUuid, {
      name: values.name.trim(),
      svg: inlineSvg(values.svg),
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
    return <p className="text-sm text-destructive">Não foi possível carregar o logo.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-logo-name">Nome</FieldLabel>
          <Input id="edit-logo-name" autoComplete="off" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-logo-svg">SVG</FieldLabel>
          <Textarea id="edit-logo-svg" rows={8} spellCheck={false} {...register("svg")} />
          <FieldError errors={[errors.svg]} />
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
