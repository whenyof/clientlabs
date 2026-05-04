import Link from "next/link"
import Image from "next/image"
import { footerContent } from "@/components/landing/content"

const FOOTER_LINK_HREFS: Record<string, string> = {
  "Seguridad": "/seguridad",
  "Declaración responsable": "/legal/declaracion-responsable",
}

export function Footer() {
  return (
    <footer className="border-t border-line-dark bg-navy pb-8 pt-20 text-[#c6d0d6]">
      <div className="mx-auto max-w-[1240px] px-7">
        {/* Grid: brand col + 4 link columns */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-1 font-display text-lg font-extrabold tracking-[-0.02em] text-white">
              <Image src="/logo-trimmed.png" alt="ClientLabs" width={28} height={28} className="object-contain" />
              <span className="leading-none">{footerContent.brand.name}</span>
            </div>
            <p className="mb-[22px] mt-3 max-w-[280px] text-[14.5px] leading-[1.5] text-[#8fa0aa]">
              {footerContent.brand.tagline}
            </p>
          </div>

          {/* Link columns */}
          {footerContent.columns.map((col) => (
            <div key={col.heading}>
              <h5 className="mb-[18px] mt-0 font-display text-[13px] font-bold uppercase tracking-[.05em] text-white">
                {col.heading}
              </h5>
              <ul className="m-0 grid list-none gap-2.5 p-0">
                {col.links.map((link) => (
                  <li key={link}>
                    {FOOTER_LINK_HREFS[link] ? (
                      <Link
                        href={FOOTER_LINK_HREFS[link]}
                        className="text-sm text-[#a8b5bc] transition-colors hover:text-white"
                      >
                        {link}
                      </Link>
                    ) : (
                      <a
                        href="#"
                        className="text-sm text-[#a8b5bc] transition-colors hover:text-white"
                      >
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-line-dark pt-6 text-[13px] text-[#8fa0aa]">
          <div>{footerContent.bottom.copy}</div>

          {/* Socials */}
          <div className="flex gap-2">
            <a
              href="#"
              aria-label="LinkedIn"
              className="grid h-9 w-9 place-items-center rounded-[10px] border border-line-dark-2 text-[#c6d0d6] transition-all hover:border-emerald hover:bg-emerald/10 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="grid h-9 w-9 place-items-center rounded-[10px] border border-line-dark-2 text-[#c6d0d6] transition-all hover:border-emerald hover:bg-emerald/10 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-[10px] border border-line-dark-2 text-[#c6d0d6] transition-all hover:border-emerald hover:bg-emerald/10 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </footer>
  )
}
