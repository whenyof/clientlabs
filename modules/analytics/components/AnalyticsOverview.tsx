"use client";

import { ExecutiveKpiCard } from "./ExecutiveKpiCard";
import { KPIRow } from "@/components/dashboard/KPIRow";
import { KPISection } from "@/components/dashboard/KPISection";
import type { KPIValue } from "@/modules/analytics/types/analytics.types";
import type { SecondaryMetrics } from "@/modules/analytics/actions/getAnalyticsDashboard";

interface AnalyticsOverviewProps {
 revenue: KPIValue;
 leads: KPIValue;
 conversions: KPIValue;
 averageTicket: KPIValue;
 secondary: SecondaryMetrics;
 loading?: boolean;
}

export function AnalyticsOverview({
 revenue,
 leads,
 conversions,
 averageTicket,
 secondary,
 loading = false,
}: AnalyticsOverviewProps) {
 // 1. Revenue Logic: Issued vs Paid
 const issuedRevenue = revenue.value;
 const paidRevenue = (issuedRevenue * secondary.paidRatio) / 100;

 // Sublabel color based on paidRatio
 const getPaidColor = (ratio: number) => {
 if (ratio < 25) return "red" as const;
 if (ratio < 50) return "amber" as const;
 return "emerald" as const;
 };

 return (
 <KPISection title="Resumen Ejecutivo" description="Métricas relacionales del periodo">
 <KPIRow columns={6} compact>
 {/* 1. Ingresos (Issued vs Paid) */}
 <ExecutiveKpiCard
 title="Ingresos Emitidos"
 value={issuedRevenue}
 prefix="€"
 variant="emerald"
 loading={loading}
 trendValue={revenue.changePercentage}
 subValue={`Cobrado: €${paidRevenue.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`}
 subValueColor={getPaidColor(secondary.paidRatio)}
 decimalPlaces={0}
 />

 {/* 2. Crecimiento */}
 <ExecutiveKpiCard
 title="Crecimiento"
 value={secondary.growth}
 suffix="%"
 variant="cyan"
 loading={loading}
 trendValue={secondary.growth}
 decimalPlaces={1}
 />

 {/* 3. Leads */}
 <ExecutiveKpiCard
 title="Leads Nuevos"
 value={leads.value}
 variant="indigo"
 loading={loading}
 trendValue={leads.changePercentage}
 decimalPlaces={0}
 />

 {/* 4. Conversión */}
 <ExecutiveKpiCard
 title="Conversión"
 value={conversions.value}
 suffix="%"
 variant="blue"
 loading={loading}
 trendValue={conversions.changePercentage}
 decimalPlaces={1}
 />

 {/* 5. Ticket Medio */}
 <ExecutiveKpiCard
 title="Ticket Medio"
 value={averageTicket.value}
 prefix="€"
 variant="teal"
 loading={loading}
 trendValue={averageTicket.changePercentage}
 subValue={averageTicket.value > 0 ? undefined : "Sin facturas pagadas"}
 subValueColor="neutral"
 decimalPlaces={0}
 />

 {/* 6. Automatización (Placeholder) */}
 <ExecutiveKpiCard
 title="% Automatizado"
 value={0}
 suffix="%"
 variant="violet"
 loading={loading}
 subValue="Próximamente"
 subValueColor="neutral"
 decimalPlaces={0}
 />
 </KPIRow>
 </KPISection>
 );
}
