"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
  scale?: number
}

export function AnimatedCard({
  children,
  className = "",
  delay = 0,
  hover = true,
  scale = 1.02
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`bg-[var(--bg-main)] backdrop-blur-sm rounded-2xl border border-[var(--border-subtle)] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? {
        scale,
        y: -2,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      } : undefined}
    >
      {children}
    </motion.div>
  )
}