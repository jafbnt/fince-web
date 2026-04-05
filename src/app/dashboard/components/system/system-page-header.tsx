import { Button } from "@/components/ui/button";

type SystemPageHeaderProps = {
  title: string;
  description: string;
  registerLabel?: string;
  onRegister?: () => void;
};

export function SystemPageHeader({
  title,
  description,
  registerLabel = "Cadastrar",
  onRegister,
}: SystemPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {onRegister ? (
        <Button
          type="button"
          variant="default"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => onRegister()}
        >
          {registerLabel}
        </Button>
      ) : null}
    </div>
  );
}
