import { FinanceSidebar } from "./components/FinanceSidebar"

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 min-h-0 h-full w-full">
      {/* Left sidebar — finance navigation */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-[var(--border-subtle)] py-4 px-3 bg-[var(--bg-card)]">
        <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest px-3 mb-2">
          Facturación
        </p>
        <FinanceSidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
