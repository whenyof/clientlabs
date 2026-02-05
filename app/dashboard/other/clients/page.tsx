import { redirect } from "next/navigation"

/**
 * Legacy route - redirects to canonical /dashboard/clients
 * DO NOT add logic here - all functionality is in /dashboard/clients
 */
export default function LegacyClientsPage() {
  redirect("/dashboard/clients")
}
