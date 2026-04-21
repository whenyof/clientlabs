import { platformContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"

export function InvoicePreview() {
  const { topbar, client, invoiceNum, dates, lines, total, status } =
    platformContent.preview.invoice

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[14px] border border-line bg-[#F8FAFB]">
      {/* Topbar */}
      <div className="flex items-center gap-2 border-b border-line bg-white px-3.5 py-2.5">
        <div className="flex gap-[5px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[9px] w-[9px] rounded-full bg-[#d7dee2]" />
          ))}
        </div>
        <span className="ml-1.5 font-mono text-[11px] text-ink-3">{topbar}</span>
      </div>

      {/* Invoice card */}
      <div className="p-4">
        <div className="rounded-[10px] border border-line bg-white p-[18px]">
          {/* Header */}
          <div className="mb-3.5 flex items-start justify-between border-b border-dashed border-line pb-3.5">
            <div>
              <div className="font-display text-[18px] font-extrabold tracking-[-0.02em]">
                {client.name}
              </div>
              <div className="mt-1 text-[11.5px] text-ink-3">{client.nif}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[11px] text-ink-3">{invoiceNum}</div>
              <div className="mt-1 text-[11.5px] text-ink-3">{dates}</div>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2fr_60px_80px_80px] gap-2 border-b border-line py-2 font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-3">
            <div>Concepto</div>
            <div>Cant.</div>
            <div>Precio</div>
            <div className="text-right">Total</div>
          </div>

          {/* Lines */}
          {lines.map((row) => (
            <div
              key={row[0]}
              className="grid grid-cols-[2fr_60px_80px_80px] gap-2 border-b border-line py-2 text-[12.5px]"
            >
              <div>{row[0]}</div>
              <div>{row[1]}</div>
              <div>{row[2]}</div>
              <div className="text-right font-semibold">{row[3]}</div>
            </div>
          ))}

          {/* Total */}
          <div className="mt-3.5 flex items-center justify-between">
            <div>
              <div className="text-[12px] text-ink-3">Total con IVA (21%)</div>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eaf6f0] px-2.5 py-1 font-display text-[11.5px] font-semibold text-emerald-ink">
                <LandingIcons.check className="h-3 w-3" />
                {status}
              </span>
            </div>
            <div className="font-display text-[24px] font-extrabold tracking-[-0.02em]">{total}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
