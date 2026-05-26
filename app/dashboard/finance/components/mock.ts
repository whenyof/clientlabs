export type Transaction = {
  id: string
  date: string
  concept: string
  type: "income" | "expense"
  amount: number
  origin: "manual" | "auto"
}
