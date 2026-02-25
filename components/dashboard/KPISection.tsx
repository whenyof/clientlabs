import { clsx } from "clsx"
import { ReactNode } from "react"

interface KPISectionProps {
 title: string
 description?: string
 actions?: ReactNode
 children: ReactNode
 compact?: boolean
 divider?: boolean
 className?: string
}

export function KPISection({
 title,
 description,
 actions,
 children,
 compact = false,
 divider = false,
 className,
}: KPISectionProps) {
 return (
 <section
 className={clsx(
 "flex w-full flex-col",
 compact ? "gap-3 py-3" : "gap-4 py-6",
 divider && "border-t border-[var(--border-subtle)]",
 className
 )}
 >
 <div className="flex items-start justify-between gap-4">
 <div className="flex flex-col gap-0.5">
 <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
 {title}
 </h3>
 {description && (
 <p className="text-sm text-[var(--text-secondary)]">
 {description}
 </p>
 )}
 </div>
 {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
 </div>

 <div className="w-full">
 {children}
 </div>
 </section>
 )
}
