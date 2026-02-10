import { redirect } from "next/navigation"

/**
 * Legacy route: redirect to canonical onboarding sector page.
 */
export default function SelectSectorPage() {
  redirect("/onboarding/sector")
}
