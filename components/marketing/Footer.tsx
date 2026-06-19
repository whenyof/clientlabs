import Link from "next/link"
import { CONTACT_EMAIL, FOOTER_COLUMNS, SOCIAL_LINKS } from "@/lib/site-config"
import { Globe, IconInstagram, IconLinkedIn, IconX } from "./icons"

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="brand">
              <span className="mark" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>ClientLabs</span>
            </Link>
            <p>
              La plataforma de gestión todo-en-uno para autónomos y pequeñas
              empresas en España.
            </p>
            <div className="foot-social">
              <a href={SOCIAL_LINKS.x} aria-label="X">
                <IconX />
              </a>
              <a href={SOCIAL_LINKS.linkedin} aria-label="LinkedIn">
                <IconLinkedIn />
              </a>
              <a href={SOCIAL_LINKS.instagram} aria-label="Instagram">
                <IconInstagram />
              </a>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div className="foot-col" key={col.heading}>
              <h5>{col.heading}</h5>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="foot-bottom">
          <span className="cr">© 2026 ClientLabs · {CONTACT_EMAIL}</span>
          <span className="foot-lang">
            <Globe />
            Español (España)
          </span>
        </div>
      </div>
    </footer>
  )
}
