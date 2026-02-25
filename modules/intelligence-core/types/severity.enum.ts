export enum BusinessSeverity {
 HEALTHY = "HEALTHY",
 ATTENTION = "ATTENTION",
 RISK = "RISK",
 CRITICAL = "CRITICAL",
}

export function mapScoreToSeverity(score: number): BusinessSeverity {
 if (score >= 85) return BusinessSeverity.HEALTHY;
 if (score >= 65) return BusinessSeverity.ATTENTION; // Note: Switching order to be consistent with score value
 if (score >= 40) return BusinessSeverity.RISK;
 return BusinessSeverity.CRITICAL;
}

export const SEVERITY_METADATA = {
 [BusinessSeverity.HEALTHY]: {
 label: "Estado Óptimo",
 color: "text-[var(--accent)]",
 bg: "bg-[var(--bg-main)]",
 border: "border-[var(--accent)]",
 dot: "bg-[var(--accent-soft)]",
 },
 [BusinessSeverity.ATTENTION]: {
 label: "Estable / En Mejora",
 color: "text-[var(--accent)]",
 bg: "bg-[var(--bg-main)]",
 border: "border-blue-500/20",
 dot: "bg-blue-500",
 },
 [BusinessSeverity.RISK]: {
 label: "Atención Necesaria",
 color: "text-[var(--text-secondary)]",
 bg: "bg-[var(--bg-main)]",
 border: "border-[var(--border-subtle)]",
 dot: "bg-[var(--bg-card)]",
 },
 [BusinessSeverity.CRITICAL]: {
 label: "Riesgo Crítico",
 color: "text-[var(--critical)]",
 bg: "bg-[var(--bg-main)]",
 border: "border-[var(--critical)]",
 dot: "bg-[var(--bg-card)]",
 },
};
