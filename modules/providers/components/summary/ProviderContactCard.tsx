"use client"

import { Mail, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProviderContactCardProps = {
  isLight: boolean
  contactEmail?: string | null
  contactPhone?: string | null
}

export function ProviderContactCard({
  isLight,
  contactEmail,
  contactPhone,
}: ProviderContactCardProps) {
  if (!contactEmail && !contactPhone) return null

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5",
        isLight
          ? "bg-white border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          : "bg-white/[0.02] border-white/[0.06]"
      )}
    >
      <p
        className={cn(
          "text-[10px] font-medium uppercase tracking-wider mb-1.5",
          isLight ? "text-neutral-400" : "text-white/40"
        )}
      >
        Contacto
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            className={cn(
              "flex items-center gap-1.5 text-[11px] transition-colors truncate max-w-full",
              isLight ? "text-neutral-600 hover:text-emerald-600" : "text-white/50 hover:text-blue-400"
            )}
          >
            <Mail className="h-3 w-3 shrink-0" />{" "}
            <span className="truncate">{contactEmail}</span>
          </a>
        )}
        {contactPhone && (
          <a
            href={`tel:${contactPhone}`}
            className={cn(
              "flex items-center gap-1.5 text-[11px] transition-colors",
              isLight ? "text-neutral-600 hover:text-emerald-600" : "text-white/50 hover:text-blue-400"
            )}
          >
            <Phone className="h-3 w-3 shrink-0" /> {contactPhone}
          </a>
        )}
      </div>
    </div>
  )
}
