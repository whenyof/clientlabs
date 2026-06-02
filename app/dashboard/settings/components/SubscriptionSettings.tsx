"use client"

import { PlansSection } from "./PlansSection"
import { BillingHistory } from "./BillingHistory"
import { UsageLimits } from "./UsageLimits"

export function SubscriptionSettings() {
  return (
    <div className="space-y-8">
      <PlansSection />
      <BillingHistory />
      <div className="space-y-3">
        <h3 className="text-[15px] font-semibold text-slate-900">Uso actual del plan</h3>
        <UsageLimits />
      </div>
    </div>
  )
}
