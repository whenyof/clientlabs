import { LucideIcon, AlertTriangle, Zap, ShieldCheck, CheckCircle2, Info } from "lucide-react";

export type SeverityLevel = "CRITICAL" | "ATTENTION" | "LOW" | "POSITIVE";

export interface SeverityStyle {
 border: string;
 badge: string;
 icon: LucideIcon;
 iconColor: string;
 textSecondary: string;
 titleWeight: string;
 descWeight: string;
 impactWeight: string;
}

export function getSeverityStyle(level: SeverityLevel | string): SeverityStyle {
 switch (level) {
 case "CRITICAL":
 return {
 border: "border-l-red-500",
 badge: "bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)]",
 icon: AlertTriangle,
 iconColor: "text-[var(--critical)]",
 textSecondary: "text-[var(--critical)]",
 titleWeight: "font-semibold",
 descWeight: "font-normal",
 impactWeight: "font-bold"
 };
 case "ATTENTION":
 case "WARNING":
 return {
 border: "border-l-amber-500",
 badge: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
 icon: AlertTriangle,
 iconColor: "text-[var(--text-secondary)]",
 textSecondary: "text-[var(--text-secondary)]",
 titleWeight: "font-medium",
 descWeight: "font-normal",
 impactWeight: "font-semibold"
 };
 case "LOW":
 case "INFO":
 return {
 border: "border-l-blue-500",
 badge: "bg-[var(--bg-card)] text-[var(--accent)] border-blue-500/10",
 icon: Info,
 iconColor: "text-[var(--accent)]",
 textSecondary: "text-[var(--text-secondary)]",
 titleWeight: "font-light",
 descWeight: "font-light",
 impactWeight: "font-medium"
 };
 case "POSITIVE":
 case "HEALTHY":
 return {
 border: "border-l-emerald-500",
 badge: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]",
 icon: ShieldCheck,
 iconColor: "text-[var(--accent)]",
 textSecondary: "text-[var(--accent)]",
 titleWeight: "font-medium",
 descWeight: "font-normal",
 impactWeight: "font-bold"
 };
 default:
 return {
 border: "border-l-white/10",
 badge: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
 icon: Zap,
 iconColor: "text-[var(--text-secondary)]",
 textSecondary: "text-[var(--text-secondary)]",
 titleWeight: "font-normal",
 descWeight: "font-normal",
 impactWeight: "font-normal"
 };
 }
}

export function mapScoreToSeverityLevel(score: number): SeverityLevel {
 if (score < 40) return "CRITICAL";
 if (score <= 65) return "ATTENTION";
 if (score <= 85) return "LOW";
 return "POSITIVE";
}
