"use client"

import { motion } from "framer-motion"
import { useState, ReactNode } from "react"
import Login from "./Login"
import Register from "./Register"

export default function AuthFlip() {
  const [side, setSide] = useState<"login" | "register">("login")

  return (
    <div className="relative w-full max-w-md perspective">

      <motion.div
        className="relative w-full preserve-3d min-h-[520px]"
        animate={{
          rotateY: side === "login" ? 0 : 180,
          scale: side === "login" ? 1 : 1.015
        }}
        transition={{
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1]
        }}
      >

        {/* LOGIN */}
        <div className="absolute w-full backface-hidden">
          <motion.div
            animate={{
              y: side === "login" ? -30 : 20,
              opacity: side === "login" ? 1 : 0
            }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <AuthCard>
              <Login onSwitch={() => setSide("register")} />
            </AuthCard>
          </motion.div>
        </div>

        {/* REGISTER */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden flex">
          <motion.div
            animate={{
              y: side === "register" ? -30 : 20,
              opacity: side === "register" ? 1 : 0
            }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <AuthCard>
              <Register onSwitch={() => setSide("login")} />
            </AuthCard>
          </motion.div>
        </div>

      </motion.div>
    </div>
  )
}

function AuthCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="
        w-full
        rounded-3xl
        border border-white/10
        bg-white/5
        backdrop-blur-xl
        shadow-2xl
        p-8
      "
    >
      {children}
    </motion.div>
  )
}