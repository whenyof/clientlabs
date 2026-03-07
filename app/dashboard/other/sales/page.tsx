import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { SalesView } from "@/modules/sales/components/SalesView"
import { listSales } from "@/modules/sales/actions"
import { getSectorConfigByPath } from "@/config/sectors"

export default async function SalesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth")
  }

  const config = getSectorConfigByPath("/dashboard/other/sales")
  const { labels } = config
  const sl = labels.sales

  const initialSales = await listSales()

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white tracking-tight truncate">
            {sl.title}
          </h1>
          <p className="text-sm text-white/60 mt-0.5 truncate max-w-xl">
            {sl.pageSubtitle}
          </p>
        </div>
      </div>

      <SalesView initialSales={initialSales as any} />
    </div>
  )
}
