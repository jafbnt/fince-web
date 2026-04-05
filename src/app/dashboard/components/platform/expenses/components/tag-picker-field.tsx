import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { PickerLoading } from "@/components/spinner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useTagStore } from "../../tag/store";
import type { Tag } from "../../tag/type";

type TagPickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  id?: string;
  disabled?: boolean;
};

export function TagPickerField<T extends FieldValues>({
  control,
  name,
  label = "Tag (opcional)",
  id = "expense-tag",
  disabled,
}: TagPickerFieldProps<T>) {
  const tags = useTagStore((s) => s.tags);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const loadingTags = useTagStore((s) => s.loadingList);

  useEffect(() => {
    if (tags.length === 0 && !loadingTags) {
      void fetchTags();
    }
  }, [tags.length, loadingTags, fetchTags]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {loadingTags && tags.length === 0 ? (
            <PickerLoading />
          ) : (
            <div
              id={id}
              role="listbox"
              aria-label={label}
              className="max-h-40 overflow-y-auto rounded-3xl border border-border bg-input/30 p-2"
            >
              <button
                type="button"
                role="option"
                aria-selected={field.value === ""}
                disabled={disabled}
                onClick={() => field.onChange("")}
                className={cn(
                  "mb-1 flex w-full rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                  "hover:bg-muted/80",
                  field.value === "" && "bg-muted ring-1 ring-ring/40",
                  disabled && "pointer-events-none opacity-50",
                )}
              >
                Sem tag
              </button>
              {tags.map((tag: Tag) => {
                const selected = field.value === tag.uuid;
                return (
                  <button
                    key={tag.uuid}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disabled}
                    onClick={() => field.onChange(tag.uuid)}
                    className={cn(
                      "flex w-full rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-muted/80",
                      selected && "bg-muted ring-1 ring-ring/40",
                      disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    {tag.nome}
                  </button>
                );
              })}
            </div>
          )}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}
