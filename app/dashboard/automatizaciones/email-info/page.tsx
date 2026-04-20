"use client"

import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  Lock,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react"

export default function EmailInfoPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-[13px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <span className="text-[13px] text-slate-400">
            Cómo funcionan los emails automáticos
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1FA97A] to-[#0B8A5E] flex items-center justify-center shadow-lg shadow-[#1FA97A]/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#1FA97A] uppercase tracking-wider mb-0.5">
                Emails automáticos
              </div>
              <h1 className="text-[24px] font-bold text-slate-900 leading-tight">
                ClientLabs escribe por ti. Tú te llevas el mérito.
              </h1>
            </div>
          </div>
          <p className="text-[15px] text-slate-500 leading-relaxed pl-[60px]">
            Cada email automático se envía en tu nombre, con tu firma y con el mensaje
            que tú has redactado. Tus clientes y leads no saben que es automático —
            solo ven un mensaje tuyo, a tiempo y sin errores.
          </p>
        </div>

        {/* Cómo funciona */}
        <section className="mb-10">
          <h2 className="text-[18px] font-bold text-slate-900 mb-6">Cómo funciona</h2>

          <div className="space-y-4">
            {[
              {
                paso: "1",
                titulo: "Tú configuras el mensaje",
                descripcion:
                  "Escribes el asunto y el cuerpo del email una sola vez. Puedes usar variables como {{lead.nombre}} o {{factura.total}} para personalizarlo automáticamente.",
                icon: Zap,
                color: "bg-blue-50 text-blue-600",
              },
              {
                paso: "2",
                titulo: "ClientLabs detecta el momento",
                descripcion:
                  "Cuando ocurre el evento — llega un lead, vence una factura, se convierte un cliente — ClientLabs lo detecta automáticamente y prepara el email.",
                icon: Clock,
                color: "bg-amber-50 text-amber-600",
              },
              {
                paso: "3",
                titulo: "El email sale en tu nombre",
                descripcion:
                  "El mensaje se envía desde hola@clientlabs.io pero con tu nombre como remitente. Tu cliente ve \"De: [Tu nombre]\" en su bandeja de entrada.",
                icon: Mail,
                color: "bg-[#E1F5EE] text-[#1FA97A]",
              },
              {
                paso: "4",
                titulo: "Tú ves el resultado",
                descripcion:
                  "Cada ejecución queda registrada en tu panel de automatizaciones. Sabes exactamente qué se envió, a quién y cuándo.",
                icon: CheckCircle,
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 bg-white border border-slate-200 rounded-2xl p-5"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Paso {item.paso}
                  </div>
                  <div className="text-[14px] font-semibold text-slate-900 mb-1">
                    {item.titulo}
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed">
                    {item.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Por qué importa */}
        <section className="mb-10">
          <h2 className="text-[18px] font-bold text-slate-900 mb-6">Por qué importa</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                titulo: "Nunca pierdes un lead",
                descripcion:
                  "El 78% de los clientes elige al proveedor que responde primero. Con ClientLabs, tú siempre eres el primero.",
                icon: Zap,
                color: "text-[#1FA97A]",
                bg: "bg-[#E1F5EE]",
              },
              {
                titulo: "Cobras más puntual",
                descripcion:
                  "Los recordatorios automáticos de pago reducen el tiempo medio de cobro sin incómodos mensajes manuales.",
                icon: CheckCircle,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                titulo: "Pareces más grande",
                descripcion:
                  "Tus clientes reciben emails de bienvenida, seguimientos y confirmaciones como si tuvieras un equipo detrás. Siendo autónomo.",
                icon: Star,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                titulo: "Recuperas horas reales",
                descripcion:
                  "Cada automatización activa te ahorra entre 5 y 20 minutos. Con las 6 activas por defecto son fácilmente 2-3 horas a la semana.",
                icon: Clock,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div className="text-[14px] font-semibold text-slate-900 mb-1.5">
                  {item.titulo}
                </div>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  {item.descripcion}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Seguridad y privacidad */}
        <section className="mb-10">
          <h2 className="text-[18px] font-bold text-slate-900 mb-6">Seguridad y privacidad</h2>

          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
            {[
              {
                icon: Shield,
                titulo: "Solo lectura",
                descripcion:
                  "ClientLabs nunca accede a tu bandeja de entrada ni lee tus emails. Solo envía los mensajes que tú configuras.",
              },
              {
                icon: Lock,
                titulo: "Tus datos son tuyos",
                descripcion:
                  "Los emails, contactos y mensajes son exclusivamente tuyos. Nunca se comparten ni se usan para entrenar modelos de IA.",
              },
              {
                icon: CheckCircle,
                titulo: "Cumplimiento RGPD",
                descripcion:
                  "Todos los envíos cumplen con el Reglamento General de Protección de Datos de la Unión Europea.",
              },
              {
                icon: Mail,
                titulo: "Infraestructura profesional",
                descripcion:
                  "Los emails se envían a través de Resend, con autenticación SPF, DKIM y DMARC para máxima entregabilidad.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-slate-800 mb-0.5">
                    {item.titulo}
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed">
                    {item.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Próximamente — dominio propio */}
        <section className="mb-10">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

            {/* Cabecera de la card */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-[#E1F5EE]">
              <div className="w-9 h-9 rounded-xl bg-[#1FA97A] flex items-center justify-center flex-shrink-0">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-slate-900">
                    Envía desde tu propio dominio
                  </span>
                  <span className="px-2 py-0.5 bg-[#1FA97A] rounded-full text-[10px] font-bold text-white uppercase tracking-wide">
                    Próximamente
                  </span>
                </div>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="px-6 py-5">
              <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
                Muy pronto podrás conectar tu dominio en ClientLabs y todos los emails
                automáticos saldrán desde{" "}
                <span className="font-semibold text-slate-900">hola@tuempresa.com</span>{" "}
                en lugar de hola@clientlabs.io.
              </p>

              <div className="space-y-3 mb-5">
                {[
                  "Añades tu dominio en Ajustes",
                  "Te damos 3 registros DNS que añades en tu proveedor (GoDaddy, Cloudflare...)",
                  "En menos de 24h todos los emails salen desde tu dominio",
                  "Tus clientes ven hola@tuempresa.com — nunca saben que usas ClientLabs",
                ].map((paso, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#1FA97A] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-white">{i + 1}</span>
                    </div>
                    <span className="text-[13px] text-slate-600 leading-relaxed">{paso}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Esta feature estará disponible para usuarios del plan Pro. Si quieres
                  ser de los primeros en usarla, escríbenos a{" "}
                  <a
                    href="mailto:hola@clientlabs.io"
                    className="text-[#1FA97A] font-medium hover:underline"
                  >
                    hola@clientlabs.io
                  </a>
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-[18px] font-bold text-slate-900 mb-6">Preguntas frecuentes</h2>

          <div className="space-y-3">
            {[
              {
                q: "¿Mis clientes saben que el email es automático?",
                a: "No. El email llega con tu nombre como remitente y el mensaje que tú has redactado. No hay ningún rastro de que sea automático a menos que tú lo menciones.",
              },
              {
                q: "¿Puedo personalizar el mensaje para cada cliente?",
                a: "Sí. Puedes usar variables como {{cliente.nombre}}, {{factura.total}} o {{lead.fuente}} para que cada email se adapte automáticamente al destinatario.",
              },
              {
                q: "¿Qué pasa si mi cliente no tiene email?",
                a: "Si el contacto no tiene email registrado en ClientLabs, la automatización no se ejecuta y queda registrado en el log de actividad.",
              },
              {
                q: "¿Puedo desactivar una automatización en cualquier momento?",
                a: "Sí. Con un solo click en el toggle. La automatización queda inactiva inmediatamente y deja de ejecutarse hasta que la vuelvas a activar.",
              },
              {
                q: "¿Cuántos emails puedo enviar?",
                a: "Actualmente no hay límite en el plan de lanzamiento. En el futuro estableceremos límites según el plan, siempre con márgenes muy generosos para autónomos y pequeños negocios.",
              },
              {
                q: "¿Los emails pueden ir a spam?",
                a: "La infraestructura que usamos (Resend con autenticación SPF, DKIM y DMARC) está optimizada para máxima entregabilidad. Los emails enviados desde dominios propios verificados tienen aún mejor tasa de entrega.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="bg-white border border-slate-200 rounded-2xl group"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="text-[14px] font-semibold text-slate-800">
                    {item.q}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-[13px] text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <div className="bg-[#E1F5EE] border border-[#1FA97A]/20 rounded-2xl p-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#1FA97A] flex items-center justify-center mx-auto mb-3">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-[16px] font-bold text-slate-900 mb-2">
            Empieza a automatizar hoy
          </h3>
          <p className="text-[13px] text-slate-500 mb-4 max-w-md mx-auto">
            Tienes 6 automatizaciones listas para activar ahora mismo. Cada una trabaja
            por ti mientras tú te dedicas a lo que realmente importa.
          </p>
          <button
            onClick={() => router.push("/dashboard/automatizaciones")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1FA97A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1a9068] transition-colors"
          >
            Ver mis automatizaciones
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  )
}
