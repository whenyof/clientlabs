"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TraitsSelectorProps {
 traits: string[]
 onChange: (traits: string[]) => void
}

const suggestedTraits = [
 "Cliente recurrente",
 "Compra rápido",
 "Sensible al precio",
 "Necesita seguimiento",
 "VIP inactivo",
 "Muy decidido",
 "Pregunta mucho",
 "Fiel a la marca"
]

export function TraitsSelector({ traits, onChange }: TraitsSelectorProps) {
 const [isEditing, setIsEditing] = useState(false)

 const toggleTrait = (trait: string) => {
 if (traits.includes(trait)) {
 onChange(traits.filter(t => t !== trait))
 } else {
 if (traits.length < 4) {
 onChange([...traits, trait])
 }
 }
 }

 return (
 <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
 <AnimatePresence mode="popLayout">
 {traits.map((trait) => (
 <motion.div
 key={trait}
 layout
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.8 }}
 >
 <Badge
 variant="secondary"
 className="bg-zinc-800/80 text-zinc-300 border-zinc-700/50 flex items-center gap-1.5 py-1 px-2.5 group hover:bg-zinc-700 transition-colors cursor-default"
 >
 <span className="text-[11px] font-medium leading-none">{trait}</span>
 {isEditing && (
 <button
 onClick={(e) => {
 e.stopPropagation()
 toggleTrait(trait)
 }}
 className="text-[var(--text-secondary)] hover:text-[var(--critical)] transition-colors"
 >
 <X className="h-3 w-3" />
 </button>
 )}
 </Badge>
 </motion.div>
 ))}
 </AnimatePresence>

 <div className="relative">
 <button
 onClick={(e) => {
 e.stopPropagation()
 setIsEditing(!isEditing)
 }}
 className={`flex items-center justify-center rounded-full transition-all duration-200 shadow-sm border ${isEditing
 ? "h-7 w-7 bg-zinc-800 border-zinc-700 text-zinc-300"
 : (traits.length === 0
 ? "px-3 py-1.5 bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-secondary)]"
 : "h-7 w-7 bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-secondary)]")
 }`}
 >
 {isEditing ? (
 <X className="h-3.5 w-3.5" />
 ) : (
 traits.length === 0 ? (
 <div className="flex items-center gap-1.5">
 <Plus className="h-3.5 w-3.5" />
 <span className="text-[11px] font-bold uppercase tracking-wider">Añadir Perfil</span>
 </div>
 ) : (
 <Pencil className="h-3 w-3" />
 )
 )}
 </button>

 <AnimatePresence>
 {isEditing && (
 <>
 <div className="fixed inset-0 z-40" onClick={() => setIsEditing(false)} />
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.15, ease: "easeOut" }}
 className="absolute left-0 mt-2 w-64 z-50 rounded-xl border border-[var(--border-subtle)] bg-zinc-900 overflow-hidden shadow-sm backdrop-"
 >
 <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
 <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Perfiles humanos</p>
 </div>
 <div className="p-1 max-h-64 overflow-y-auto">
 {suggestedTraits.map((trait) => {
 const isActive = traits.includes(trait)
 const isLimit = traits.length >= 4 && !isActive
 return (
 <button
 key={trait}
 disabled={isLimit}
 onClick={(e) => {
 e.stopPropagation()
 toggleTrait(trait)
 }}
 className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${isActive
 ? 'bg-[var(--bg-card)] text-[var(--accent)] font-semibold'
 : isLimit
 ? 'opacity-40 cursor-not-allowed text-zinc-500'
 : 'hover:bg-[var(--bg-card)] text-[var(--text-secondary)]'
 }`}
 >
 {trait}
 {isActive && <CheckIcon className="h-3.5 w-3.5" />}
 </button>
 )
 })}
 </div>
 {traits.length >= 4 && (
 <div className="p-2 bg-[var(--bg-card)] border-t border-[var(--border-subtle)]">
 <p className="text-[9px] text-[var(--text-secondary)] text-center font-medium">Máximo 4 perfiles permitidos</p>
 </div>
 )}
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>
 </div>
 )
}

function CheckIcon({ className }: { className?: string }) {
 return (
 <svg
 xmlns="http://www.w3.org/2000/svg"
 width="24"
 height="24"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth="3"
 strokeLinecap="round"
 strokeLinejoin="round"
 className={className}
 >
 <polyline points="20 6 9 17 4 12" />
 </svg>
 )
}
