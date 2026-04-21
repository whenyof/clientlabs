import { platformContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"

// Map node index to icon — ref uses bolt/check/doc/calendar in order
const NODE_ICONS = [
  LandingIcons.bolt,
  LandingIcons.check,
  LandingIcons.fileText,
  LandingIcons.calendar,
] as const

export function FlowPreview() {
  const { topbar, nodes } = platformContent.preview.auto

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

      {/* Flow */}
      <div className="grid gap-2.5 p-4">
        {nodes.map((node, i) => {
          const Icon = NODE_ICONS[i] ?? LandingIcons.check
          const iconBg = node.colorBg ?? "#eaf6f0"
          const iconFg = node.colorFg ?? "#0d7a56"

          return (
            <div key={i}>
              <div className="flex items-center gap-3 rounded-[10px] border border-line bg-white px-3.5 py-3">
                <div
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px]"
                  style={{ background: iconBg, color: iconFg }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-display text-[13px] font-semibold">{node.label}</div>
                  <div className="font-mono text-[11.5px] text-ink-3">{node.sub}</div>
                </div>
              </div>
              {/* Connector */}
              {i < nodes.length - 1 && (
                <div className="mx-auto h-3.5 w-[2px] bg-line" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
