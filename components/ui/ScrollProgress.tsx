"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/") return
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight

      const scrolled = (scrollTop / docHeight) * 100
      setProgress(scrolled || 0)
    }

    window.addEventListener("scroll", update)
    update()

    return () => window.removeEventListener("scroll", update)
  }, [pathname]) // ← se reinicia por página

  if (pathname === "/") return null

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[60] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}