"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react"

type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

interface RiskLevelSelectorProps {
    currentLevel: RiskLevel | string
    onChange: (level: RiskLevel) => void
}

const levels = [
    { id: "LOW", label: "Buen momento", icon: CheckCircle2, color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20", emoji: "🟢" },
    { id: "MEDIUM", label: "Sin contacto", icon: AlertTriangle, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", emoji: "🟠" },
    { id: "HIGH", label: "Riesgo perderlo", icon: AlertCircle, color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/20", emoji: "🔴" },
]

export function RiskLevelSelector({ currentLevel, onChange }: RiskLevelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const activeLevel = levels.find(l => l.id === currentLevel) || levels[0]

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm font-medium ${activeLevel.bgColor} ${activeLevel.borderColor}`}
            >
                <span className="text-base leading-none">{activeLevel.emoji}</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${activeLevel.color}`}>
                    {activeLevel.label}
                </span>
                <ChevronDown className={`h-3 w-3 ${activeLevel.color} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute left-0 mt-2 w-52 z-50 rounded-xl border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl backdrop-blur-xl"
                        >
                            <div className="p-1">
                                {levels.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onChange(level.id as RiskLevel)
                                            setIsOpen(false)
                                        }}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5 ${currentLevel === level.id ? 'bg-white/10' : ''}`}
                                    >
                                        <span className="text-lg">{level.emoji}</span>
                                        <span className={`text-sm font-semibold ${level.color}`}>
                                            {level.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
