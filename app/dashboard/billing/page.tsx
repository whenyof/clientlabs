import { redirect } from "next/navigation"

export default function LegacyBillingRedirect() {
  redirect("/dashboard/finance/billing")
}

