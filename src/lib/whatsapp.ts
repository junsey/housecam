export function getWhatsappHref(number: string, message: string) {
  const normalized = number.replace(/\D/g, "");
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
