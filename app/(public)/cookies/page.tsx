import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de Cookies — ClientLabs",
  description: "Consulta nuestra política de cookies. Solo las estrictamente necesarias para el funcionamiento de la plataforma.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://clientlabs.io/cookies" },
}

export default function CookiesPage() {
  return (
    <main
      className="min-h-screen px-6 py-20"
      style={{ background: "#0B1F2A" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-12">
          <Link href="/" className="text-[18px] font-bold" style={{ color: "#1FA97A" }}>
            ClientLabs
          </Link>
        </div>

        <h1 className="text-[32px] font-bold text-white mb-3">Política de Cookies</h1>
        <p className="text-white/40 text-[13px] mb-12">Última actualización: enero 2026</p>

        <div className="space-y-8 text-[14px] text-white/60 leading-relaxed">
          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas
              un sitio web. Se utilizan para recordar tus preferencias y hacer que la navegación sea más
              eficiente.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">Cookies que usamos</h2>
            <p className="mb-4">
              ClientLabs utiliza únicamente cookies técnicas estrictamente necesarias para el funcionamiento
              de la plataforma. No utilizamos cookies de publicidad, rastreo ni analítica de terceros.
            </p>
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-4 py-3 text-white/70 font-medium">Cookie</th>
                    <th className="text-left px-4 py-3 text-white/70 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 text-white/70 font-medium">Finalidad</th>
                    <th className="text-left px-4 py-3 text-white/70 font-medium">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="px-4 py-3 text-white/50 font-mono">next-auth.session-token</td>
                    <td className="px-4 py-3">Técnica</td>
                    <td className="px-4 py-3">Mantiene tu sesión iniciada</td>
                    <td className="px-4 py-3">Sesión</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white/50 font-mono">next-auth.csrf-token</td>
                    <td className="px-4 py-3">Técnica</td>
                    <td className="px-4 py-3">Protección contra ataques CSRF</td>
                    <td className="px-4 py-3">Sesión</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white/50 font-mono">cl-cookies-accepted</td>
                    <td className="px-4 py-3">Técnica</td>
                    <td className="px-4 py-3">Recuerda que has aceptado este aviso</td>
                    <td className="px-4 py-3">1 año</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">Cookies de terceros</h2>
            <p>
              No utilizamos cookies de terceros, redes publicitarias, plataformas de analítica externas
              ni herramientas de seguimiento de comportamiento. Tu actividad en ClientLabs no se comparte
              con ningún tercero.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">Cómo desactivar las cookies</h2>
            <p className="mb-3">
              Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que si
              desactivas las cookies técnicas, partes de la plataforma pueden dejar de funcionar
              correctamente (por ejemplo, no podrás mantener la sesión iniciada).
            </p>
            <ul className="space-y-1 list-disc list-inside text-white/50">
              <li>
                <span className="text-white/60">Chrome:</span> Configuración → Privacidad y seguridad → Cookies
              </li>
              <li>
                <span className="text-white/60">Firefox:</span> Opciones → Privacidad y seguridad → Cookies
              </li>
              <li>
                <span className="text-white/60">Safari:</span> Preferencias → Privacidad → Gestionar datos
              </li>
              <li>
                <span className="text-white/60">Edge:</span> Configuración → Privacidad → Cookies
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">Contacto</h2>
            <p>
              Si tienes alguna duda sobre el uso de cookies, escríbenos a{" "}
              <a href="mailto:hola@clientlabs.io" className="text-[#1FA97A] hover:underline">
                hola@clientlabs.io
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center gap-6 text-[12px] text-white/30">
          <Link href="/terms" className="hover:text-white/60 transition-colors">Términos y Condiciones</Link>
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Política de Privacidad</Link>
          <Link href="/legal" className="hover:text-white/60 transition-colors">Legal</Link>
          <Link href="/" className="hover:text-white/60 transition-colors">← Inicio</Link>
        </div>
      </div>
    </main>
  )
}
