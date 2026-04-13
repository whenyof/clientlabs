import { FinanceTopNav } from "./components/FinanceTopNav"

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full w-full">
      <FinanceTopNav />
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
