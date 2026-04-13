import { redirect } from "next/navigation"

// /dashboard/finance/trimestres → /dashboard/finance/trimestral
export default function TrimestresPage() {
  redirect("/dashboard/finance/trimestral")
}
