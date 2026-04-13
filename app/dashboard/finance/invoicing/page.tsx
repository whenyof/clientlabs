import { redirect } from "next/navigation"

// /dashboard/finance/invoicing → /dashboard/finance/facturas
export default function InvoicingRootPage() {
  redirect("/dashboard/finance/facturas")
}
