"use client"

import { footerContent } from "@/components/landing/content"

export function NewsletterForm() {
  return (
    <form
      className="flex max-w-[320px] items-center rounded-full border border-line-dark-2 bg-white/[0.04] px-4 py-1"
      onSubmit={(e) => e.preventDefault()} // TODO: wire up in later phase
    >
      <input
        type="email"
        placeholder={footerContent.newsletter.placeholder}
        className="flex-1 bg-transparent py-2 font-body text-sm text-white outline-none placeholder:text-[#8fa0aa]"
      />
      <button
        type="submit"
        className="rounded-full bg-emerald px-3.5 py-2 font-display text-[13px] font-semibold text-white transition-colors hover:bg-emerald-2"
      >
        {footerContent.newsletter.cta}
      </button>
    </form>
  )
}
