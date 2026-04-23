import { Metadata } from "next"
import Link from "next/link"
import { FileText, Shield, Cookie } from "lucide-react"

export const metadata: Metadata = {
  title: "Información Legal — ClientLabs",
  description: "Aviso legal, términos, privacidad y cookies de ClientLabs. Cumplimiento RGPD y normativa española.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://clientlabs.io/legal" },
}

export default function LegalPage() {
  return (
    <main className="min-h-screen px-6 py-20" style={{ background: "#0B1F2A" }}>
      <div className="max-w-2xl mx-auto">

        <div className="mb-12">
          <Link href="/" className="text-[18px] font-bold" style={{ color: "#1FA97A" }}>
            ClientLabs
          </Link>
        </div>

        <h1 className="text-[32px] font-bold text-white mb-3">Información Legal</h1>
        <p className="text-white/40 text-[14px] mb-12 leading-relaxed">
          Toda la información legal sobre ClientLabs en un solo lugar.
        </p>

        <div className="space-y-3">

          <Link
            href="/terms"
            className="flex items-start gap-4 p-5 border border-white/10 rounded-xl hover:border-[#1FA97A]/50 hover:bg-white/[0.03] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,169,122,0.12)" }}>
              <FileText className="h-5 w-5" style={{ color: "#1FA97A" }} />
            </div>
            <div>
              <div className="font-semibold text-white mb-1 group-hover:text-[#1FA97A] transition-colors text-[15px]">
                Términos y Condiciones
              </div>
              <div className="text-[13px] text-white/40">
                Condiciones de uso del servicio, planes, facturación y normas de uso aceptable.
              </div>
            </div>
          </Link>

          <Link
            href="/privacy"
            className="flex items-start gap-4 p-5 border border-white/10 rounded-xl hover:border-[#1FA97A]/50 hover:bg-white/[0.03] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,169,122,0.12)" }}>
              <Shield className="h-5 w-5" style={{ color: "#1FA97A" }} />
            </div>
            <div>
              <div className="font-semibold text-white mb-1 group-hover:text-[#1FA97A] transition-colors text-[15px]">
                Política de Privacidad
              </div>
              <div className="text-[13px] text-white/40">
                Cómo recopilamos, usamos y protegemos tus datos personales conforme al RGPD.
              </div>
            </div>
          </Link>

          <Link
            href="/cookies"
            className="flex items-start gap-4 p-5 border border-white/10 rounded-xl hover:border-[#1FA97A]/50 hover:bg-white/[0.03] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,169,122,0.12)" }}>
              <Cookie className="h-5 w-5" style={{ color: "#1FA97A" }} />
            </div>
            <div>
              <div className="font-semibold text-white mb-1 group-hover:text-[#1FA97A] transition-colors text-[15px]">
                Política de Cookies
              </div>
              <div className="text-[13px] text-white/40">
                Qué cookies usamos, para qué sirven y cómo puedes gestionarlas.
              </div>
            </div>
          </Link>

        </div>

        <div className="mt-10 p-5 border border-white/10 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="text-[13px] text-white/40 leading-relaxed">
            ¿Tienes preguntas sobre alguno de estos documentos? Escríbenos a{" "}
            <a href="mailto:hola@clientlabs.io" className="text-[#1FA97A] hover:underline font-medium">
              hola@clientlabs.io
            </a>
            {" "}y te respondemos en menos de 24 horas.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10">
          <Link href="/" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
            ← Volver al inicio
          </Link>
        </div>

      </div>
    </main>
  )
}
