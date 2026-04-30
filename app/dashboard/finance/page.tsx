import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { loadFinancePageData } from "@/app/dashboard/finance/lib/server-data"
import { FinanceView } from "@/app/dashboard/finance/FinanceView"
import { BillingView } from "@domains/billing"

type PageProps = {
  searchParams: Promise<{ period?: string; view?: string }>
}

export default async function FinancePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const { period = "month", view } = await searchParams
  const initialData = await loadFinancePageData(session.user.id, period)

  return (
    <FinanceView
      initialData={initialData}
      period={period}
      view={view}
      billingNode={<BillingView />}
      purchasesNode={null}
    />
  )
}
