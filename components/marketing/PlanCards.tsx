"use client"

import { useState } from "react"
import Link from "next/link"
import { checkoutHref } from "@/lib/site-config"
import {
  ANNUAL_FREE_MONTHS,
  ANNUAL_SAVINGS_PCT,
  PLANS,
  annualEUR,
  effectiveMonthlyEUR,
  formatEUR,
} from "@/lib/pricing"
import { Check } from "./icons"

type Cycle = "monthly" | "annual"

export default function PlanCards() {
  const [cycle, setCycle] = useState<Cycle>("monthly")

  return (
    <>
      <div className="toggle-wrap">
        <div className="price-toggle" role="group" aria-label="Ciclo de facturación">
          <button
            type="button"
            className={cycle === "monthly" ? "on" : undefined}
            aria-pressed={cycle === "monthly"}
            onClick={() => setCycle("monthly")}
          >
            Mensual
          </button>
          <button
            type="button"
            className={cycle === "annual" ? "on" : undefined}
            aria-pressed={cycle === "annual"}
            onClick={() => setCycle("annual")}
          >
            Anual
            <span className="toggle-badge">−{ANNUAL_SAVINGS_PCT}%</span>
          </button>
        </div>
        <span className="toggle-hint">
          Ahorra <b>{ANNUAL_SAVINGS_PCT}%</b> con la facturación anual ({ANNUAL_FREE_MONTHS} meses gratis)
        </span>
      </div>

      <div className={`plans plans-${PLANS.length}`}>
        {PLANS.map((plan) => (
          <div className={`plan${plan.recommended ? " rec" : ""} reveal`} key={plan.key}>
            {plan.recommended && <span className="rec-tag">Recomendado</span>}
            <div className="pn">{plan.name}</div>

            <div className="plan-price">
              {cycle === "monthly" ? (
                <>
                  <b>{formatEUR(plan.monthlyEUR)}</b> <span className="per">/mes · IVA incl.</span>
                </>
              ) : (
                <>
                  <b>{formatEUR(annualEUR(plan))}</b> <span className="per">/año · IVA incl.</span>
                </>
              )}
            </div>
            {cycle === "annual" && (
              <div className="plan-sub">
                ~{formatEUR(effectiveMonthlyEUR(plan))}/mes · {ANNUAL_FREE_MONTHS} meses gratis
              </div>
            )}

            <div className="pd">{plan.tagline}</div>
            <ul className="pf">
              {plan.features.map((f) => (
                <li key={f}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>

            {plan.ctaType === "contact" ? (
              <Link href="/contacto" className="btn btn-ghost">
                {plan.ctaLabel}
              </Link>
            ) : (
              <Link
                href={checkoutHref(plan.stripePlan, cycle === "annual" ? "yearly" : "monthly")}
                className={`btn ${plan.recommended ? "btn-primary" : "btn-ghost"}`}
              >
                {plan.ctaLabel}
              </Link>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
