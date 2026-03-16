import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number, currency: string = "EUR") => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Compact format for tables: 20000 → "20k €" */
export function formatCurrencyCompact(value: number, currency: string = "EUR"): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M ${currency === "EUR" ? "€" : currency}`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k ${currency === "EUR" ? "€" : currency}`
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: currency || "EUR", maximumFractionDigits: 0 }).format(value)
}
