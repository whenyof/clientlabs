"use client"

import { useState } from "react"
import Link from "next/link"
import {
  UserPlus, Building2, Globe, Code, ChevronDown, ChevronUp,
  Mail, Bell, AlertCircle, RefreshCw,
} from "lucide-react"
import { Navbar } from "../ui/chrome"

const faqs = [
  {
    q: "¿Puedo importar mis clientes de Excel?",
    a: "Sí. Desde el panel de clientes, usa el botón 'Importar CSV'. Las columnas necesarias son: nombre, email, teléfono y empresa (esta última opcional).",
  },
  {
    q: "¿Las facturas son legales en España?",
    a: "Sí. Nuestro sistema cumple los requisitos de la AEAT: número de serie correlativo, desglose de IVA, datos fiscales completos del emisor y receptor, y compatibilidad con Verifactu.",
  },
  {
    q: "¿Cómo funciona el scoring de leads?",
    a: "El scoring asigna puntos según el estado: Nuevo 10 pts, Contactado 25 pts, Cualificado 50 pts, Convertido 100 pts. Se actualiza automáticamente al cambiar de estado.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí. Ve a Ajustes → Suscripción y cancela cuando quieras. No hay permanencia. El acceso se mantiene hasta el final del período facturado.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Todos los datos viajan cifrados con TLS. Los servidores están en la Unión Europea. Cumplimos el RGPD y nunca vendemos datos a terceros.",
  },
  {
    q: "¿Qué pasa si supero los límites del plan?",
    a: "Recibirás un aviso cuando llegues al 80% del límite. Puedes cambiar de plan en cualquier momento desde Ajustes → Suscripción.",
  },
]

const startCards = [
  { Icon: UserPlus, title: "Crear tu cuenta", desc: "Registro en menos de 2 minutos, verificación por email y configuración inicial guiada." },
  { Icon: Building2, title: "Configurar tu perfil fiscal", desc: "Añade tu NIF, razón social y dirección fiscal para generar facturas legales desde el primer día." },
  { Icon: Globe, title: "Instalar el plugin de WordPress", desc: "Disponible en el directorio oficial. Solo necesitas tu API key. Conecta formularios en minutos." },
  { Icon: Code, title: "Añadir el SDK en tu web", desc: "Una línea de código en el head. Verifica que los leads llegan correctamente desde el panel." },
]

const integrationCards = [
  {
    title: "5.1 HTML puro",
    desc: "Añade este script en el head de tu web. Compatible con cualquier tecnología.",
    code: `<script\n  src="https://clientlabs.io/sdk.js"\n  data-api-key="TU_API_KEY"\n  data-form-id="contact">\n</script>`,
  },
  {
    title: "5.2 WordPress",
    desc: "Plugin oficial disponible en el directorio de WordPress.org.",
    steps: [
      "Instalar plugin «Lead Capture for ClientLabs»",
      "Ir a Ajustes → ClientLabs",
      "Pegar la API key",
      "Añadir shortcode [clientlabs_form]",
    ],
  },
  {
    title: "5.3 Webflow",
    desc: "Añade el script desde Project Settings → Custom Code → Head Code. No se requiere ninguna instalación adicional.",
  },
  {
    title: "5.4 Wix",
    desc: "Añade el código desde Wix Settings → Custom Code → Add Code to Pages. Selecciona «All Pages» para que aplique en toda la web.",
  },
]

const automationCards = [
  {
    Icon: Mail,
    title: "Email de bienvenida al nuevo lead",
    desc: "Se envía automáticamente cuando llega un lead nuevo. Personalizable desde Ajustes → Automatizaciones.",
  },
  {
    Icon: Bell,
    title: "Recordatorio si lead sin respuesta",
    desc: "Si un lead lleva X días sin respuesta, ClientLabs te avisa por email para que hagas seguimiento.",
  },
  {
    Icon: AlertCircle,
    title: "Notificación de factura vencida",
    desc: "Recibe un aviso cuando una factura lleva más de 30 días sin pagar.",
  },
  {
    Icon: RefreshCw,
    title: "Email de seguimiento a cliente inactivo",
    desc: "Si un cliente lleva 60 días sin actividad, se activa un recordatorio automático.",
  },
]

const billingItems = [
  {
    title: "7.1 Configurar datos fiscales",
    desc: "Ve a Ajustes → Perfil fiscal. Campos: NIF/CIF, Razón social, Dirección fiscal, Código postal, Ciudad, País. Estos datos aparecen automáticamente en todas tus facturas.",
  },
  {
    title: "7.2 Series de facturación",
    desc: "Por defecto: FAC-2026-0001. Puedes personalizar el prefijo desde Ajustes → Facturación. El número se incrementa automáticamente.",
  },
  {
    title: "7.3 Tipos de IVA",
    desc: "21% (servicios generales), 10% (hostelería, transporte), 4% (libros, medicamentos), 0% (operaciones exentas). Selecciona el tipo al crear cada línea de factura.",
  },
  {
    title: "7.4 Generar y enviar PDF",
    desc: "Desde la factura, haz clic en «Descargar PDF». El PDF incluye todos los datos fiscales y cumple con los requisitos de la AEAT. También puedes enviar por email directamente desde la plataforma.",
  },
  {
    title: "7.5 Registrar pagos",
    desc: "Abre la factura → «Registrar pago» → introduce importe, fecha y método. Puedes registrar pagos parciales para facturas en varios plazos.",
  },
]

const accountCards = [
  {
    title: "8.1 Cambiar de plan",
    desc: "Ajustes → Suscripción → «Cambiar plan». El cambio es inmediato. Si subes de plan, se hace un prorrateo del periodo restante.",
  },
  {
    title: "8.2 Cancelar suscripción",
    desc: "Ajustes → Suscripción → «Cancelar». El acceso se mantiene hasta el fin del periodo pagado. Tus datos se conservan 30 días adicionales.",
  },
  {
    title: "8.3 Exportar datos",
    desc: "Ajustes → Privacidad → «Exportar mis datos». Recibirás un ZIP con tus clientes, leads y facturas en formato CSV y PDF.",
  },
  {
    title: "8.4 Añadir colaborador",
    desc: "Disponible en planes Profesional y Agencia. Ajustes → Equipo → «Invitar colaborador». Introduce el email y asigna el rol.",
  },
]

const sidebarLinks = [
  { id: "primeros-pasos", label: "Primeros pasos" },
  { id: "modulos", label: "Módulos" },
  { id: "faq", label: "Preguntas frecuentes" },
  { id: "soporte", label: "Soporte" },
  { id: "integracion", label: "Integración con tu web" },
  { id: "automatizaciones", label: "Automatizaciones" },
  { id: "facturacion-avanzada", label: "Facturación avanzada" },
  { id: "cuenta", label: "Cuenta y suscripción" },
]

export default function DocsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-white text-[#0B1F2A]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Documentación</h1>
          <p className="mt-3 text-[16px] text-slate-500">Todo lo que necesitas para sacar el máximo partido a ClientLabs.</p>
        </div>

        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden md:block w-48 shrink-0">
            <nav className="sticky top-20 space-y-1">
              {sidebarLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="block px-3 py-2 text-[13px] text-slate-600 rounded-lg hover:bg-slate-50 hover:text-[#1FA97A] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-14">

            {/* Section 1 */}
            <section id="primeros-pasos">
              <h2 className="text-[20px] font-bold mb-6">Primeros pasos</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {startCards.map((c) => (
                  <div key={c.title} className="border border-slate-200 rounded-xl p-5">
                    <c.Icon className="w-5 h-5 text-[#1FA97A] mb-3" />
                    <h3 className="text-[14px] font-semibold mb-1">{c.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2 */}
            <section id="modulos">
              <h2 className="text-[20px] font-bold mb-6">Módulos</h2>
              <div className="space-y-6">
                <div className="border border-slate-200 rounded-xl p-5">
                  <h3 className="text-[15px] font-semibold mb-2">2.1 Gestión de leads</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-2">Los leads pasan por 5 estados: <strong>Nuevo → Contactado → Cualificado → Convertido → Perdido</strong>. Cada cambio de estado actualiza el scoring automáticamente. Puedes añadir notas, registrar interacciones (llamadas, emails, reuniones) y convertir un lead en cliente con un clic.</p>
                  <p className="text-[13px] text-slate-500 mb-2">Los leads sin actividad durante 7 días pasan automáticamente a estado "Estancado".</p>
                  <Link href="/blog/como-no-perder-clientes-seguimiento" className="text-[#1FA97A] hover:underline text-[13px]">
                    Leer: Cómo no perder clientes por no hacer seguimiento →
                  </Link>
                </div>
                <div className="border border-slate-200 rounded-xl p-5">
                  <h3 className="text-[15px] font-semibold mb-2">2.2 Gestión de clientes</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed">Crea clientes manualmente o impórtalos desde CSV (columnas: nombre, email, teléfono, empresa). Cada cliente tiene una ficha con datos de contacto, historial de ventas, notas y seguimiento. Registra ventas y visualiza el valor total por cliente.</p>
                </div>
                <div className="border border-slate-200 rounded-xl p-5">
                  <h3 className="text-[15px] font-semibold mb-2">2.3 Facturación</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-2">Genera facturas legales en segundos. Configura tus datos fiscales una sola vez y selecciona el cliente al crear cada factura. Envíala por email directamente desde la plataforma. Registra pagos y gestiona facturas vencidas desde el panel.</p>
                  <Link href="/blog/facturacion-autonomos-espana-2026" className="text-[#1FA97A] hover:underline text-[13px]">
                    Leer: Facturación para autónomos en España en 2026 →
                  </Link>
                </div>
                <div className="border border-slate-200 rounded-xl p-5">
                  <h3 className="text-[15px] font-semibold mb-2">2.4 Proveedores</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed">Añade tus proveedores habituales, gestiona pedidos y haz seguimiento de los estados: Pendiente, En proceso, Recibido. Mantén un registro centralizado de todos tus gastos a proveedores.</p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="faq">
              <h2 className="text-[20px] font-bold mb-6">Preguntas frecuentes</h2>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-[14px] font-medium">{faq.q}</span>
                      {openFaq === i
                        ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      }
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-[13px] text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4 */}
            <section id="soporte">
              <h2 className="text-[20px] font-bold mb-6">Soporte</h2>
              <div className="border border-slate-200 rounded-xl p-6">
                <p className="text-[14px] text-slate-700 leading-relaxed">
                  ¿No encuentras lo que buscas? Escríbenos a{" "}
                  <a href="mailto:hola@clientlabs.io" className="text-[#1FA97A] font-medium hover:underline">
                    hola@clientlabs.io
                  </a>{" "}
                  y respondemos en menos de 24h.
                </p>
              </div>
            </section>

            {/* Section 5 — Integración */}
            <section id="integracion">
              <h2 className="text-[20px] font-bold mb-6">Integración con tu web</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {integrationCards.map((card) => (
                  <div key={card.title} className="border border-slate-200 rounded-xl p-5">
                    <h3 className="text-[14px] font-semibold mb-2">{card.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-3">{card.desc}</p>
                    {card.code && (
                      <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-700 overflow-x-auto whitespace-pre-wrap">
                        {card.code}
                      </pre>
                    )}
                    {card.steps && (
                      <ol className="space-y-1.5 list-decimal list-inside">
                        {card.steps.map((step, i) => (
                          <li key={i} className="text-[13px] text-slate-600">{step}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6 — Automatizaciones */}
            <section id="automatizaciones">
              <h2 className="text-[20px] font-bold mb-6">Automatizaciones</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {automationCards.map((card) => (
                  <div key={card.title} className="border border-slate-200 rounded-xl p-5">
                    <card.Icon className="w-5 h-5 text-[#1FA97A] mb-3" />
                    <h3 className="text-[14px] font-semibold mb-1">{card.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 7 — Facturación avanzada */}
            <section id="facturacion-avanzada">
              <h2 className="text-[20px] font-bold mb-6">Facturación avanzada</h2>
              <div className="space-y-3">
                {billingItems.map((item) => (
                  <div key={item.title} className="border border-slate-200 rounded-xl p-5">
                    <h3 className="text-[14px] font-semibold mb-1">{item.title}</h3>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 8 — Cuenta y suscripción */}
            <section id="cuenta">
              <h2 className="text-[20px] font-bold mb-6">Cuenta y suscripción</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {accountCards.map((card) => (
                  <div key={card.title} className="border border-slate-200 rounded-xl p-5">
                    <h3 className="text-[14px] font-semibold mb-1">{card.title}</h3>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  )
}
