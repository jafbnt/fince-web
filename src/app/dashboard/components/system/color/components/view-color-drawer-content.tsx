import { useEffect, useState } from "react";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useColorStore } from "../store";
import type { Color } from "../type";
import { ColorEditForm } from "./edit-color-form";

type ViewColorDrawerContentProps = {
  colorUuid: string;
  onClose: () => void;
};

export function ViewColorDrawerContent({ colorUuid, onClose }: ViewColorDrawerContentProps) {
  const fetchColorByUuid = useColorStore((s) => s.fetchColorByUuid);
  const [color, setColor] = useState<Color | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const c = await fetchColorByUuid(colorUuid);
      if (!cancelled) {
        setColor(c);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [colorUuid, fetchColorByUuid]);

  if (loading) {
    return <LoadingCenter />;
  }

  if (!color) {
    return <p className="text-sm text-destructive">Não foi possível carregar a cor.</p>;
  }

  if (mode === "edit") {
    return (
      <ColorEditForm
        colorUuid={colorUuid}
        initialColor={color}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-color-name">Nome</FieldLabel>
          <Input id="view-color-name" readOnly disabled value={color.name} />
        </Field>
        <Field>
          <FieldLabel htmlFor="view-color-hex">Hex</FieldLabel>
          <Input id="view-color-hex" readOnly disabled value={color.hex} className="font-mono" />
        </Field>
        <Field>
          <FieldLabel>Prévia</FieldLabel>
          <div className="flex items-center gap-3">
            <span
              className="inline-block size-12 rounded-xl border border-border shadow-inner"
              style={{ backgroundColor: color.hex }}
            />
          </div>
        </Field>
      </FieldGroup>
      <div className="flex justify-end pt-2">
        <Button type="button" onClick={() => setMode("edit")}>
          Editar
        </Button>
      </div>
    </div>
  );
}
