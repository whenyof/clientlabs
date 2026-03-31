export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full w-full">
      {children}
    </div>
  )
}
