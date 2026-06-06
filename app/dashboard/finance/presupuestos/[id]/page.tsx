import { QuotesView } from "@/app/dashboard/finance/components/QuotesView"

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="w-full">
      <QuotesView initialOpenId={id} />
    </div>
  )
}
