import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LoadingCenter } from "@/components/spinner";
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
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLogoFormValues>({
    resolver: zodResolver(createLogoSchema),
    defaultValues: {
      name: initialLogo?.name ?? "",
      svg: initialLogo?.svg ?? "",
      isIcon: initialLogo?.isIcon ?? true,
    },
  });

  useEffect(() => {
    useLogoStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialLogo) {
      reset({
        name: initialLogo.name,
        svg: initialLogo.svg,
        isIcon: initialLogo.isIcon ?? true,
      });
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
        reset({
          name: logo.name,
          svg: logo.svg,
          isIcon: logo.isIcon ?? true,
        });
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
      isIcon: values.isIcon,
    });
    if (ok) {
      onSuccess?.();
    }
  };

  if (!prefillReady) {
    return <LoadingCenter />;
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
        <Controller
          control={control}
          name="isIcon"
          render={({ field }) => (
            <Field>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-input/30 px-3 py-3">
                <input
                  id="edit-logo-is-icon"
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="edit-logo-is-icon" className="text-sm font-medium">
                  Ícone (monocromático — ajusta cor no tema claro/escuro)
                </label>
              </div>
            </Field>
          )}
        />
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
