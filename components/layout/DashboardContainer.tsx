"use client"

import { ReactNode } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

interface DashboardContainerProps {
 children: ReactNode
 /** Use "compact" for pages that need above-the-fold content (e.g. Finance Overview). */
 variant?: "default" | "compact"
}

export function DashboardContainer({ children, variant = "default" }: DashboardContainerProps) {
 return (
 <DashboardLayout compact={variant === "compact"}>
 {children}
 </DashboardLayout>
 )
}