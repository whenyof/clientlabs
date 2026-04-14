export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  )
}
