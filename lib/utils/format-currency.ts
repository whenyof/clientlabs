export function formatCurrency(amount: number, currency?: string): string {
  const cur =
    currency ??
    (typeof window !== "undefined"
      ? localStorage.getItem("cl_currency") ?? "EUR"
      : "EUR")

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
  }).format(amount)
}
