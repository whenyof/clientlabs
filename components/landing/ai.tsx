import Image from "next/image"
import { aiContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"
import { GridBackground, NoiseOverlay } from "@/components/landing/utils"
import { sanitizeAllowInline } from "@/lib/sanitize"

export function AI() {
  const { eyebrow, headline, headlineAccent, sub, features, demo } = aiContent

  return (
    <section className="relative overflow-hidden bg-navy py-[120px] text-white">
      <GridBackground variant="dark" className="opacity-70" />
      <NoiseOverlay opacity={0.04} className="mix-blend-overlay" />

      <div className="relative z-10 mx-auto max-w-[1240px] px-7">
        {/* Section header */}
        <div className="mb-14">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
            {eyebrow}
          </span>
          <h2 className="mt-4 mb-4 font-display text-[clamp(40px,4.4vw,60px)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            {headline}
            <br />
            {headlineAccent}
          </h2>
          <p className="max-w-[600px] text-[17px] leading-[1.55] text-[#a8b5bc]">{sub}</p>
        </div>

        {/* Feature cards — 3 cols */}
        <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map((feat) => {
            const Icon = LandingIcons[feat.icon as keyof typeof LandingIcons]
            return (
              <div
                key={feat.title}
                className="rounded-card-lg border border-line-dark bg-navy-2 p-7 transition-all duration-200 hover:-translate-y-[3px] hover:border-emerald/40"
              >
                <div className="mb-[18px] grid h-11 w-11 place-items-center rounded-[12px] bg-emerald/[0.14] text-emerald">
                  {Icon && <Icon className="h-5 w-5" />}
                </div>
                <div className="mb-2 font-display text-[20px] font-bold tracking-[-0.02em]">
                  {feat.title}
                </div>
                <div className="text-[14.5px] leading-[1.5] text-[#a8b5bc]">{feat.desc}</div>
              </div>
            )
          })}
        </div>

        {/* AI demo chat */}
        <div className="rounded-card-lg border border-line-dark bg-navy-2 p-7">
          {/* Demo header */}
          <div className="mb-[18px] flex items-center gap-2.5 border-b border-line-dark pb-4">
            <Image src="/logo-trimmed.webp" alt="ClientLabs" width={40} height={40} className="object-contain" />
            <div>
              <h4 className="m-0 font-display text-[16px] font-bold tracking-[-0.015em]">
                {demo.label}
              </h4>
              <p className="m-0 font-mono text-[12px] text-[#8fa0aa]">{demo.sublabel}</p>
            </div>
          </div>

          {/* Chat messages */}
          <div className="grid gap-3.5">
            {demo.messages.map((msg, i) => (
              <div key={i} className="flex items-start gap-3">
                {msg.role === "me" ? (
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] font-display text-[12px] font-extrabold text-white"
                    style={{ background: "#3c5664" }}
                  >
                    YO
                  </div>
                ) : (
                  <Image src="/logo-trimmed.webp" alt="CL" width={40} height={40} className="shrink-0 object-contain" />
                )}
                <div
                  className={[
                    "max-w-[700px] rounded-[12px] border px-3.5 py-3 text-[14.5px] leading-[1.5] text-[#e7edf0]",
                    "[&_b]:font-bold [&_b]:text-emerald",
                    msg.role === "me"
                      ? "border-line-dark bg-white/[0.04]"
                      : "border-emerald/[0.22] bg-emerald/[0.08]",
                  ].join(" ")}
                  dangerouslySetInnerHTML={{ __html: sanitizeAllowInline(msg.text) }}
                />
              </div>
            ))}

            {/* Suggestion chips — shown after last AI message */}
            <div className="ml-11 flex flex-wrap gap-2">
              {demo.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-line-dark bg-white/[0.05] px-3 py-1.5 font-mono text-[12.5px] text-[#c6d0d6]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
