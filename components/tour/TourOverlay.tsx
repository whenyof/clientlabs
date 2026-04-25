"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, ChevronLeft, ChevronRight, Check, Lightbulb, MousePointerClick } from "lucide-react"
import { useTour, TOUR_STEPS } from "./TourContext"
import { motion, AnimatePresence } from "framer-motion"

export function TourOverlay() {
  const router = useRouter()
  const { active, step, total, currentStep, next, prev, stop } = useTour()

  // Navigate to step 0 only when the tour first activates
  useEffect(() => {
    if (active) router.push(TOUR_STEPS[0].href)
  }, [active]) // eslint-disable-line

  if (!active) return null

  const StepIcon = currentStep.icon
  const isFirst  = step === 0
  const isLast   = step === total - 1
  const nextStep = TOUR_STEPS[step + 1]
  const prevStep = TOUR_STEPS[step - 1]

  function handleNext() {
    if (isLast) {
      stop()
    } else {
      router.push(TOUR_STEPS[step + 1].href) // navigate first — instant
      next()                                   // then update step state
    }
  }

  function handlePrev() {
    router.push(TOUR_STEPS[step - 1].href)
    prev()
  }

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={`tour-card-${step}`}
          initial={{ opacity: 0, x: 24, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 16, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 right-5 z-[200] w-[340px] bg-white rounded-2xl border border-slate-200 overflow-hidden pointer-events-auto"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(31,169,122,0.08)" }}
        >
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#1FA97A] to-[#178a64]" />

          {/* Header */}
          <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1FA97A]/10 border border-[#1FA97A]/15 flex items-center justify-center shrink-0">
                <StepIcon size={17} className="text-[#1FA97A]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#1FA97A] uppercase tracking-widest leading-none mb-0.5">
                  {step + 1} / {total}
                </p>
                <h3 className="text-[15px] font-bold text-[#0B1F2A] leading-tight">{currentStep.title}</h3>
              </div>
            </div>
            <button
              onClick={stop}
              className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 mt-0.5 p-1"
              title="Saltar tour"
            >
              <X size={15} />
            </button>
          </div>

          {/* Description */}
          <div className="px-5 pb-3">
            <p className="text-[12.5px] text-slate-500 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Tips */}
          {currentStep.tips.length > 0 && (
            <div className="mx-5 mb-4 bg-[#F8FAFC] rounded-xl border border-slate-100 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb size={11} className="text-[#1FA97A]" />
                <span className="text-[9.5px] font-bold text-[#1FA97A] uppercase tracking-widest">Tips</span>
              </div>
              {currentStep.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#1FA97A] mt-[5px] shrink-0" />
                  <span className="text-[11.5px] text-slate-500 leading-snug">{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Next section preview */}
          {!isLast && nextStep && (
            <div className="mx-5 mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <MousePointerClick size={13} className="text-slate-400 shrink-0" />
              <span className="text-[11.5px] text-slate-400">
                Siguiente: <span className="font-semibold text-slate-600">{nextStep.title}</span>
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 pb-4 flex items-center justify-between">
            {/* Dot indicators */}
            <div className="flex items-center gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-200 ${
                    i === step  ? "w-5 h-1.5 bg-[#1FA97A]"
                    : i < step  ? "w-1.5 h-1.5 bg-[#1FA97A]/35"
                    : "w-1.5 h-1.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <ChevronLeft size={13} />
                  Atrás
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
                    ¡Listo!
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
