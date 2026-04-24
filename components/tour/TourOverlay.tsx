"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, ChevronLeft, ChevronRight, Check, Lightbulb } from "lucide-react"
import { useTour, TOUR_STEPS } from "./TourContext"
import { motion, AnimatePresence } from "framer-motion"

export function TourOverlay() {
  const router = useRouter()
  const { active, step, total, currentStep, next, prev, stop } = useTour()

  // Navigate to the section for this step
  useEffect(() => {
    if (!active) return
    router.push(currentStep.href)
  }, [active, step]) // eslint-disable-line

  if (!active) return null

  const StepIcon = currentStep.icon
  const isFirst = step === 0
  const isLast  = step === total - 1

  function handleNext() {
    if (isLast) {
      stop()
    } else {
      next()
    }
  }

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Dim overlay — click to dismiss */}
          <motion.div
            key="tour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={stop}
            className="fixed inset-0 z-[90] bg-black/20 pointer-events-auto"
          />

          {/* Tour card — fixed bottom-right */}
          <motion.div
            key={`tour-card-${step}`}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-[100] w-[360px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1FA97A]/10 border border-[#1FA97A]/20 flex items-center justify-center shrink-0">
                    <StepIcon size={18} className="text-[#1FA97A]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#1FA97A] uppercase tracking-widest">{currentStep.subtitle}</p>
                    <h3 className="text-[15px] font-bold text-[#0B1F2A] leading-tight">{currentStep.title}</h3>
                  </div>
                </div>
                <button
                  onClick={stop}
                  className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 mt-0.5"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {currentStep.description}
              </p>

              {/* Tips */}
              {currentStep.tips.length > 0 && (
                <div className="bg-[#F8FAFC] rounded-xl border border-slate-100 p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb size={12} className="text-[#1FA97A]" />
                    <span className="text-[10px] font-semibold text-[#1FA97A] uppercase tracking-widest">Tips</span>
                  </div>
                  {currentStep.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1FA97A] mt-1.5 shrink-0" />
                      <span className="text-[12px] text-slate-500 leading-snug">{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex items-center justify-between">
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-200 ${
                      i === step
                        ? "w-4 h-1.5 bg-[#1FA97A]"
                        : i < step
                        ? "w-1.5 h-1.5 bg-[#1FA97A]/40"
                        : "w-1.5 h-1.5 bg-slate-200"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    onClick={prev}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <ChevronLeft size={14} />
                    Anterior
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-[.98]"
                  style={{ background: "linear-gradient(135deg, #1FA97A 0%, #178a64 100%)" }}
                >
                  {isLast ? (
                    <>
                      <Check size={13} strokeWidth={3} />
                      Finalizar
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-slate-100">
              <motion.div
                className="h-full bg-[#1FA97A]"
                animate={{ width: `${((step + 1) / total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
