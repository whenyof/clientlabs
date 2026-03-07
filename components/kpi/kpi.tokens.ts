export const KPI_VARIANTS = {
 income: {
 bg: " ",
 border: "border-[var(--accent)]",
 icon: "bg-[var(--accent-soft)] text-[var(--accent)]",
 },
 expense: {
 bg: " ",
 border: "border-[var(--critical)]",
 icon: "bg-[var(--bg-card)] text-[var(--critical)]",
 },
 profit: {
 bg: " ",
 border: "border-emerald-500/30",
 icon: "bg-emerald-500/20 text-emerald-300",
 },
 growth: {
 bg: " ",
 border: "border-sky-500/30",
 icon: "bg-sky-500/20 text-sky-300",
 },
 neutral: {
 bg: " ",
 border: "border-[var(--border-subtle)]",
 icon: "bg-[var(--bg-card)] text-[var(--text-primary)]",
 },
} as const
