import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { loadFinancePageData } from "@/app/dashboard/finance/lib/server-data"
import { FinanceView } from "@/app/dashboard/finance/FinanceView"
import { BillingView } from "@domains/billing"

type PageProps = {
  searchParams: Promise<{ period?: string; view?: string; tab?: string }>
}

async function FinancePageInner({ searchParams }: PageProps) {
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

export default function FinancePage(props: PageProps) {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: "#737373" }}>Cargando…</div>}>
      <FinancePageInner {...props} />
    </Suspense>
  )
}
