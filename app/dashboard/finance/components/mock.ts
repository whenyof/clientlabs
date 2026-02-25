export type Transaction = {
    id: string
    date: string
    concept: string
    type: "income" | "expense"
    amount: number
    origin: "manual" | "auto"
  }
  
  export const MOCK_TRANSACTIONS: Transaction[] = [
    {
      id: "1",
      date: "2025-01-20",
      concept: "Venta servicio",
      type: "income",
      amount: 450,
      origin: "manual",
    },
    {
      id: "2",
      date: "2025-01-21",
      concept: "Factura proveedor",
      type: "expense",
      amount: 120,
      origin: "auto",
    },
  ]