"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { createSale } from "../actions/sales.actions"
import type { SaleCreateInput } from "../types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateSaleDialog({ open, onOpenChange, onSuccess }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const [loading, setLoading] = useState(false)
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [product, setProduct] = useState("")
  const [total, setTotal] = useState("")
  const [status, setStatus] = useState("PENDIENTE")
  const [notes, setNotes] = useState("")
  const [saleDate, setSaleDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !product.trim()) {
      toast.error(labels.common.error ?? "Completa los campos obligatorios")
      return
    }
    const numTotal = parseFloat(total)
    if (isNaN(numTotal) || numTotal < 0) {
      toast.error("Importe no válido")
      return
    }

    setLoading(true)
    try {
      const data: SaleCreateInput = {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || undefined,
        product: product.trim(),
        total: numTotal,
        status,
        notes: notes.trim() || undefined,
        saleDate: new Date(saleDate),
      }
      const result = await createSale(data)
      if (result.success) {
        toast.success(labels.common.success ?? "Venta creada")
        onOpenChange(false)
        setClientName("")
        setClientEmail("")
        setProduct("")
        setTotal("")
        setStatus("PENDIENTE")
        setNotes("")
        setSaleDate(new Date().toISOString().split("T")[0])
        onSuccess?.()
      } else {
        toast.error(result.error ?? labels.common.error)
      }
    } catch {
      toast.error(labels.common.error ?? "Error al crear")
    } finally {
      setLoading(false)
    }
  }

  const paymentOptions = [
    { value: "PENDIENTE", label: sl.paymentStatus?.PENDIENTE ?? "Pendiente" },
    { value: "PAGADO", label: sl.paymentStatus?.PAGADO ?? "Pagado" },
    { value: "PARCIAL", label: sl.paymentStatus?.PARCIAL ?? "Parcial" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{sl.newButton}</DialogTitle>
          <p className="text-sm text-white/60">{sl.ui.manualRegister}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clientName" className="text-white/80">
              {sl.table.client} *
            </Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Nombre del cliente"
              required
            />
          </div>
          <div>
            <Label htmlFor="clientEmail" className="text-white/80">
              Email
            </Label>
            <Input
              id="clientEmail"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="email@ejemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="product" className="text-white/80">
              {sl.table.product} *
            </Label>
            <Input
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Concepto o producto"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total" className="text-white/80">
                {sl.table.amount} *
              </Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                min="0"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="saleDate" className="text-white/80">
                {sl.table.date}
              </Label>
              <Input
                id="saleDate"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status" className="text-white/80">
              {sl.table.state}
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {paymentOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-white focus:bg-zinc-700"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes" className="text-white/80">
              {sl.ui.recentNotes}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-white/10 text-white resize-none"
              placeholder="Notas opcionales..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              {labels.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {loading ? labels.common.loading : sl.ui.saveSale}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
