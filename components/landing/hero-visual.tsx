"use client"

import { motion } from "framer-motion"

import { heroContent } from "@/components/landing/content"

type ToolStyle = { [key: string]: string }

function parseTool(style: ToolStyle) {
  return {
    rot: parseFloat(style["--rot"] ?? "0"),
    ty: parseFloat(style["--ty"] ?? "0"),
    delay: parseFloat(style["animationDelay"] ?? "0"),
    pos: {
      top: style.top,
      ...(style.left ? { left: style.left } : {}),
      ...(style.right ? { right: style.right } : {}),
    } as React.CSSProperties,
  }
}

export function HeroVisual() {
  return (
    <div className="relative aspect-square w-full max-w-[520px] mx-auto lg:mx-0">
      {/* Rings */}
      {[0, 9, 22].map((inset, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-dashed border-white/[0.08]"
          style={{ inset: `${inset}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 + i * 0.15 }}
        />
      ))}

      {/* Core */}
      <motion.div
        className="absolute left-1/2 top-1/2 grid h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[26px] font-display text-[44px] font-black tracking-[-0.04em] text-white z-[3]"
        style={{
          background: "linear-gradient(140deg, #1FA97A, #128a62)",
          boxShadow:
            "0 20px 60px rgba(31,169,122,.4), inset 0 1px 0 rgba(255,255,255,.3)",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        CL
        {/* Outer ring on core */}
        <span className="pointer-events-none absolute inset-[-10px] rounded-[32px] border border-emerald/30" />
      </motion.div>

      {/* Tool chips */}
      {heroContent.tools.map((tool) => {
        const { rot, ty, delay, pos } = parseTool(tool.style as ToolStyle)

        return (
          <motion.div
            key={tool.name}
            className="absolute z-[2] flex items-center gap-2 rounded-[14px] bg-white px-3 py-2.5 font-display text-[13px] font-semibold text-ink shadow-[0_12px_30px_rgba(0,0,0,.25),0_1px_0_rgba(255,255,255,.6)_inset]"
            style={pos}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              y: [0, ty, 0],
              rotate: [rot, rot + 2, rot],
            }}
            transition={{
              opacity: { duration: 0.5, delay: delay + 0.4 },
              y: { repeat: Infinity, duration: 8, ease: "easeInOut", delay: delay + 0.9 },
              rotate: { repeat: Infinity, duration: 8, ease: "easeInOut", delay: delay + 0.9 },
            }}
          >
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-[6px] font-display text-[12px] font-black text-white"
              style={{ background: tool.color }}
            >
              {tool.name[0]}
            </span>
            {tool.name}
          </motion.div>
        )
      })}
    </div>
  )
}
