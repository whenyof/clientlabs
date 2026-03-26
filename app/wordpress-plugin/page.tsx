export const metadata = {
  title: "ClientLabs — WordPress Plugin",
  description:
    "Instala ClientLabs en WordPress en minutos. Captura leads, rastrea formularios y sincroniza datos con tu CRM sin tocar código.",
}

export default function WordPressPluginPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      {/* Hero */}
      <section className="border-b border-slate-100 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1FA97A]/10 text-[#1FA97A] text-xs font-semibold uppercase tracking-wider">
            WordPress Plugin
          </div>
          <h1 className="text-4xl font-bold text-slate-900 leading-tight">
            ClientLabs para WordPress
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Captura leads, rastrea formularios de Contact Form 7 y Elementor,
            y sincroniza tus datos con el CRM de ClientLabs — sin tocar una
            línea de código.
          </p>
          <a
            href="/api/downloads/wordpress-plugin"
            download="clientlabs-lead-capture.zip"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1FA97A] text-white font-semibold text-sm hover:bg-[#178f68] transition-colors shadow-md"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v8M5 7l3 3 3-3M3 13h10"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Descargar plugin (.zip)
          </a>
          <p className="text-xs text-slate-400">
            Compatible con WordPress 5.8+ · PHP 7.4+
          </p>
        </div>
      </section>

      {/* Qué hace */}
      <section className="py-14 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-8 text-center">
            ¿Qué incluye el plugin?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: "📋",
                title: "Captura de formularios",
                desc: "Compatible con Contact Form 7, Elementor Forms, Gravity Forms y formularios HTML nativos.",
              },
              {
                icon: "📍",
                title: "Page tracking automático",
                desc: "Registra visitas de página y sesiones sin configuración adicional.",
              },
              {
                icon: "🛒",
                title: "Integración WooCommerce",
                desc: "Rastrea carritos abandonados, intenciones de compra y pedidos completados.",
              },
              {
                icon: "🔑",
                title: "Configuración simple",
                desc: "Pega tu API Key en Ajustes → ClientLabs y el SDK queda activo al instante.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-5 border border-slate-200 flex gap-4"
              >
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{f.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instrucciones */}
      <section className="py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-10 text-center">
            Instalación en 3 pasos
          </h2>
          <ol className="space-y-6">
            {[
              {
                step: "1",
                title: "Descarga e instala el plugin",
                desc: 'Descarga el .zip, ve a tu WordPress → Plugins → Añadir nuevo → Subir plugin, selecciona el archivo y haz clic en "Instalar ahora".',
              },
              {
                step: "2",
                title: "Activa el plugin",
                desc: 'Haz clic en "Activar" tras la instalación. Aparecerá una nueva sección "ClientLabs" en el menú de Ajustes.',
              },
              {
                step: "3",
                title: "Pega tu API Key",
                desc: "Ve a Ajustes → ClientLabs, pega tu Public API Key (la encuentras en el dashboard bajo Conectar → SDK) y guarda. El SDK quedará activo en todo el sitio.",
              },
            ].map((s) => (
              <li key={s.step} className="flex gap-5">
                <div className="w-9 h-9 rounded-full bg-[#1FA97A] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA + Docs */}
      <section className="border-t border-slate-100 py-12 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-slate-900">¿Necesitas ayuda?</p>
            <p className="text-xs text-slate-500 mt-1">
              Consulta la documentación completa o contacta con soporte.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="https://docs.clientlabs.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Ver documentación
            </a>
            <a
              href="/api/downloads/wordpress-plugin"
              download="clientlabs-lead-capture.zip"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1FA97A] text-white text-sm font-medium hover:bg-[#178f68] transition-colors"
            >
              Descargar plugin
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
