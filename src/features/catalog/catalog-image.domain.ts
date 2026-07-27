const supportedImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const maxImageBytes = 5 * 1024 * 1024;

export function validateCatalogImage(input: { type: string; size: number; alt: string }) {
  if (!supportedImageTypes.includes(input.type as (typeof supportedImageTypes)[number])) {
    throw new Error("Usá JPG, PNG o WebP.");
  }
  if (!Number.isInteger(input.size) || input.size <= 0 || input.size > maxImageBytes) {
    throw new Error("La imagen debe pesar entre 1 byte y 5 MB.");
  }
  const alt = input.alt.trim();
  if (alt.length < 3 || alt.length > 160) {
    throw new Error("El texto alternativo debe tener entre 3 y 160 caracteres.");
  }
  return { ...input, alt };
}
