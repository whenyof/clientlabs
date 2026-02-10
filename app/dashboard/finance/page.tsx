import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { loadFinancePageData } from "@/app/dashboard/other/finance/lib/server-data"
import { FinanceView } from "@/app/dashboard/other/finance/FinanceView"
import { FinanceHubTabs } from "@/app/dashboard/other/finance/components/FinanceNavTabs"
import SalesPage from "@/app/dashboard/other/sales/page"
import BillingPage from "@/app/dashboard/other/billing/page"
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
      content = <SalesPage />
      break
    case "purchases":
      content = <PurchasesPage />
      break
    case "billing":
      content = <BillingPage />
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

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full max-w-none">
      {/* Hub-level tabs (Finance as the financial brain) */}
      <div className="shrink-0 px-4 pt-5 pb-3">
        <FinanceHubTabs period={period} />
      </div>

      {/* Active tab content */}
      <div className="flex-1 min-h-0 w-full px-4 pb-10">{content}</div>
    </div>
  )
}


