import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Declaración Responsable — ClientLabs",
  description:
    "Declaración responsable del fabricante conforme al artículo 5 del Real Decreto 1007/2023 para el sistema de facturación VERI*FACTU.",
}

export default function DeclaracionResponsable() {
  const fecha = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date("2025-01-01"))

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span aria-hidden>←</span> Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Declaración Responsable
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Conforme al artículo 5 del Real Decreto 1007/2023, de 5 de diciembre
        </p>

        <div className="space-y-6 text-[15px] leading-relaxed text-slate-700">
          <p>
            <strong>ClientLabs</strong>, como fabricante del sistema informático de facturación
            que lleva su nombre, declara bajo su responsabilidad que dicho sistema cumple con
            lo establecido en el artículo 29.2.j) de la Ley 58/2003, de 17 de diciembre,
            General Tributaria, y con las especificaciones técnicas y funcionales contenidas
            en el Real Decreto 1007/2023, de 5 de diciembre.
          </p>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              El sistema garantiza:
            </h2>
            <ul className="space-y-3 list-none">
              {[
                {
                  title: "Integridad e inalterabilidad",
                  body: "de los registros de facturación, mediante la generación de una huella o hash encadenado conforme al algoritmo SHA-256.",
                },
                {
                  title: "Trazabilidad",
                  body: "de los registros, asegurando que cada registro de facturación contiene la referencia al registro inmediatamente anterior.",
                },
                {
                  title: "Conservación",
                  body: "de los registros de facturación conforme a los plazos legalmente establecidos.",
                },
                {
                  title: "Remisión",
                  body: "de los registros de facturación a la Agencia Estatal de Administración Tributaria (AEAT) de forma automática y sin demora, mediante el sistema VERI*FACTU.",
                },
                {
                  title: "Generación del código QR",
                  body: "en cada factura emitida, conforme a las especificaciones de la AEAT, que permite la verificación de los datos de facturación.",
                },
              ].map(({ title, body }) => (
                <li key={title} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#1FA97A]" />
                  <span>
                    <strong className="text-slate-900">{title}</strong>{" "}{body}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Datos del fabricante
            </h2>
            <dl className="space-y-1.5">
              {[
                ["Nombre", "ClientLabs"],
                ["Versión del software", "1.0"],
                ["Modalidad", "VERI*FACTU (envío directo a la AEAT)"],
                ["Web", "clientlabs.io"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <dt className="w-44 shrink-0 text-slate-500">{label}:</dt>
                  <dd className="font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Proveedor de servicios de facturación electrónica
            </h2>
            <p>
              ClientLabs utiliza los servicios de <strong>Verifacti</strong> como Colaborador
              Social de la AEAT para la remisión de los registros de facturación. Verifacti
              gestiona el certificado electrónico de representación, la generación del XML
              conforme al esquema de la AEAT y el envío telemático de los registros.
            </p>
          </div>
        </div>

        <p className="mt-12 text-sm text-slate-400">
          Fecha de la declaración: {fecha}
        </p>
      </div>
    </div>
  )
}
