import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { loadFinancePageData } from "./lib/server-data"
import { FinanceView } from "./FinanceView"

type PageProps = {
  searchParams: Promise<{ period?: string }>
}

export default async function FinancePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const { period = "month" } = await searchParams
  const initialData = await loadFinancePageData(session.user.id, period)

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full max-w-none">
      <FinanceView initialData={initialData} period={period} />
    </div>
  )
}
