import { useSectorConfig } from "@/hooks/useSectorConfig"

/**
 * Hook for sales-related labels and feature flags.
 * Use useSectorConfig() and labels.sales / features.sales when you need more than labels.
 */
export function useSales() {
  const { labels, features } = useSectorConfig()
  return {
    labels: labels.sales,
    features: features?.modules?.sales ?? true,
    paymentStatus: labels.sales.paymentStatus ?? {},
  }
}
