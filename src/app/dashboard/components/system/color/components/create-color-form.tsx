import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useColorStore } from "../store";
import { createColorSchema, type CreateColorFormValues } from "../type";

type CreateColorFormProps = {
  onSuccess?: () => void;
};

export function CreateColorForm({ onSuccess }: CreateColorFormProps) {
  const createColor = useColorStore((s) => s.createColor);
  const loadingCreate = useColorStore((s) => s.loadingCreate);
  const errorCreate = useColorStore((s) => s.errorCreate);

  useEffect(() => {
    useColorStore.setState({ errorCreate: null });
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateColorFormValues>({
    resolver: zodResolver(createColorSchema),
    defaultValues: {
      name: "",
      hex: "",
    },
  });

  const onSubmit = async (values: CreateColorFormValues): Promise<void> => {
    const ok = await createColor({ name: values.name.trim(), hex: values.hex.trim() });
    if (ok) {
      reset();
      onSuccess?.();
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="color-name">Nome</FieldLabel>
          <Input id="color-name" autoComplete="off" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="color-hex">Hex</FieldLabel>
          <Input id="color-hex" autoComplete="off" {...register("hex")} />
          <FieldError errors={[errors.hex]} />
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
