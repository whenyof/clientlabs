"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  UserCircle,
  Clock,
  Package,
  Trophy,
} from "lucide-react"
import { toast } from "sonner"
import { Navbar } from "../ui/chrome"

// ─── DATA ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Aplicas",
    desc: "Rellenas el formulario al final de esta página. 5 minutos. Te preguntamos a qué te dedicas y por qué crees que encajas.",
  },
  {
    num: "02",
    title: "Llamada de 15 minutos",
    desc: "Si encajas, te escribo en menos de 48h para agendar una videollamada corta. Te enseño el panel por dentro y resolvemos dudas.",
  },
  {
    num: "03",
    title: "Firmamos el acuerdo",
    desc: "Si los dos queremos seguir, te paso el acuerdo de colaboración (1-2 páginas). Lo firmamos digitalmente y ya eres Embajador Fundador.",
  },
  {
    num: "04",
    title: "Acceso anticipado + materiales",
    desc: "Recibes acceso al producto 2 semanas antes del lanzamiento, tu enlace único de tracking y todos los materiales de marketing.",
  },
  {
    num: "05",
    title: "Lanzamiento y comisiones",
    desc: "El 23 de junio lanzamos. Cada cliente desde tu enlace queda atribuido automáticamente. Cobras el día 5 de cada mes.",
  },
]

const FAQS = [
  {
    q: "¿Y si no consigo traer ningún cliente?",
    a: "Nada. No hay cuotas ni penalizaciones. Lo único que pierdes es el tiempo que dediques a publicar. Y la cuenta lifetime gratis te la quedas igual por entrar como Embajador Fundador.",
  },
  {
    q: "¿Cómo sabéis que un cliente lo he traído yo?",
    a: "Cada embajador tiene un enlace único de tracking. Cualquier cliente que se registre desde tu enlace queda atribuido a ti automáticamente. Si alguien viene por otra vía pero te menciona, también te lo asigno manualmente.",
  },
  {
    q: "¿Cuándo cobro las comisiones?",
    a: "El día 5 de cada mes te pago las comisiones del mes anterior, contra factura tuya. Tienes acceso a un panel donde ves en tiempo real qué clientes has traído y cuánto llevas generado.",
  },
  {
    q: "¿Tengo que estar dado de alta como autónomo desde ya?",
    a: "No. Durante la fase de pre-lanzamiento no hay dinero moviéndose. Solo necesitas estar dado de alta cuando empiecen las comisiones reales, a partir del 23 de junio.",
  },
  {
    q: "¿Esto no es un esquema piramidal o MLM?",
    a: "No. En un MLM cobras por reclutar a otros embajadores. Aquí solo cobras por clientes finales que pagan por usar el producto. No hay niveles, no hay reclutamiento, no hay cuota de entrada.",
  },
  {
    q: "¿Y si ClientLabs no funciona o cierra el proyecto?",
    a: "Si el proyecto cierra, las comisiones desaparecen porque no hay clientes pagando. Lo planteo con transparencia: tengo el producto funcionando y el plugin de WordPress aprobado en el directorio oficial. El riesgo de cualquier proyecto early existe.",
  },
  {
    q: "¿Cuántas horas tengo que dedicarle?",
    a: "Las que quieras. Lo único obligatorio es publicar 4 piezas de contenido en los 30 días previos al lanzamiento. Después, cero obligación. Cuanto más promociones, más cobras.",
  },
  {
    q: "¿Puedo promocionar otras herramientas?",
    a: "Pido que no promociones competencia directa española durante el acuerdo. Otras herramientas no relacionadas, sin problema.",
  },
  {
    q: "¿Qué pasa si dejo de ser embajador más adelante?",
    a: "Sigues cobrando las comisiones de los clientes que ya hayas traído mientras sigan activos. No pierdes lo ganado.",
  },
  {
    q: "¿Cuántos embajadores vais a coger?",
    a: "20 plazas. Solo va a existir una vez con estas condiciones. Después abriremos un programa público de afiliados con porcentajes mucho menores.",
  },
]

const SCENARIOS = [
  { clientes: "5 clientes", year1: "1.220€", year3: "2.440€" },
  { clientes: "10 clientes", year1: "1.940€", year3: "4.380€" },
  { clientes: "20 clientes", year1: "3.380€", year3: "8.260€" },
  { clientes: "50 clientes", year1: "7.700€", year3: "20.500€" },
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
    autonomo: "",
    acepto: false,
  })
  const [sending, setSending] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
    await new Promise((r) => setTimeout(r, 800))
    toast.success("¡Solicitud recibida! Te respondo en menos de 48h.")
    setForm({
      nombre: "",
      email: "",
      telefono: "",
      web: "",
      dedicacion: "",
      porQue: "",
      aQuien: "",
      autonomo: "",
      acepto: false,
    })
    setSending(false)
  }

  const inputCls =
    "w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] text-slate-700 outline-none focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 placeholder:text-slate-300"

  return (
    <>
      <Navbar />

      <main className="pt-[72px]">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="bg-[#0B1F2A] relative overflow-hidden">
          {/* Grid de fondo */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(31,169,122,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(31,169,122,0.06)_1px,transparent_1px)] bg-[size:30px_30px]" />

          <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1FA97A]/30 bg-[#1FA97A]/10 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1FA97A] animate-pulse" />
              <span className="text-[11px] font-semibold text-[#1FA97A] uppercase tracking-widest">
                Programa de Embajadores Fundadores · 20 plazas
              </span>
            </div>

            <h1 className="text-[42px] md:text-[56px] font-bold text-white leading-tight tracking-tight mb-6">
              Ayúdanos a llevar ClientLabs
              <br />
              a 1.000 autónomos españoles.
              <br />
              <span className="text-[#1FA97A]">Llévate el 40% recurrente.</span>
            </h1>

            <p className="text-[17px] text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
              Buscamos 20 personas con red real en el ecosistema autónomo
              español para construir el lanzamiento de ClientLabs. La mejor
              oferta que vamos a hacer en toda la vida del producto.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a
                href="#formulario"
                className="px-8 py-4 bg-[#1FA97A] text-white font-semibold text-[15px] rounded-xl hover:bg-[#1a9068] transition-colors shadow-lg shadow-[#1FA97A]/20"
              >
                Quiero ser Embajador Fundador →
              </a>
              <a
                href="#como-funciona"
                className="px-8 py-4 border border-slate-700 text-slate-300 font-medium text-[15px] rounded-xl hover:border-slate-500 transition-colors"
              >
                Cómo funciona
              </a>
            </div>

            {/* Barra de progreso de plazas */}
            <div className="max-w-sm mx-auto">
              <div className="flex justify-between text-[11px] text-slate-500 mb-2">
                <span>Plazas ocupadas</span>
                <span>1 de 20</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[5%] bg-[#1FA97A] rounded-full" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Cierra el 30 de mayo de 2026
              </p>
            </div>
          </div>
        </section>

        {/* ── POR QUÉ EXISTE ───────────────────────────────────────────────── */}
        <section className="bg-white py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="flex gap-6">
              <div className="shrink-0 mt-1">
                <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-[#1FA97A]" />
                </div>
              </div>
              <div className="space-y-4 text-[15px] text-slate-600 leading-relaxed">
                <p>
                  Soy Iyan. Llevo meses construyendo ClientLabs solo. Sin
                  equipo, sin inversión, sin advisors. Yo, un portátil y la
                  convicción de que el autónomo español merece una herramienta
                  pensada para él.
                </p>
                <p>
                  Lanzo el 23 de junio de 2026. Tengo el producto listo, el
                  plugin de WordPress aprobado en el directorio oficial y el SDK
                  funcionando. Lo único que no tengo es lo que más necesito:
                  gente que crea en esto y lo difunda en su red.
                </p>
                <p>
                  Sé que podría gastar 5.000€ en ads de Meta y conseguir
                  tráfico frío que no convierte. Pero a un autónomo no le
                  compra un anuncio. A un autónomo le compra otro autónomo
                  diciéndole "esto me cambió la vida".
                </p>
                <p>
                  Por eso prefiero coger ese presupuesto y dárselo a 20
                  personas reales. Vosotros lleváis las comisiones más
                  generosas del sector, yo llevo los clientes que necesito para
                  que ClientLabs arranque con fuerza el día del lanzamiento.
                </p>
                <p className="font-bold text-[#0B1F2A] text-[16px]">
                  Sin trampas. Sin letra pequeña.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUÉ RECIBEN ──────────────────────────────────────────────────── */}
        <section className="bg-[#0B1F2A] py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-[32px] md:text-[40px] font-bold text-white mb-3">
                Lo que recibes como Embajador Fundador
              </h2>
              <p className="text-slate-400 text-[15px]">
                Solo disponible para los primeros 20. No volvemos a ofrecer
                estas condiciones.
              </p>
            </div>

            {/* 4 tarjetas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Tarjeta 1 */}
              <div className="border border-[#1FA97A]/40 rounded-xl p-6 bg-[#1FA97A]/5">
                <div className="text-[48px] font-bold text-[#1FA97A] leading-none mb-2">
                  40%
                </div>
                <div className="text-white font-semibold text-[16px] mb-2">
                  Comisión recurrente año 1
                </div>
                <p className="text-slate-400 text-[13px] leading-relaxed">
                  De cada pago mensual de cada cliente que traigas durante los
                  primeros 12 meses.
                </p>
              </div>

              {/* Tarjeta 2 */}
              <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                <div className="text-[48px] font-bold text-white leading-none mb-2">
                  20%
                </div>
                <div className="text-white font-semibold text-[16px] mb-2">
                  Comisión de por vida
                </div>
                <p className="text-slate-400 text-[13px] leading-relaxed">
                  A partir del mes 13, mientras el cliente siga activo. Sin
                  caducidad.
                </p>
              </div>

              {/* Tarjeta 3 */}
              <div className="border border-amber-400/20 rounded-xl p-6 bg-amber-400/5">
                <div className="text-[48px] font-bold text-amber-400 leading-none mb-2">
                  500€
                </div>
                <div className="text-white font-semibold text-[16px] mb-2">
                  Bonus primeros 5 clientes
                </div>
                <p className="text-slate-400 text-[13px] leading-relaxed">
                  100€ extra por cada uno de tus 5 primeros clientes. Además de
                  la comisión.
                </p>
              </div>

              {/* Tarjeta 4 */}
              <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                <div className="text-[48px] font-bold text-white leading-none mb-2">
                  Gratis
                </div>
                <div className="text-white font-semibold text-[16px] mb-2">
                  Cuenta ClientLabs lifetime
                </div>
                <p className="text-slate-400 text-[13px] leading-relaxed">
                  Plan completo, todas las features, para siempre. Para ti
                  personalmente.
                </p>
              </div>
            </div>

            {/* 3 tarjetas secundarias */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-white/10 rounded-xl p-5 bg-white/5 flex gap-4 items-start">
                <Clock className="w-5 h-5 text-[#1FA97A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold text-[14px] mb-1">
                    Acceso anticipado
                  </div>
                  <p className="text-slate-400 text-[12px] leading-relaxed">
                    2 semanas antes del lanzamiento público
                  </p>
                </div>
              </div>
              <div className="border border-white/10 rounded-xl p-5 bg-white/5 flex gap-4 items-start">
                <Package className="w-5 h-5 text-[#1FA97A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold text-[14px] mb-1">
                    Materiales listos
                  </div>
                  <p className="text-slate-400 text-[12px] leading-relaxed">
                    Capturas, vídeos y copy para tus redes
                  </p>
                </div>
              </div>
              <div className="border border-white/10 rounded-xl p-5 bg-white/5 flex gap-4 items-start">
                <Trophy className="w-5 h-5 text-[#1FA97A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold text-[14px] mb-1">
                    Top 3 del año
                  </div>
                  <p className="text-slate-400 text-[12px] leading-relaxed">
                    250€ inmediatos + 1.000€ bonus anual
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LA MATEMÁTICA REAL ───────────────────────────────────────────── */}
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#0B1F2A] mb-3">
                La matemática real
              </h2>
              <p className="text-slate-500 text-[15px]">
                Sin inflaciones. Sin letra pequeña. Esto es lo que puedes
                esperar.
              </p>
            </div>

            {/* Ejemplo concreto */}
            <div className="bg-[#E1F5EE] rounded-2xl p-8 mb-10">
              <p className="text-[#0B1F2A] font-semibold text-[15px] mb-6">
                Ejemplo: traes 1 cliente a 30€/mes que se queda 3 años:
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { label: "Año 1", value: "144€", sub: "(40% de 360€)" },
                  { label: "Año 2", value: "72€", sub: "(20% de 360€)" },
                  { label: "Año 3", value: "72€", sub: "(20% de 360€)" },
                  { label: "Bonus de bienvenida", value: "100€", sub: "" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-emerald-200/60 pb-3"
                  >
                    <span className="text-slate-600 text-[14px]">
                      {row.label}
                      {row.sub && (
                        <span className="text-slate-400 ml-2 text-[12px]">
                          {row.sub}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-[#0B1F2A] text-[15px]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-600 text-[15px]">Total:</span>
                <span className="text-[32px] font-bold text-[#1FA97A]">
                  388€ por un solo cliente
                </span>
              </div>
            </div>

            {/* Tabla de escenarios */}
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="bg-[#0B1F2A]">
                    <th className="px-6 py-4 text-left text-[#1FA97A] font-semibold">
                      Clientes traídos
                    </th>
                    <th className="px-6 py-4 text-right text-slate-300 font-semibold">
                      Año 1
                    </th>
                    <th className="px-6 py-4 text-right text-slate-300 font-semibold">
                      3 años acumulados
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SCENARIOS.map((row, i) => (
                    <tr
                      key={row.clientes}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-6 py-4 text-slate-700 font-medium border-b border-slate-100">
                        {row.clientes}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 border-b border-slate-100">
                        {row.year1}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-[#1FA97A] border-b border-slate-100">
                        {row.year3}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 text-center">
              Cálculos basados en plan de 30€/mes por cliente, retención 3
              años.
            </p>
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
              {/* Encajas si eres */}
              <div className="bg-white border border-emerald-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-[#0B1F2A] text-[15px]">
                    Encajas si eres...
                  </span>
                </div>
                <ul className="space-y-3">
                  {[
                    "Diseñador freelance con red de otros diseñadores",
                    "Consultor independiente con clientela autónoma",
                    "Desarrollador freelance o agencia pequeña de WordPress",
                    "Coach o formador con audiencia de pequeños negocios",
                    "Cualquier autónomo con red activa de +50 contactos",
                    "Creador de contenido sobre vida autónoma o productividad",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-[13px] text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-[6px] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* No encajas si */}
              <div className="bg-white border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="font-semibold text-[#0B1F2A] text-[15px]">
                    No encajas si...
                  </span>
                </div>
                <ul className="space-y-3">
                  {[
                    "No eres autónomo ni tienes negocio propio",
                    "Solo te interesa el dinero, no entiendes el producto",
                    "Buscas ingresos pasivos sin trabajar",
                    "Tu red son seguidores fríos, no contactos reales",
                    "Quieres promocionar también competencia directa",
                    "Esperas garantías de ingresos mensuales fijos",
                  ].map((item) => (
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
                Desde que aplicas hasta que cobras la primera comisión.
              </p>
            </div>

            <div className="space-y-2">
              {STEPS.map((step, idx) => (
                <div key={step.num}>
                  <div className="flex gap-6">
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="w-12 h-12 bg-[#0B1F2A] rounded-xl flex items-center justify-center">
                        <span className="text-[#1FA97A] font-bold text-[13px]">
                          {step.num}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className="w-px h-8 bg-slate-200 mt-2" />
                      )}
                    </div>
                    <div className="pb-6">
                      <div className="text-[#0B1F2A] font-semibold text-[16px] mb-1.5 mt-2.5">
                        {step.title}
                      </div>
                      <p className="text-slate-500 text-[14px] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
                Todo lo que necesitas saber antes de aplicar.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="font-medium text-[#0B1F2A] text-[14px] pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${openFaq === idx ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="border-t border-slate-100 px-6 pt-4 pb-5">
                      <p className="text-slate-500 text-[14px] leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORMULARIO ───────────────────────────────────────────────────── */}
        <section id="formulario" className="bg-[#0B1F2A] py-20">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-[32px] md:text-[40px] font-bold text-white mb-3">
                Aplica ahora
              </h2>
              <p className="text-slate-400 text-[15px]">
                5 minutos. Respondemos a todas las solicitudes en menos de 48h.
                Quedan solo{" "}
                <span className="text-[#1FA97A] font-semibold">19 plazas</span>.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Nombre */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre"
                      className={inputCls}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="tu@email.com"
                      className={inputCls}
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      required
                      placeholder="+34 600 000 000"
                      className={inputCls}
                    />
                  </div>

                  {/* Web */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      Web o perfil en redes *
                    </label>
                    <input
                      type="url"
                      name="web"
                      value={form.web}
                      onChange={handleChange}
                      required
                      placeholder="https://..."
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Dedicación */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                    ¿A qué te dedicas? *
                  </label>
                  <textarea
                    name="dedicacion"
                    value={form.dedicacion}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Diseñador freelance, consultor, formador..."
                    className={inputCls}
                  />
                </div>

                {/* Por qué encajas */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                    ¿Por qué crees que encajas como embajador?
                  </label>
                  <textarea
                    name="porQue"
                    value={form.porQue}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Cuéntanos tu red, tu audiencia, por qué te interesa..."
                    className={inputCls}
                  />
                </div>

                {/* A quién se lo recomendarías */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                    ¿A quién se lo recomendarías?
                  </label>
                  <textarea
                    name="aQuien"
                    value={form.aQuien}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe tu red o audiencia"
                    className={inputCls}
                  />
                </div>

                {/* Autónomo */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                    ¿Estás dado de alta como autónomo? *
                  </label>
                  <select
                    name="autonomo"
                    value={form.autonomo}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  >
                    <option value="">Seleccionar</option>
                    <option value="si">Sí, ya estoy dado de alta</option>
                    <option value="pronto">
                      No, pero me daré de alta antes del lanzamiento
                    </option>
                    <option value="no">
                      No y necesito asesoramiento
                    </option>
                  </select>
                </div>

                {/* Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acepto"
                    name="acepto"
                    checked={form.acepto}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 accent-[#1FA97A]"
                  />
                  <label
                    htmlFor="acepto"
                    className="text-[13px] text-slate-600 leading-relaxed cursor-pointer"
                  >
                    Acepto que ClientLabs me contacte para evaluar mi
                    candidatura
                  </label>
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 bg-[#1FA97A] text-white font-bold text-[15px] rounded-xl hover:bg-[#1a9068] transition-colors disabled:opacity-60"
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
              ¿Tienes dudas antes de aplicar?{" "}
              <Link
                href="/contacto"
                className="text-[#1FA97A] hover:underline"
              >
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
