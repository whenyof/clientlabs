import { FinanceHubTabs } from "@/app/dashboard/other/finance/components/FinanceNavTabs"

/**
 * Finance module layout at /dashboard/finance.
 * Reuses the full-bleed layout from the legacy finance route.
 * Hub tabs shown on all finance routes (overview, movements, billing, etc.).
 */
export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="
        flex flex-col flex-1 min-h-0 h-full max-w-none overflow-hidden
        -mx-6 -my-6 lg:-mx-8 lg:-my-6 xl:-mx-10
        w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] xl:w-[calc(100%+5rem)]
      "
    >
      <div className="shrink-0 px-4 pt-5 pb-3">
        <FinanceHubTabs />
      </div>
      <div className="flex-1 min-h-0 w-full px-4 pb-10 overflow-auto">
        {children}
      </div>
    </div>
  )
}

