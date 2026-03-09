"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@shared/utils/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  width?: "default" | "wide" | "narrow" | "ultraWide"
}

export function Modal({ isOpen, onClose, children, width = "default" }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = "hidden"

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.body.style.overflow = originalStyle
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!mounted) return null

  const widthClasses = {
    narrow: "max-w-3xl",
    default: "max-w-5xl",
    wide: "max-w-7xl",
    ultraWide: "max-w-[1650px] w-[96vw]",
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Overlay: Fixed backdrop with global coverage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Box: Centered precisely in viewport */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className={cn(
              "relative w-full min-h-0 bg-white rounded-[2rem] shadow-2xl z-10",
              widthClasses[width],
              "my-8 mx-auto"
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button: Institutional Placement */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 z-50 rounded-full bg-slate-100/50 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all active:scale-90"
              aria-label="Cerrar modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar rounded-[2rem]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

