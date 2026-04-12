"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  Clock,
  Package,
  Trophy,
  Send,
  Search,
  FileCheck,
  DollarSign,
} from "lucide-react"
import { toast } from "sonner"
import { Navbar } from "../ui/chrome"

// ─── DATA ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Solicitas tu plaza",
    desc: "Rellenas el formulario en menos de 3 minutos. Te preguntamos sobre tu red y por qué crees que encajas.",
    icon: Send,
  },
  {
    num: "02",
    title: "Revisamos tu solicitud",
    desc: "Evaluamos tu perfil y te respondemos en menos de 48h. Si encajas, te damos acceso inmediato al programa.",
    icon: Search,
  },
  {
    num: "03",
    title: "Aceptas los términos",
    desc: "Lees y aceptas el acuerdo de colaboración desde tu panel. Sin burocracia: todo digital y en menos de 2 minutos.",
    icon: FileCheck,
  },
  {
    num: "04",
    title: "Comparte y cobra",
    desc: "Cada cliente que se registre desde tu enlace queda atribuido automáticamente. Cobras el día 5 de cada mes.",
    icon: DollarSign,
  },
]

const FAQS = [
  {
    q: "¿Y si no consigo traer ningún cliente?",
    a: "Nada. No hay cuotas ni penalizaciones. Lo único que pierdes es el tiempo que dediques a compartirlo. La cuenta lifetime gratis te la quedas igual por entrar como Embajador.",
  },
  {
    q: "¿Cómo sabéis que un cliente lo he traído yo?",
    a: "Cada embajador tiene un enlace único de tracking. Cualquier cliente que se registre desde tu enlace queda atribuido a ti automáticamente. Si alguien viene por otra vía pero te menciona, también te lo asignamos manualmente.",
  },
  {
    q: "¿Cuándo cobro las comisiones?",
    a: "El día 5 de cada mes te pagamos las comisiones del mes anterior, contra factura tuya. Tienes acceso a un panel donde ves en tiempo real qué clientes has traído y cuánto llevas generado.",
  },
  {
    q: "¿Y si ClientLabs cierra el proyecto?",
    a: "Si el proyecto cerrara, las comisiones dejarían de existir porque no habría clientes pagando. Lo planteamos con total transparencia.",
  },
  {
    q: "¿Puedo promocionar otras herramientas?",
    a: "Pedimos que no promociones competencia directa española durante el acuerdo. Otras herramientas no relacionadas, sin problema.",
  },
]

const FIT_YES = [
  "Diseñador freelance con red de otros diseñadores",
  "Consultor independiente con clientela propia",
  "Desarrollador freelance o agencia pequeña",
  "Coach o formador con audiencia de pequeños negocios",
  "Persona con red activa de +50 contactos relevantes",
  "Creador de contenido sobre vida autónoma o productividad",
]

const FIT_NO = [
  "Solo te interesa el dinero, no entiendes el producto",
  "Buscas ingresos pasivos sin ningún esfuerzo",
  "Tu red son seguidores fríos, no contactos reales",
  "Quieres promocionar también competencia directa",
  "Esperas garantías de ingresos mensuales fijos",
]

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function EmbajadoresPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    web: "",
    dedicacion: "",
    porQue: "",
    aQuien: "",
    acepto: false,
  })
  const [sending, setSending] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.acepto) {
      toast.error("Debes aceptar que te contactemos.")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/embajadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success("Solicitud recibida. Te enviamos un email de confirmación.")
      setForm({ nombre: "", email: "", telefono: "", web: "", dedicacion: "", porQue: "", aQuien: "", acepto: false })
    } catch {
      toast.error("Error al enviar. Inténtalo de nuevo.")
    } finally {
      setSending(false)
    }
  }

  const inputCls =
    "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 placeholder:text-slate-300 bg-white resize-none"

  const labelCls = "block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"

  return (
    <>
      <Navbar />

      <main className="pt-[72px]">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="bg-[#0B1F2A] relative overflow-hidden min-h-screen flex items-center justify-center">
          {/* Grid de fondo */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(31,169,122,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(31,169,122,0.06)_1px,transparent_1px)] bg-[size:30px_30px]" />
          {/* Orbe verde difuso */}
          <div className="absolute w-96 h-96 bg-[#1FA97A]/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
            {/* Eyebrow */}
            <div className="hero-anim-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1FA97A]/30 bg-[#1FA97A]/10 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1FA97A] animate-pulse" />
              <span className="text-[11px] font-semibold text-[#1FA97A] uppercase tracking-widest">
                Programa de Embajadores · Plazas limitadas
              </span>
            </div>

            <h1 className="hero-anim-2 text-[42px] md:text-[56px] font-bold text-white leading-tight tracking-tight mb-6">
              Comparte ClientLabs.
              <br />
              <span className="text-[#1FA97A]">Llévate el 40% recurrente.</span>
            </h1>

            <p className="hero-anim-3 text-[17px] text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
              Buscamos personas con red real en el ecosistema freelance y pequeño
              negocio español. Comisiones de las más altas del sector, plazas limitadas.
            </p>

            <div className="hero-anim-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#formulario"
                className="px-8 py-4 bg-[#1FA97A] text-white font-semibold text-[15px] rounded-lg hover:bg-[#1a9068] transition-colors shadow-lg shadow-[#1FA97A]/20"
              >
                Solicitar plaza →
              </a>
              <a
                href="#como-funciona"
                className="px-8 py-4 border border-slate-700 text-slate-300 font-medium text-[15px] rounded-lg hover:border-slate-500 transition-colors"
              >
                Cómo funciona
              </a>
            </div>
          </div>
        </section>

        {/* ── LO QUE RECIBES ───────────────────────────────────────────────── */}
        <section className="bg-[#0B1F2A] py-20 border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-[32px] md:text-[40px] font-bold text-white mb-3">
                Lo que recibes como Embajador
              </h2>
              <p className="text-slate-400 text-[15px]">
                Acceso inmediato en cuanto aprobamos tu candidatura.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="border border-[#1FA97A]/40 rounded-xl p-6 bg-[#1FA97A]/5 hover:scale-[1.02] transition-transform duration-200">
                <div className="text-[48px] font-black text-[#1FA97A] leading-none mb-2">40%</div>
                <div className="text-white font-semibold text-[16px] mb-2">Comisión recurrente año 1</div>
                <p className="text-slate-400 text-[13px] leading-relaxed">
                  De cada pago mensual de cada cliente que traigas durante los primeros 12 meses.
                </p>
              </div>

              <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:scale-[1.02] transition-transform duration-200">
                <div className="text-[48px] font-black text-white leading-none mb-2">20%</div>
                <div className="text-white font-semibold text-[16px] mb-2">Comisión de por vida</div>
                <p className="text-slate-400 text-[13px] leading-relaxed">
                  A partir del mes 13, mientras el cliente siga activo. Sin caducidad.
                </p>
              </div>

              <div className="border border-amber-400/20 rounded-xl p-6 bg-amber-400/5 hover:scale-[1.02] transition-transform duration-200">
                <div className="text-[48px] font-black text-amber-400 leading-none mb-2">100€</div>
                <div className="text-white font-semibold text-[16px] mb-2">Bonus primeros 5 clientes</div>
                <p className="text-slate-400 text-[13px] leading-relaxed">
                  20€ por cada uno de tus primeros 5 clientes. Además de la comisión.
                </p>
              </div>

              <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:scale-[1.02] transition-transform duration-200">
                <div className="text-[48px] font-black text-white leading-none mb-2">Gratis</div>
                <div className="text-white font-semibold text-[16px] mb-2">Cuenta ClientLabs lifetime</div>
                <p className="text-slate-400 text-[13px] leading-relaxed">
                  Plan completo, todas las features, para siempre. Para ti personalmente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-white/10 rounded-xl p-5 bg-white/5 flex gap-4 items-start">
                <Clock className="w-5 h-5 text-[#1FA97A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold text-[14px] mb-1">Acceso inmediato</div>
                  <p className="text-slate-400 text-[12px] leading-relaxed">Al producto en cuanto se aprueba tu candidatura</p>
                </div>
              </div>
              <div className="border border-white/10 rounded-xl p-5 bg-white/5 flex gap-4 items-start">
                <Package className="w-5 h-5 text-[#1FA97A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold text-[14px] mb-1">Materiales listos</div>
                  <p className="text-slate-400 text-[12px] leading-relaxed">Capturas, vídeos y copy para tus redes</p>
                </div>
              </div>
              <div className="border border-white/10 rounded-xl p-5 bg-white/5 flex gap-4 items-start">
                <Trophy className="w-5 h-5 text-[#1FA97A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold text-[14px] mb-1">Top 3 del año</div>
                  <p className="text-slate-400 text-[12px] leading-relaxed">250€ inmediatos + 1.000€ bonus anual</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── A QUIÉN BUSCAMOS ─────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#0B1F2A] mb-3">
                A quién buscamos
              </h2>
              <p className="text-slate-500 text-[15px]">
                No buscamos influencers. Buscamos personas con red real.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-emerald-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-[#0B1F2A] text-[15px]">Encajas si...</span>
                </div>
                <ul className="space-y-3">
                  {FIT_YES.map((item) => (
                    <li key={item} className="flex gap-3 text-[13px] text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-[6px] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="font-semibold text-[#0B1F2A] text-[15px]">No encajas si...</span>
                </div>
                <ul className="space-y-3">
                  {FIT_NO.map((item) => (
                    <li key={item} className="flex gap-3 text-[13px] text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-300 mt-[6px] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────── */}
        <section id="como-funciona" className="bg-white py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#0B1F2A] mb-3">
                Cómo funciona
              </h2>
              <p className="text-slate-500 text-[15px]">
                Desde que solicitas tu plaza hasta que cobras la primera comisión.
              </p>
            </div>

            <div className="space-y-3">
              {STEPS.map((step, idx) => {
                const Icon = step.icon
                const isOdd = idx % 2 === 0
                return (
                  <div
                    key={step.num}
                    className={`group flex gap-5 items-start p-5 rounded-xl border transition-all duration-200 hover:border-[#1FA97A]/50 ${
                      isOdd
                        ? "bg-white border-[#1FA97A]/20"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full bg-[#1FA97A]/10 border border-[#1FA97A]/30 flex items-center justify-center">
                        <span className="text-[#1FA97A] font-black text-[18px]">{step.num}</span>
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-4 h-4 text-[#1FA97A]" />
                        <span className="text-[#0B1F2A] font-semibold text-[15px]">{step.title}</span>
                      </div>
                      <p className="text-slate-500 text-[13px] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#0B1F2A] mb-3">
                Preguntas frecuentes
              </h2>
              <p className="text-slate-500 text-[15px]">
                Todo lo que necesitas saber antes de solicitar tu plaza.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={idx}
                    className={`rounded-xl overflow-hidden bg-white transition-all duration-200 ${
                      isOpen
                        ? "border-l-[3px] border-l-[#1FA97A] border border-[#1FA97A]/20 bg-[#E1F5EE]/30"
                        : "border border-slate-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left"
                    >
                      <span className="font-medium text-[#0B1F2A] text-[14px] pr-4">{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: isOpen ? "200px" : "0px" }}
                    >
                      <div className="border-t border-slate-100 px-6 pt-4 pb-5">
                        <p className="text-slate-500 text-[14px] leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── FORMULARIO ───────────────────────────────────────────────────── */}
        <section id="formulario" className="bg-[#0B1F2A] py-20">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-[32px] md:text-[40px] font-bold text-white mb-3">
                Solicita tu plaza
              </h2>
              <p className="text-slate-400 text-[15px]">
                Menos de 3 minutos. Respondemos a todas las solicitudes en menos de 48h.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nombre completo *</label>
                    <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Tu nombre" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Teléfono / WhatsApp *</label>
                    <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} required placeholder="+34 600 000 000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Web o perfil en redes *</label>
                    <input type="url" name="web" value={form.web} onChange={handleChange} required placeholder="https://..." className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>¿A qué te dedicas? *</label>
                  <textarea name="dedicacion" value={form.dedicacion} onChange={handleChange} required rows={2} placeholder="Diseñador freelance, consultor, formador..." className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>¿Por qué crees que encajas?</label>
                  <textarea name="porQue" value={form.porQue} onChange={handleChange} rows={2} placeholder="Tu red, audiencia, por qué te interesa..." className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>¿A quién se lo recomendarías?</label>
                  <textarea name="aQuien" value={form.aQuien} onChange={handleChange} rows={2} placeholder="Describe tu red o audiencia" className={inputCls} />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acepto"
                    name="acepto"
                    checked={form.acepto}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 accent-[#1FA97A]"
                  />
                  <label htmlFor="acepto" className="text-[13px] text-slate-600 leading-relaxed cursor-pointer">
                    Acepto que ClientLabs me contacte para evaluar mi candidatura
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 bg-[#1FA97A] text-white font-bold text-[15px] rounded-lg hover:bg-[#1a9068] transition-colors disabled:opacity-60"
                >
                  {sending ? "Enviando..." : "Enviar solicitud"}
                </button>

                <p className="text-[12px] text-slate-400 text-center">
                  Respondemos a todas las solicitudes en menos de 48h.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
        <section className="bg-[#0B1F2A] border-t border-slate-800 py-12">
          <div className="max-w-xl mx-auto px-6 text-center">
            <p className="text-slate-500 text-[13px]">
              ¿Tienes dudas antes de solicitar?{" "}
              <Link href="/contacto" className="text-[#1FA97A] hover:underline">
                Escríbenos directamente
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
