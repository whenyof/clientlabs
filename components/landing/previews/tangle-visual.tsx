import { problemContent } from "@/components/landing/content"
import { BrandIcons } from "@/components/landing/brand-icons"

export function TangleVisual() {
  const { nodes, pairs, visualCaption } = problemContent

  // Split "stack.actual/ · 8 herramientas · 0 conexiones" into left / right
  const parts = visualCaption.split(" · ")
  const captionLeft = parts[0]
  const captionRight = parts.slice(1).join(" · ")

  return (
    <div
      className="relative w-full overflow-hidden rounded-card-lg border border-line bg-[#F8FAFB] p-6 lg:sticky lg:top-[120px]"
      style={{ aspectRatio: "4/5" }}
    >
      {/* Inner tangle — fills padded content area, matches ref: .tangle { position: relative; width: 100%; height: 100% } */}
      <div className="relative h-full w-full">
        {/* Connecting lines */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {pairs.map(([a, b], i) => {
            const A = nodes[a]
            const B = nodes[b]
            const ax = parseFloat(A.x)
            const ay = parseFloat(A.y) + 4
            const bx = parseFloat(B.x)
            const by = parseFloat(B.y) + 4
            const mx = (ax + bx) / 2 + (i % 2 ? 15 : -15)
            const my = (ay + by) / 2
            return (
              <path
                key={i}
                d={`M${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`}
                stroke="#c8d2d8"
                strokeWidth=".4"
                fill="none"
                strokeDasharray="1 1"
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, i) => {
          const brand = BrandIcons[node.label]
          return (
            <div
              key={i}
              className="absolute flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-2.5 py-2 font-display text-[12.5px] font-semibold shadow-soft"
              style={{ left: node.x, top: node.y }}
            >
              {brand ? (
                /* Brand SVG — no background, icon carries its own colors */
                <span
                  className="grid h-[18px] w-[18px] shrink-0 place-items-center [&_svg]:h-full [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: brand.svg }}
                />
              ) : (
                <span
                  className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] font-display text-[10px] font-extrabold text-white"
                  style={{ background: node.color }}
                >
                  {node.label[0]}
                </span>
              )}
              {node.label}
            </div>
          )
        })}
      </div>

      {/* Caption */}
      <div className="absolute bottom-5 left-6 right-6 flex justify-between font-mono text-[11px] text-ink-3">
        <span>{captionLeft}</span>
        <span>{captionRight}</span>
      </div>
    </div>
  )
}
