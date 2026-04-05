import { cn } from "@/lib/utils";

type LogoApiSvgThemeProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Só para logos com `isIcon: true` (monocromático). SVG colorido não deve usar este wrapper.
 * Usa `text-gray-700` / `dark:text-white` + `fill-current` nas formas comuns.
 */
export function LogoApiSvgTheme({ children, className }: LogoApiSvgThemeProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 text-gray-700 dark:text-white",
        "[&_svg_path]:fill-current [&_svg_circle]:fill-current [&_svg_rect]:fill-current [&_svg_polygon]:fill-current [&_svg_polyline]:fill-current",
        className,
      )}
    >
      {children}
    </div>
  );
}
