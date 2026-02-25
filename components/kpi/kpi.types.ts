export type KpiVariant = "income" | "expense" | "profit" | "growth" | "neutral"

export type KpiSize = "sm" | "md" | "lg"

export interface KpiCardProps {
 title: string
 value: number | string
 variation?: number | null
 currency?: string
 variant?: KpiVariant
 size?: KpiSize
 loading?: boolean
}
