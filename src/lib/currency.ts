export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Normalizes currency input: replaces comma with dot, allows only digits and one decimal point,
 * limits to 2 decimal places. Returns null if input exceeds 2 decimal places.
 */
export function normalizeCurrencyInput(value: string): string | null {
  const normalized = value.replace(",", ".");
  const cleaned = normalized.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  const formatted = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
  if (parts.length === 2 && parts[1].length > 2) return null;
  return formatted;
}

