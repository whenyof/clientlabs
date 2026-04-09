import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Términos y Condiciones — ClientLabs",
  description: "Términos y condiciones de uso de ClientLabs",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-20" style={{ background: "#0B1F2A" }}>
      <div className="max-w-2xl mx-auto">

        <div className="mb-12">
          <Link href="/" className="text-[18px] font-bold" style={{ color: "#1FA97A" }}>
            ClientLabs
          </Link>
        </div>

        <h1 className="text-[32px] font-bold text-white mb-3">Términos y Condiciones</h1>
        <p className="text-white/40 text-[13px] mb-12">Última actualización: abril 2026</p>

        <div className="space-y-8 text-[14px] text-white/60 leading-relaxed">

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">1. Identificación</h2>
            <p>
              ClientLabs es una plataforma de gestión para autónomos y pequeños negocios operada
              por su fundador con domicilio a efectos de comunicaciones en{" "}
              <a href="mailto:hola@clientlabs.io" className="text-[#1FA97A] hover:underline">
                hola@clientlabs.io
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">2. Objeto del servicio</h2>
            <p>
              ClientLabs proporciona una plataforma SaaS de gestión de leads, clientes, proveedores,
              facturación y automatizaciones para autónomos y pequeños negocios hispanohablantes.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">3. Condiciones de acceso</h2>
            <ul className="list-disc list-inside space-y-2 text-white/50">
              <li>Debes ser mayor de 18 años</li>
              <li>Debes proporcionar información veraz en el registro</li>
              <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso</li>
              <li>Una cuenta es para un único usuario salvo planes que incluyan múltiples usuarios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">4. Planes y facturación</h2>
            <ul className="list-disc list-inside space-y-2 text-white/50">
              <li>Los precios se muestran en euros sin IVA salvo indicación contraria</li>
              <li>El IVA aplicable se añade según la normativa vigente</li>
              <li>La facturación es mensual y se renueva automáticamente</li>
              <li>Puedes cancelar en cualquier momento desde tu panel — el acceso se mantiene hasta el fin del periodo pagado</li>
              <li>No se realizan reembolsos por periodos parciales salvo obligación legal</li>
              <li>Los descuentos de acceso anticipado son permanentes mientras se mantenga la suscripción activa sin interrupciones</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">5. Periodo de prueba</h2>
            <p>
              ClientLabs ofrece 14 días de prueba gratuita sin necesidad de tarjeta de crédito.
              Al finalizar el periodo de prueba deberás elegir un plan para continuar usando el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">6. Uso aceptable</h2>
            <p className="mb-3">Queda prohibido:</p>
            <ul className="list-disc list-inside space-y-2 text-white/50">
              <li>Usar la plataforma para actividades ilegales o fraudulentas</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Realizar ingeniería inversa o copiar el código de la plataforma</li>
              <li>Usar la plataforma para enviar spam o comunicaciones no solicitadas</li>
              <li>Sobrecargar la infraestructura mediante uso automatizado abusivo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">7. Propiedad intelectual</h2>
            <p>
              Todo el código, diseño, marcas y contenidos de ClientLabs son propiedad exclusiva de
              ClientLabs. Los datos que introduces en la plataforma son de tu propiedad y puedes
              exportarlos en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">8. Disponibilidad del servicio</h2>
            <p>
              Nos comprometemos a mantener una disponibilidad del servicio del 99% mensual. Las
              interrupciones programadas de mantenimiento se comunicarán con antelación. No nos
              responsabilizamos de interrupciones causadas por terceros proveedores de infraestructura.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">9. Limitación de responsabilidad</h2>
            <p>
              ClientLabs no será responsable de daños indirectos, pérdida de beneficios o datos
              derivados del uso o imposibilidad de uso del servicio. La responsabilidad máxima de
              ClientLabs se limita al importe pagado en los últimos 3 meses de suscripción.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">10. Cancelación y baja</h2>
            <p>
              Puedes cancelar tu cuenta en cualquier momento desde Ajustes → Suscripción. También
              puedes solicitar la eliminación completa de tus datos enviando un email a{" "}
              <a href="mailto:hola@clientlabs.io" className="text-[#1FA97A] hover:underline">
                hola@clientlabs.io
              </a>.
              Nos reservamos el derecho de suspender cuentas que incumplan estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">11. Legislación aplicable</h2>
            <p>
              Estos términos se rigen por la legislación española. Para cualquier controversia las
              partes se someten a los juzgados y tribunales de España, con renuncia expresa a
              cualquier otro fuero.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-white mb-3">12. Modificaciones</h2>
            <p>
              Podemos actualizar estos términos en cualquier momento. Te notificaremos cambios
              significativos con al menos 30 días de antelación por email. El uso continuado del
              servicio tras la notificación implica la aceptación de los nuevos términos.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center gap-6 text-[12px] text-white/30">
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Política de Privacidad</Link>
          <Link href="/cookies" className="hover:text-white/60 transition-colors">Política de Cookies</Link>
          <Link href="/legal" className="hover:text-white/60 transition-colors">Legal</Link>
          <Link href="/" className="hover:text-white/60 transition-colors">← Inicio</Link>
        </div>

      </div>
    </main>
  )
}
