import { redirect } from "next/navigation"

/**
 * Legacy route - redirects to canonical /dashboard/providers
 * DO NOT add logic here - all functionality is in /dashboard/providers
 */
export default function LegacyProvidersPage() {
  redirect("/dashboard/providers")
}
