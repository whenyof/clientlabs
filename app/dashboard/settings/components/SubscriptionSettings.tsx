"use client"

import { PlansSection } from "./PlansSection"
import { BillingHistory } from "./BillingHistory"

export function SubscriptionSettings() {
  return (
    <div className="space-y-8">
      <PlansSection />
      <BillingHistory />
    </div>
  )
}
