/** Colapsa quebras e espaços entre tags para enviar o SVG em uma única linha. */
export function inlineSvg(raw: string): string {
  const joined = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
  return joined.replace(/>\s+</g, "><").trim();
}
