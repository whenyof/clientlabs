"use client"

import { useState } from "react"
import Link from "next/link"

import { pricingContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"
import { GridBackground } from "@/components/landing/utils"

async function startCheckout(plan: "STARTER" | "PRO" | "BUSINESS", period: "monthly" | "yearly") {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, period }),
  })
  if (res.status === 401) {
    window.location.href = `/register?plan=${plan.toLowerCase()}&period=${period}`
    return
  }
  const data = await res.json()
  if (data.url) window.location.href = data.url
}

export function Pricing() {
  const [annual, setAnnual] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  /* FAQ open index — null means all closed.
     Starts with 0 (first FAQ open) to match reference behaviour. */
  const [openIdx, setOpenIdx] = useState<number | null>(0)


  const {
    eyebrow,
    headline,
    sub,
    annualDiscount,
    toggleLabels,
    plans,
    faqsHeading,
    faqs,
  } = pricingContent

  return (
    <section
      id="Precios"
      className="relative overflow-hidden bg-navy pt-[70px] pb-[60px] text-white"
    >
      <GridBackground variant="dark" className="opacity-50" />

      <div className="relative z-10 mx-auto max-w-[1240px] px-7">

        {/* ── Header ── */}
        <div className="mx-auto max-w-[760px] text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
            {eyebrow}
          </span>
          <h2
            className="mt-3 mb-3 font-display font-extrabold leading-[1] tracking-[-0.04em]"
            style={{ fontSize: "clamp(36px,4vw,60px)" }}
          >
            {headline}
          </h2>
          <p className="text-[15px] leading-[1.5] text-[#a8b5bc]">{sub}</p>

          {/* ── Toggle — ref: .price-toggle ── */}
          <div className="mt-5 inline-flex items-center gap-1 rounded-full border border-line-dark-2 bg-white/[0.06] p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={[
                "rounded-full px-[18px] py-[10px] font-display text-[14px] font-semibold transition-all",
                !annual ? "bg-white text-navy" : "text-[#c6d0d6] hover:text-white",
              ].join(" ")}
            >
              {toggleLabels.monthly}
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={[
                "flex items-center gap-2 rounded-full px-[18px] py-[10px] font-display text-[14px] font-semibold transition-all",
                annual ? "bg-white text-navy" : "text-[#c6d0d6] hover:text-white",
              ].join(" ")}
            >
              {toggleLabels.annual}
              <span className="font-mono text-[10.5px] rounded-full bg-[#eaf6f0] px-2 py-[2px] text-emerald-ink">
                {annualDiscount}
              </span>
            </button>
          </div>
        </div>

        {/* ── Plans — ref: .plans-grid { grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 48px } ── */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const displayPrice = annual ? plan.yearly : plan.monthly
            const savings = Math.round((plan.monthly - plan.yearly) * 12)

            return (
              <div
                key={plan.name}
                style={{ borderRadius: 22 }}
                className={[
                  "relative flex flex-col p-[32px_28px_36px]",
                  plan.featured
                    ? "border-[1.5px] border-[rgba(31,169,122,.55)] bg-[#14384a] shadow-[0_20px_50px_rgba(31,169,122,.15)]"
                    : "border border-line-dark bg-navy-2",
                ].join(" ")}
              >
                {/* Featured badge — ref: .plan-badge */}
                {plan.featured && plan.featuredLabel && (
                  <div className="absolute -top-[14px] left-7 rounded-full bg-emerald px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.05em] text-white">
                    {plan.featuredLabel}
                  </div>
                )}

                {/* Name + tag */}
                <div className="font-display text-[20px] font-bold tracking-[-0.015em]">
                  {plan.name}
                </div>
                <div className="mt-1.5 text-[14px] text-[#a8b5bc]">{plan.tag}</div>

                {/* Price — ref: .plan-price */}
                <div className="mt-5 mb-2 flex items-baseline gap-1.5">
                  <span className="font-display text-[56px] font-black leading-[1] tracking-[-0.04em]">
                    {displayPrice.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€
                  </span>
                  <span className="text-[14px] text-[#a8b5bc]">
                    /mes{annual ? " · facturado anual" : ""}
                  </span>
                </div>

                {/* Savings */}
                {annual && (
                  <div className="mb-1 text-[13px] text-[#8fa0aa]">
                    Antes {plan.monthly.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€ · ahorras {savings}€/año
                  </div>
                )}

                {/* Features list */}
                <ul className="my-6 grid flex-1 gap-2.5">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-[14px] leading-[1.4] text-[#d9e1e5]"
                    >
                      <LandingIcons.check className="mt-[2px] h-4 w-4 shrink-0 text-emerald" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* Note */}
                {"note" in plan && (
                  <p className="mb-4 text-[12px] text-[#8fa0aa]">{plan.note as string}</p>
                )}

                {/* CTA */}
                <button
                  type="button"
                  disabled={loadingPlan !== null}
                  onClick={async () => {
                    const stripePlan = plan.name.toUpperCase() as "STARTER" | "PRO" | "BUSINESS"
                    const period = annual ? "yearly" : "monthly"
                    setLoadingPlan(plan.name)
                    try { await startCheckout(stripePlan, period) }
                    finally { setLoadingPlan(null) }
                  }}
                  className={[
                    "flex w-full items-center justify-center gap-2 rounded-full py-3 font-display text-[15px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60",
                    plan.featured
                      ? "bg-emerald text-white"
                      : "border border-line-dark text-[#c6d0d6] hover:bg-white/[0.06]",
                  ].join(" ")}
                >
                  {loadingPlan === plan.name ? "Cargando..." : plan.cta}
                  {loadingPlan !== plan.name && <LandingIcons.arrow className="h-4 w-4" />}
                </button>
              </div>
            )
          })}
        </div>

        {/* ── FAQ ─────────────────────────────────────────────────────────────
            ref: .faq { max-width: 780px; margin: 72px auto 0; border-top }
            ref: .faq-item { border-bottom }
            ref: .faq-q { padding: 22px 0; font-size: 17px; font-weight: 600 }
            ref: .faq-a { padding: 0 0 22px; font-size: 15px; color #a8b5bc }
            ref: .faq-tog { rotate 45deg + bg emerald when open }
            ────────────────────────────────────────────────────────────────── */}
        <div className="mx-auto mt-[72px] max-w-[780px] border-t border-line-dark">
          <h3 className="py-6 text-center font-display text-[22px] font-bold text-white">
            {faqsHeading}
          </h3>

          {faqs.map((faq, i) => {
            const isOpen = openIdx === i

            return (
              <div key={i} className="border-b border-line-dark">
                {/* Question button */}
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full items-center justify-between py-[22px] text-left font-display text-[17px] font-semibold leading-snug tracking-[-0.015em] text-white"
                >
                  <span className="pr-4">{faq[0]}</span>

                  {/* Toggle icon — ref: .faq-tog, .faq-item.open .faq-tog { rotate(45deg) bg-emerald } */}
                  <span
                    className={[
                      "ml-4 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[8px] border transition-all duration-200",
                      isOpen
                        ? "rotate-45 border-emerald bg-emerald text-white"
                        : "border-line-dark-2 bg-transparent text-[#a8b5bc]",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <LandingIcons.plus className="h-4 w-4" />
                  </span>
                </button>

                {/* Answer — animated with CSS grid-rows trick (most reliable cross-browser) */}
                <div
                  className={[
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  ].join(" ")}
                >
                  <div className="overflow-hidden">
                    <div className="pb-[22px] text-[15px] leading-[1.55] text-[#a8b5bc] max-w-[660px]">
                      {faq[1]}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
