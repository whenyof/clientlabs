import { redirect } from "next/navigation"

// /dashboard/finance/invoicing/[id] → /dashboard/finance/invoicing/[id]/preview
export default async function InvoicingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/dashboard/finance/invoicing/${id}/preview`)
}
