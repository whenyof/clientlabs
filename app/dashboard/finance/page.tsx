import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { loadFinancePageData } from "@/app/dashboard/other/finance/lib/server-data"
import { FinanceView } from "@/app/dashboard/other/finance/FinanceView"
import SalesPage from "@/app/dashboard/other/sales/page"
import { BillingView } from "@/modules/billing/components"
import PurchasesPage from "./purchases/page"

type PageSearchParams = {
  period?: string
  view?: string
}

type PageProps = {
  searchParams: Promise<PageSearchParams>
}

export default async function FinancePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const { period = "month", view } = await searchParams

  const isFinanceView =
    !view ||
    view === "overview" ||
    view === "transactions" ||
    view === "alerts" ||
    view === "automation"
  const initialData = isFinanceView
    ? await loadFinancePageData(session.user.id, period)
    : null

  let content: React.ReactNode

  switch (view) {
    case "income":
    case "sales":
      content = <SalesPage />
      break
    case "purchases":
      content = <PurchasesPage />
      break
    case "billing":
      content = <BillingView />
      break
    case "transactions":
    case "alerts":
    case "automation":
    case "overview":
    default:
      content =
        initialData != null ? (
          <FinanceView initialData={initialData} period={period} view={view} />
        ) : null
      break
  }

  return <>{content}</>
}


