"use client"

interface BillingTabsProps {
  selectedTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "all", label: "Todas", status: null },
  { id: "draft", label: "Borrador", status: "draft" },
  { id: "issued", label: "Emitidas", status: "issued" },
  { id: "sent", label: "Enviadas", status: "sent" },
  { id: "paid", label: "Pagadas", status: "paid" },
  { id: "overdue", label: "Vencidas", status: "overdue" },
  { id: "cancelled", label: "Canceladas", status: "cancelled" }
]

/** No Invoice model in DB — tab counts are 0. */
export function BillingTabs({ selectedTab, onTabChange }: BillingTabsProps) {
  const getTabCount = (_status: string | null) => 0

  return (
    <div className="flex flex-wrap gap-2 p-1 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50">
      {tabs.map((tab) => {
        const isActive = selectedTab === tab.id
        const count = getTabCount(tab.status)

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
              isActive
                ? "text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <span className="relative z-10">
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}>
                {count}
              </span>
            </span>

            {/* Active tab background effect */}
            {isActive && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl" />
            )}
          </button>
        )
      })}
    </div>
  )
}