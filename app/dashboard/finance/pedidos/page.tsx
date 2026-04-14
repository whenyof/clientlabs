"use client"

import { PurchaseOrdersView } from "@/app/dashboard/finance/components/PurchaseOrdersView"
import { useRouter } from "next/navigation"

export default function PedidosPage() {
  const router = useRouter()
  return (
    <div className="w-full">
      <PurchaseOrdersView
        onNavigateToInvoices={() => router.push("/dashboard/finance/facturas")}
        onNavigateToDelivery={() => router.push("/dashboard/finance/albaranes")}
      />
    </div>
  )
}
