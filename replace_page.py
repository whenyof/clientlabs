import sys

def process():
    with open('app/page.tsx', 'r') as f:
        lines = f.readlines()
        
    start_index = 0
    for i, line in enumerate(lines):
        if "{/* 4 PASOS - TIMELINE HORIZONTAL */}" in line:
            start_index = i
            break
            
    header_lines = lines[:start_index]
    
    new_content = """            {/* EL PROBLEMA */}
            <Section id="caos" className="bg-[#F4F7F9] w-full py-24">
                <div className="mx-auto flex w-full max-w-[1100px] flex-col px-6">
                    <motion.div variants={fadeUp} className="max-w-[800px] mb-16">
                        <h3 className="text-[32px] md:text-[40px] font-[700] text-[#0F1F2A] tracking-tight mb-6">El crecimiento sin sistema genera caos.</h3>
                        <p className="text-[18px] font-[500] text-[#5F7280] leading-relaxed">
                            Procesos fragmentados y decisiones desconectadas frenan la escalabilidad operativa de las empresas modernas.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Lista de problemas */}
                        <motion.div variants={fadeUp} className="flex flex-col gap-4">
                            {[
                                "Hojas de cálculo aisladas",
                                "Herramientas desconectadas",
                                "Procesos manuales propensos a error",
                                "Falta de visibilidad financiera",
                                "Decisiones sin datos consolidados"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-[#FFFFFF] border border-[#E2E8ED] p-5 rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#5F7280]" />
                                    <span className="text-[16px] font-[500] text-[#0F1F2A]">{item}</span>
                                </div>
                            ))}
                        </motion.div>

                        {/* Transformacion Operativa */}
                        <motion.div variants={fadeUp} transition={{ delay: 0.2 }} className="bg-[#FFFFFF] border border-[#E2E8ED] rounded-xl p-8 flex flex-col justify-between">
                            <h4 className="text-[24px] font-[600] text-[#0F1F2A] mb-8">De fragmentación a control estructurado.</h4>
                            
                            <div className="flex flex-col gap-8">
                                <div className="space-y-3">
                                    <p className="text-[13px] font-[600] text-[#5F7280] uppercase tracking-wider">Sin ClientLabs</p>
                                    <p className="text-[15px] font-[500] text-[#0F1F2A]">Herramientas aisladas y datos inconsistentes.</p>
                                </div>
                                <div className="h-px w-full bg-[#E2E8ED]" />
                                <div className="space-y-3">
                                    <p className="text-[13px] font-[600] text-[#157A5C] uppercase tracking-wider">Con ClientLabs</p>
                                    <p className="text-[15px] font-[600] text-[#0F1F2A]">Núcleo central. Flujos activos. Métricas confiables.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Section>

            {/* SOLUCIÓN */}
            <Section id="sistema" className="bg-[#FFFFFF] w-full py-24">
                <div className="mx-auto flex w-full max-w-[1100px] flex-col px-6">
                    <motion.div variants={fadeUp} className="space-y-4 mb-16 max-w-[800px]">
                        <h3 className="text-[32px] md:text-[40px] font-[700] text-[#0F1F2A] tracking-tight">Un núcleo operativo para estructurar tu negocio.</h3>
                        <p className="text-[18px] font-[500] text-[#5F7280] leading-relaxed">Conecta, centraliza y dirige sin fricciones técnicas.</p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                num: "1",
                                title: "Conecta tu infraestructura actual",
                                desc: "Integración directa con tus herramientas sin migraciones disruptivas.",
                            },
                            {
                                num: "2",
                                title: "Centraliza la información crítica",
                                desc: "Clientes, transacciones y eventos consolidados en un solo lugar.",
                            },
                            {
                                num: "3",
                                title: "Automatiza procesos clave",
                                desc: "Sistematización de cobros, onboarding y recuperación de forma confiable.",
                            },
                            {
                                num: "4",
                                title: "Dirige con visibilidad real",
                                desc: "Decisiones estratégicas basadas en dashboards precisos en tiempo real.",
                            },
                        ].map((step, idx) => (
                            <motion.div
                                key={step.num}
                                variants={fadeUp}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col gap-4 p-8 bg-[#F4F7F9] rounded-xl border border-[#E2E8ED]"
                            >
                                <span className="text-[16px] font-[700] text-[#0F1F2A]">{step.num}.</span>
                                <h4 className="text-[18px] font-[600] text-[#0F1F2A] leading-snug">{step.title}</h4>
                                <p className="text-[15px] font-[500] text-[#5F7280] leading-relaxed mt-1">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* PLATAFORMA MÓDULOS */}
            <Section id="modulos" className="bg-[#F4F7F9] w-full py-24">
                <div className="mx-auto flex w-full max-w-[1100px] flex-col px-6">
                    <motion.div variants={fadeUp} className="mb-16">
                        <h2 className="text-[32px] md:text-[40px] font-[700] text-[#0F1F2A] tracking-tight">Un núcleo que conecta todas tus áreas operativas.</h2>
                        <p className="mt-4 text-[18px] font-[500] text-[#5F7280] max-w-[700px]">
                            Módulos profesionales integrados nativamente para un flujo de trabajo empresarial sin soldaduras débiles.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: "CRM", desc: "Gestión unificada de ciclo de vida del cliente e interacciones." },
                            { name: "Pagos", desc: "Suscripciones, control de impagos, cobros y facturación." },
                            { name: "Automatizaciones", desc: "Flujos lógicos trazables para operaciones." },
                            { name: "Marketing", desc: "Comunicaciones y campañas transaccionales automatizadas." },
                            { name: "Analytics", desc: "Dashboards analíticos y proyecciones puras." },
                            { name: "Integraciones", desc: "API, webhooks y ecosistema abierto." },
                        ].map((module, idx) => (
                            <motion.div
                                key={module.name}
                                variants={fadeUp}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-[#FFFFFF] border border-[#E2E8ED] rounded-xl flex flex-col gap-2"
                            >
                                <p className="text-[18px] font-[600] text-[#0F1F2A]">{module.name}</p>
                                <p className="text-[15px] font-[500] text-[#5F7280] mt-1 line-clamp-2">{module.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* SOBRE CLIENTLABS & SOPORTE & DEVS */}
            <Section id="about" className="bg-[#FFFFFF] w-full py-24">
                <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-24 px-6">
                    
                    {/* Infraestructura */}
                    <motion.div variants={fadeUp}>
                        <h3 className="text-[28px] md:text-[36px] font-[700] text-[#0F1F2A] tracking-tight mb-6 max-w-[800px]">
                            Infraestructura diseñada para negocios que operan en serio.
                        </h3>
                        <p className="text-[18px] font-[500] text-[#5F7280] max-w-[800px] mb-12 leading-relaxed">
                            ClientLabs proporciona una capa de orquestación y visibilidad de grado empresarial sin forzarte a paralizar tu negocio para adoptarlo.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-6 opacity-60">
                            {["Stripe", "HubSpot", "AWS", "Google Cloud", "Meta", "WordPress", "Shopify"].map((logo) => (
                                <span key={logo} className="text-[16px] font-[600] text-[#0F1F2A]">{logo}</span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Contenedor de Soporte y Devs en 2 columnas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        
                        {/* Soporte */}
                        <motion.div variants={fadeUp} className="bg-[#F4F7F9] border border-[#E2E8ED] rounded-xl p-10">
                            <h4 className="text-[20px] font-[700] text-[#0F1F2A] mb-8">Acompañamiento profesional.</h4>
                            <div className="flex flex-col gap-5">
                                {["Onboarding estructurado", "Monitorización activa", "Soporte ingenieril continuo", "Acuerdos de nivel de servicio (SLA)"].map((item) => (
                                    <div key={item} className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#157A5C]" />
                                        <span className="text-[16px] font-[500] text-[#0F1F2A]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Desarrolladores */}
                        <motion.div variants={fadeUp} className="bg-[#F4F7F9] border border-[#E2E8ED] rounded-xl p-10">
                            <h4 className="text-[20px] font-[700] text-[#0F1F2A] mb-8">Arquitectura preparada para integraciones avanzadas.</h4>
                            <div className="bg-[#0F1F2A] rounded-xl p-6 font-mono text-[#F4F7F9] text-[13px] shadow-sm">
                                <p className="text-[#5F7280] mb-3">// Webhooks & REST API</p>
                                <p className="mb-2"><span className="text-[#1FA97A]">POST</span> /api/v1/sync</p>
                                <p className="mb-2"><span className="text-[#1FA97A]">GET</span> /api/v1/metrics</p>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </Section>

            {/* CTA FINAL */}
            <Section id="cta" className="bg-[#F4F7F9] w-full py-32 border-t border-[#E2E8ED]">
                <motion.div
                    variants={fadeUp}
                    className="mx-auto flex flex-col items-center text-center max-w-[800px] px-6"
                >
                    <h4 className="text-[36px] md:text-[48px] font-[700] text-[#0F1F2A] tracking-tight mb-8">
                        Empieza a operar con claridad.
                    </h4>
                    <p className="text-[18px] md:text-[20px] font-[500] text-[#5F7280] mb-12 leading-relaxed">
                        Conecta tus fuentes. Centraliza tus datos. Toma decisiones con información real.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
                        <a
                            href="/register"
                            className="inline-flex items-center justify-center rounded-[8px] px-10 py-5 text-[16px] font-[600] text-white transition-colors bg-[#157A5C] hover:bg-[#1FA97A] w-full sm:w-auto"
                        >
                            Crear cuenta
                        </a>
                    </div>
                </motion.div>
            </Section>

            <footer className="bg-[#FFFFFF] border-t border-[#E2E8ED] px-6 py-10 flex flex-col items-center text-center">
                <p className="text-[14px] font-[500] text-[#5F7280]">© {new Date().getFullYear()} ClientLabs. Infraestructura estructurada para negocios reales.</p>
            </footer>
        </main>
    )
}

// ---------- Hooks ----------

function useScrollSpy(ids: string[], threshold = 0.4) {
    const [active, setActive] = useState<string | null>(ids[0] ?? null)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id)
                    }
                })
            },
            { threshold }
        )
        ids.forEach((id) => {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [ids, threshold])
    return active
}

// ---------- Components ----------

function Section({
    children,
    id,
    className = "",
}: {
    children: React.ReactNode
    id: string
    className?: string
}) {
    return (
        <motion.section
            id={id}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className={`relative flex min-h-screen snap-start items-center ${className}`}
        >
            {children}
        </motion.section>
    )
}
"""
    
    with open('app/page.tsx', 'w') as f:
        f.writelines(header_lines)
        f.write(new_content)

if __name__ == "__main__":
    process()
