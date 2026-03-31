"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem("cl-cookies-accepted")
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem("cl-cookies-accepted", "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-[13px] text-slate-700 leading-relaxed">
            Usamos cookies técnicas necesarias para el funcionamiento de la web. Sin cookies de publicidad ni rastreo.{" "}
            <Link href="/cookies" className="text-[#1FA97A] hover:underline font-medium">
              Más información
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={accept}
            className="px-5 py-2.5 bg-[#1FA97A] text-white text-[12px] font-semibold rounded-xl hover:bg-[#178f68] transition-colors whitespace-nowrap"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
