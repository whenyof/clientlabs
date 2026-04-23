import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de Privacidad — ClientLabs",
  description: "Consulta nuestra política de privacidad. Cumplimiento RGPD, datos en la UE, cifrado completo. Tus datos son tuyos.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://clientlabs.io/privacy" },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-20" style={{ background: "#0B1F2A" }}>
      <div className="max-w-2xl mx-auto">

        <div className="mb-12">
          <Link href="/" className="text-[18px] font-bold" style={{ color: "#1FA97A" }}>
            ClientLabs
          </Link>
        </div>

        <h1 className="text-[32px] font-bold text-white mb-3">Política de Privacidad</h1>
        <p className="text-white/40 text-[13px] mb-12">Última actualización: abril 2026</p>

        <div className="space-y-8 text-[14px] text-white/60 leading-relaxed">

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">1. Responsable del tratamiento</h2>
            <p>
              El responsable del tratamiento de sus datos personales es <strong className="text-white/80">ClientLabs</strong>,
              con domicilio a efectos de comunicaciones en{" "}
              <a href="mailto:hola@clientlabs.io" className="text-[#1FA97A] hover:underline">
                hola@clientlabs.io
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">2. Datos que recopilamos</h2>
            <p className="mb-3">Recopilamos los siguientes datos personales:</p>
            <ul className="list-disc list-inside space-y-2 text-white/50">
              <li>Nombre y apellidos</li>
              <li>Dirección de correo electrónico</li>
              <li>Datos de acceso y autenticación</li>
              <li>Datos de uso de la plataforma</li>
              <li>Dirección IP y datos técnicos del dispositivo</li>
              <li>Datos de facturación cuando aplica</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">3. Finalidad del tratamiento</h2>
            <ul className="list-disc list-inside space-y-2 text-white/50">
              <li>Prestación del servicio contratado</li>
              <li>Gestión de su cuenta de usuario</li>
              <li>Envío de comunicaciones relacionadas con el servicio</li>
              <li>Mejora de la plataforma mediante análisis de uso</li>
              <li>Cumplimiento de obligaciones legales</li>
              <li>Gestión de pagos y facturación</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">4. Base legal del tratamiento</h2>
            <ul className="list-disc list-inside space-y-2 text-white/50">
              <li><span className="text-white/70">Ejecución del contrato:</span> para la prestación del servicio contratado</li>
              <li><span className="text-white/70">Interés legítimo:</span> para la mejora del servicio y comunicaciones relacionadas</li>
              <li><span className="text-white/70">Consentimiento:</span> para comunicaciones comerciales y cookies no esenciales</li>
              <li><span className="text-white/70">Obligación legal:</span> para el cumplimiento de normativas aplicables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">5. Conservación de datos</h2>
            <p>
              Sus datos se conservarán mientras mantenga su cuenta activa. Una vez cancelada, los datos
              se eliminarán en un plazo máximo de 30 días, salvo obligación legal de conservación
              (hasta 5 años para datos de facturación según normativa fiscal española).
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">6. Cesión de datos a terceros</h2>
            <p className="mb-3">
              Sus datos pueden ser compartidos con los siguientes proveedores de servicios, siempre bajo
              acuerdos de tratamiento de datos conformes al RGPD:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/50">
              <li><span className="text-white/70">Vercel Inc.</span> — alojamiento y despliegue</li>
              <li><span className="text-white/70">Neon Inc.</span> — base de datos</li>
              <li><span className="text-white/70">Stripe Inc.</span> — procesamiento de pagos</li>
              <li><span className="text-white/70">Resend Inc.</span> — envío de emails</li>
              <li><span className="text-white/70">Upstash Inc.</span> — caché y almacenamiento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">7. Sus derechos</h2>
            <p className="mb-3">Conforme al RGPD y la LOPDGDD tiene derecho a:</p>
            <ul className="list-disc list-inside space-y-2 text-white/50">
              <li><span className="text-white/70">Acceso:</span> conocer qué datos tratamos sobre usted</li>
              <li><span className="text-white/70">Rectificación:</span> corregir datos inexactos</li>
              <li><span className="text-white/70">Supresión:</span> solicitar la eliminación de sus datos</li>
              <li><span className="text-white/70">Oposición:</span> oponerse al tratamiento en determinadas circunstancias</li>
              <li><span className="text-white/70">Portabilidad:</span> recibir sus datos en formato estructurado</li>
              <li><span className="text-white/70">Limitación:</span> solicitar la limitación del tratamiento</li>
            </ul>
            <p className="mt-3">
              Para ejercer sus derechos contacte en:{" "}
              <a href="mailto:hola@clientlabs.io" className="text-[#1FA97A] hover:underline">
                hola@clientlabs.io
              </a>
            </p>
            <p className="mt-2">
              También puede reclamar ante la Agencia Española de Protección de Datos (AEPD) en{" "}
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-[#1FA97A] hover:underline">
                www.aepd.es
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">8. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas y organizativas apropiadas para proteger sus datos contra acceso
              no autorizado, pérdida o destrucción, incluyendo cifrado en tránsito (TLS) y en reposo,
              control de accesos y auditorías periódicas.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">9. Cookies</h2>
            <p>
              Utilizamos cookies propias y de terceros. Consulte nuestra{" "}
              <Link href="/cookies" className="text-[#1FA97A] hover:underline">
                Política de Cookies
              </Link>
              {" "}para más información.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">10. Cambios en esta política</h2>
            <p>
              Nos reservamos el derecho de modificar esta política en cualquier momento. Le notificaremos
              cambios significativos por email o mediante aviso destacado en la plataforma.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center gap-6 text-[12px] text-white/30">
          <Link href="/terms" className="hover:text-white/60 transition-colors">Términos y Condiciones</Link>
          <Link href="/cookies" className="hover:text-white/60 transition-colors">Política de Cookies</Link>
          <Link href="/legal" className="hover:text-white/60 transition-colors">Legal</Link>
          <Link href="/" className="hover:text-white/60 transition-colors">← Inicio</Link>
        </div>

      </div>
    </main>
  )
}
