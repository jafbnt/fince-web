import { cn } from "@/lib/utils";
import { LogoApiSvgTheme } from "./logo-api-svg-theme";

type LogoSvgPreviewProps = {
  svg: string;
  className?: string;
  /**
   * `true`: aplica tema (ícone monocromático). `false`: SVG colorido, sem `LogoApiSvgTheme`.
   * `undefined`: trata como ícone (compatível com respostas antigas da API).
   */
  isIcon?: boolean;
};

export function LogoSvgPreview({ svg, className, isIcon }: LogoSvgPreviewProps) {
  const trimmed = svg?.trim();
  if (!trimmed) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const applyIconTheme = isIcon !== false;

  const inner = (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg p-1",
        "[&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:object-contain",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );

  if (applyIconTheme) {
    return <LogoApiSvgTheme>{inner}</LogoApiSvgTheme>;
  }

  return <div className="inline-flex shrink-0">{inner}</div>;
}
