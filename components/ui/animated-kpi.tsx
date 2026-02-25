"use client"

import { ReactNode, useEffect, useState } from "react"
import { motion } from "framer-motion"

type AnimatedKPIProps = {
 icon: ReactNode
 iconBg: string
 value: string | number
 label: string
 delay?: number
 isActive?: boolean
}

export function AnimatedKPI({
 icon,
 iconBg,
 value,
 label,
 delay = 0,
 isActive = false
}: AnimatedKPIProps) {
 const [prevValue, setPrevValue] = useState(value)
 const [isHighlighted, setIsHighlighted] = useState(false)

 useEffect(() => {
 if (prevValue !== value) {
 setIsHighlighted(true)
 const timer = setTimeout(() => setIsHighlighted(false), 300)
 setPrevValue(value)
 return () => clearTimeout(timer)
 }
 }, [value, prevValue])

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{
 duration: 0.3,
 delay,
 ease: [0.25, 0.1, 0.25, 1] // Custom easing for smooth feel
 }}
 className={`
 rounded-xl border bg-[var(--bg-card)] backdrop-blur p-6
 transition-all duration-300 ease-out
 hover:bg-[var(--bg-card)]/[0.08] hover:shadow-sm hover:-translate-y-0.5
 ${isActive ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-[var(--border-subtle)]'}
 ${isHighlighted ? 'ring-2 ring-emerald-500/30 border-[var(--accent)]' : ''}
 `}
 style={{
 transform: 'translateZ(0)', // Force GPU acceleration
 }}
 >
 <div className="flex items-center gap-4">
 <motion.div
 className={`p-3 rounded-lg ${iconBg}`}
 whileHover={{ scale: 1.05, rotate: 2 }}
 transition={{ duration: 0.2 }}
 >
 {icon}
 </motion.div>
 <div>
 <motion.div
 className="text-2xl font-bold text-[var(--text-primary)] mb-1"
 animate={isHighlighted ? {
 scale: [1, 1.05, 1],
 color: ['#ffffff', '#10b981', '#ffffff']
 } : {}}
 transition={{ duration: 0.3 }}
 >
 {value}
 </motion.div>
 <div className="text-sm text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-secondary)]">
 {label}
 </div>
 </div>
 </div>
 </motion.div>
 )
}
