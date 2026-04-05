import { useEffect, useState } from "react";
import { LoadingCenter } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EditTagForm } from "./edit-tag-form";
import { useTagStore } from "../store";
import type { Tag } from "../type";

type ViewTagDrawerContentProps = {
  tagUuid: string;
  onClose: () => void;
};

export function ViewTagDrawerContent({ tagUuid, onClose }: ViewTagDrawerContentProps) {
  const fetchTagByUuid = useTagStore((s) => s.fetchTagByUuid);
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const t = await fetchTagByUuid(tagUuid);
      if (!cancelled) {
        setTag(t);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tagUuid, fetchTagByUuid]);

  if (loading) {
    return <LoadingCenter />;
  }

  if (!tag) {
    return <p className="text-sm text-destructive">Não foi possível carregar a tag.</p>;
  }

  if (mode === "edit") {
    return (
      <EditTagForm
        tagUuid={tagUuid}
        initialTag={tag}
        onSuccess={onClose}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="view-tag-nome">Nome</FieldLabel>
          <Input id="view-tag-nome" readOnly disabled value={tag.nome} />
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
