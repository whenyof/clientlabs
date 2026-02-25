import { clsx } from "clsx"
import { ReactNode } from "react"

interface KPIRowProps {
 children: ReactNode
 compact?: boolean
 columns?: 1 | 2 | 3 | 4 | 5 | 6
 className?: string
}

export function KPIRow({
 children,
 compact = false,
 columns = 4,
 className,
}: KPIRowProps) {
 const mobileCols = compact ? "grid-cols-2" : "grid-cols-1"

 const tabletMap: Record<number, string> = {
 1: "md:grid-cols-1",
 2: "md:grid-cols-1",
 3: "md:grid-cols-2",
 4: "md:grid-cols-2",
 5: "md:grid-cols-3",
 6: "md:grid-cols-3",
 }

 const desktopMap: Record<number, string> = {
 1: "lg:grid-cols-1",
 2: "lg:grid-cols-2",
 3: "lg:grid-cols-3",
 4: "lg:grid-cols-4",
 5: "lg:grid-cols-5",
 6: "lg:grid-cols-6",
 }

 return (
 <div
 className={clsx(
 "grid w-full",
 compact ? "gap-3" : "gap-4",
 mobileCols,
 tabletMap[columns],
 desktopMap[columns],
 className
 )}
 >
 {children}
 </div>
 )
}
