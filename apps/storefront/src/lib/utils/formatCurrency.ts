export function formatCurrency(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  return "Rp" + num.toLocaleString("id-ID");
}
