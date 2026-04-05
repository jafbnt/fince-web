import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoPickerField } from "./logo-picker-field";
import { useLogoStore } from "../../logo/store";
import { useFlagStore } from "../store";
import { createFlagSchema, type CreateFlagFormValues, type Flag } from "../type";

type EditFlagFormProps = {
  flagUuid: string;
  initialFlag?: Flag;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditFlagForm({ flagUuid, initialFlag, onSuccess, onCancel }: EditFlagFormProps) {
  const fetchFlagByUuid = useFlagStore((s) => s.fetchFlagByUuid);
  const updateFlag = useFlagStore((s) => s.updateFlag);
  const loadingUpdate = useFlagStore((s) => s.loadingUpdate);
  const errorUpdate = useFlagStore((s) => s.errorUpdate);
  const logosCount = useLogoStore((s) => s.logos.length);
  const [prefillReady, setPrefillReady] = useState(Boolean(initialFlag));
  const [prefillError, setPrefillError] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFlagFormValues>({
    resolver: zodResolver(createFlagSchema),
    defaultValues: {
      name: initialFlag?.name ?? "",
      logoUuid: initialFlag?.logoUuid ?? "",
    },
  });

  useEffect(() => {
    useFlagStore.setState({ errorUpdate: null });
  }, []);

  useEffect(() => {
    if (initialFlag) {
      reset({ name: initialFlag.name, logoUuid: initialFlag.logoUuid });
      setPrefillReady(true);
      setPrefillError(false);
      return;
    }
    let cancelled = false;
    setPrefillReady(false);
    void (async () => {
      const f = await fetchFlagByUuid(flagUuid);
      if (cancelled) return;
      if (f) {
        reset({ name: f.name, logoUuid: f.logoUuid });
        setPrefillError(false);
      } else {
        setPrefillError(true);
      }
      setPrefillReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [flagUuid, initialFlag, fetchFlagByUuid, reset]);

  const onSubmit = async (values: CreateFlagFormValues): Promise<void> => {
    const ok = await updateFlag(flagUuid, {
      name: values.name.trim(),
      logoUuid: values.logoUuid,
    });
    if (ok) {
      onSuccess?.();
    }
  };

  if (!prefillReady) {
    return <LoadingCenter />;
  }

  if (prefillError) {
    return <p className="text-sm text-destructive">Não foi possível carregar a bandeira.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-flag-name">Nome</FieldLabel>
          <Input id="edit-flag-name" autoComplete="off" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <LogoPickerField control={control} name="logoUuid" id="edit-flag-logo" />
        {errorUpdate ? <FieldError>{errorUpdate}</FieldError> : null}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loadingUpdate}>
              Voltar
            </Button>
          ) : null}
          <Button type="submit" disabled={loadingUpdate || logosCount === 0}>
            {loadingUpdate ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
