"use client"

import { useState } from "react"
import Link from "next/link"
import { UserPlus, Building2, Globe, Code, ChevronDown, ChevronUp } from "lucide-react"
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

const sidebarLinks = [
  { id: "primeros-pasos", label: "Primeros pasos" },
  { id: "modulos", label: "Módulos" },
  { id: "faq", label: "Preguntas frecuentes" },
  { id: "soporte", label: "Soporte" },
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
                  <p className="text-[13px] text-slate-500">Los leads sin actividad durante 7 días pasan automáticamente a estado "Estancado".</p>
                </div>
                <div className="border border-slate-200 rounded-xl p-5">
                  <h3 className="text-[15px] font-semibold mb-2">2.2 Gestión de clientes</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed">Crea clientes manualmente o impórtalos desde CSV (columnas: nombre, email, teléfono, empresa). Cada cliente tiene una ficha con datos de contacto, historial de ventas, notas y seguimiento. Registra ventas y visualiza el valor total por cliente.</p>
                </div>
                <div className="border border-slate-200 rounded-xl p-5">
                  <h3 className="text-[15px] font-semibold mb-2">2.3 Facturación</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed">Genera facturas legales en segundos. Configura tus datos fiscales una sola vez y selecciona el cliente al crear cada factura. Envíala por email directamente desde la plataforma. Registra pagos y gestiona facturas vencidas desde el panel.</p>
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

          </div>
        </div>
      </div>
    </main>
  )
}
