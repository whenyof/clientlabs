import { clsx } from "clsx"
import { ReactNode } from "react"

interface DashboardLayoutProps {
 children: ReactNode
 className?: string
 fullWidth?: boolean
 compact?: boolean
}

export function DashboardLayout({
 children,
 className,
 fullWidth = false,
 compact = false,
}: DashboardLayoutProps) {
 return (
 <div
 className={clsx(
 "mx-auto w-full animate-in fade-in zoom-in-95 duration-300",
 fullWidth ? "max-w-full" : "max-w-[1400px]",
 compact ? "px-4 py-4" : "px-4 md:px-8 py-8",
 className
 )}
 >
 {children}
 </div>
 )
}
