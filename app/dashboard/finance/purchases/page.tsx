import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SalesDashboard } from "@/modules/sales/components/SalesView"
import type { Sale } from "@/modules/sales/types"



function toSaleRow(
  id: string,
  userId: string,
  clientName: string,
  product: string,
  amount: number,
  status: string,
  date: Date
): Sale {
  return {
    id,
    userId,
    clientId: null,
    clientName,
    clientEmail: null,
    product,
    category: null,
    price: amount,
    discount: 0,
    tax: 0,
    total: amount,
    amount,
    currency: "EUR",
    provider: "",
    paymentMethod: "",
    status,
    stripePaymentId: null,
    stripeCustomerId: null,
    metadata: {},
    notes: null,
    saleDate: date,
    invoiceUrl: null,
    createdAt: date,
    updatedAt: date,
    Client: null,
  }
}

export default async function PurchasesPage() {
  const session = await getServerSession(authOptions)

  const userId = session?.user?.id
  if (!userId) {
    redirect("/auth")
  }

  const [payments, orders, expenses] = await Promise.all([
    prisma.providerPayment.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        concept: true,
        status: true,
        orderId: true,
        Provider: { select: { name: true } },
      },
      orderBy: { paymentDate: "desc" },
      take: 200,
    }),
    prisma.providerOrder.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        orderDate: true,
        description: true,
        status: true,
        Provider: { select: { name: true } },
        payment: { select: { id: true } },
      },
      orderBy: { orderDate: "desc" },
      take: 200,
    }),
    prisma.transaction.findMany({
      where: { userId, type: "EXPENSE" },
      select: {
        id: true,
        amount: true,
        date: true,
        concept: true,
        status: true,
        Client: { select: { name: true } },
      },
      orderBy: { date: "desc" },
      take: 100,
    }),
  ])



  const paymentByOrderId = new Set(payments.map((p) => p.orderId).filter(Boolean) as string[])
  const ordersAsSales: Sale[] = orders.map((o) => {
    const hasPayment = paymentByOrderId.has(o.id) || (o as { payment?: { id: string } | null }).payment != null
    const status = hasPayment ? "PAID" : String(o.status)
    const label = o.description ?? "Orden proveedor"
    return toSaleRow(
      `order-${o.id}`,
      userId,
      o.Provider?.name ?? "",
      hasPayment ? `${label} ✓ Pagada` : label,
      Number(o.amount),
      status,
      o.orderDate
    )
  })
  const standalonePayments = payments.filter((p) => !p.orderId)
  const paymentsAsSales: Sale[] = standalonePayments.map((p) =>
    toSaleRow(
      `payment-${p.id}`,
      userId,
      p.Provider?.name ?? "",
      p.concept ?? "Pago proveedor",
      Number(p.amount),
      p.status,
      p.paymentDate
    )
  )
  const expensesAsSales: Sale[] = expenses.map((t) =>
    toSaleRow(
      `tx-${t.id}`,
      userId,
      t.Client?.name ?? "",
      t.concept ?? "Gasto",
      Number(t.amount),
      t.status,
      t.date
    )
  )

  // Trust the finance engine deduplication logic:
  // Orders (primary expense source) + Standalone Payments (direct) + Expenses (transactions)
  const purchasesAsSales: Sale[] = [...ordersAsSales, ...paymentsAsSales, ...expensesAsSales]

  console.log("PURCHASE KPI SOURCE:", purchasesAsSales.length)

  return (
    <SalesDashboard
      mode="purchases"
      initialSales={purchasesAsSales}
    />
  )
}

