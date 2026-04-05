import { cn } from "@/lib/utils";

type LogoSvgPreviewProps = {
  svg: string;
  className?: string;
};

export function LogoSvgPreview({ svg, className }: LogoSvgPreviewProps) {
  const trimmed = svg?.trim();
  if (!trimmed) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg p-1",
        "[&_svg]:max-h-10 [&_svg]:max-w-full [&_svg]:object-contain",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}
