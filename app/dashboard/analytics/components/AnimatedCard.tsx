"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  bg-emerald-600?: boolean
  scale?: number
}

export function AnimatedCard({
  children,
  className = "",
  delay = 0,
  bg-emerald-600 = true,
  scale = 1.02
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      whileHover={bg-emerald-600 ? {
        scale,
        y: -2,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      } : undefined}
    >
      {children}
    </motion.div>
  )
}