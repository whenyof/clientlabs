/**
 * Finance module layout at /dashboard/finance.
 * Reuses the full-bleed layout from the legacy finance route.
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
      {children}
    </div>
  )
}

