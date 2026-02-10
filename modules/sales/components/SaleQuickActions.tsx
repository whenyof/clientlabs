"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type Props = {
  onNewSale: () => void
}

export function SaleQuickActions({ onNewSale }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={onNewSale}
        className="h-9 px-4 bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30"
      >
        <Plus className="h-4 w-4 mr-2" />
        {sl.ui.createSale}
      </Button>
    </div>
  )
}
