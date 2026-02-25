"use client"

import { useEffect } from "react"
import { motion, Variants } from "framer-motion"
import { Navbar } from "@/app/ui/chrome"
import Link from "next/link"

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

export default function Home() {
    useEffect(() => {
        if (typeof window === "undefined") return
        const nav = document.querySelector("nav")
        if (nav) {
            document.documentElement.style.setProperty("--nav-height", `${nav.clientHeight}px`)
        }
    }, [])

    return (
        <main className="relative bg-[#FFFFFF] antialiased scroll-smooth selection:bg-[#1FA97A] selection:text-white pb-0">
            <Navbar />

            {/* 1. HERO — BLOQUE OSCURO */}
            <section className="bg-[#0B1F2A] w-full pt-[calc(var(--nav-height,72px)+48px)] pb-16 relative border-b border-[#E2E8ED]/10 flex flex-col items-center">
                <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center space-y-6 text-center px-6">
                    <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-6 items-center max-w-[900px]">
                        <h1 className="text-balance text-[48px] md:text-[64px] font-[600] leading-[1.1] tracking-[-0.03em] text-[#E6F1F5]">
                            Infraestructura operativa para negocios que escalan.
                        </h1>
                        <p className="max-w-[700px] text-[18px] md:text-[22px] font-[400] leading-relaxed text-[#8FA6B2]">
                            Centraliza datos, automatiza procesos críticos y opera con visibilidad real desde un único núcleo.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }} className="flex flex-col gap-4 sm:flex-row">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center rounded-sm px-8 py-4 text-[16px] font-[500] text-white transition-colors bg-[#1FA97A] hover:bg-[#157A5C]"
                        >
                            Crear cuenta
                        </Link>
                        <Link
                            href="/demo"
                            className="inline-flex items-center justify-center rounded-sm px-8 py-4 text-[16px] font-[500] transition-colors border border-[#1FA97A] text-[#1FA97A] hover:bg-[#1FA97A]/10"
                        >
                            Ver demostración
                        </Link>
                    </motion.div>

                    {/* DASHBOARD PREVIEW */}
                    <div className="relative w-full flex justify-center mt-12 z-10 -mb-[60px]">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            transition={{ delay: 0.2 }}
                            className="relative w-full max-w-[1100px] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.25)] bg-[#0B1C24]"
                        >
                            {/* Fallback frame si no hay imagen real */}
                            <div className="relative w-full h-auto aspect-video flex bg-[#0B1C24] z-[1] rounded-lg overflow-hidden border border-[#F4F7F9]/10">
                                <div className="w-[15%] md:w-[20%] max-w-[240px] bg-[#061A22] h-full flex flex-col shrink-0 border-r border-[#E6F1F5]/5">
                                    <div className="h-[10%] min-h-[40px] max-h-[64px] bg-[#07212B] w-full px-4 flex items-center border-b border-[#E6F1F5]/5">
                                        <div className="hidden md:block w-[50%] h-4 bg-[#E6F1F5]/10 rounded-sm"></div>
                                    </div>
                                    <div className="p-4 space-y-4 pt-6 md:pt-8 flex flex-col items-center md:items-start px-2 md:px-4">
                                        <div className="w-full h-6 md:h-8 bg-[#E6F1F5]/5 rounded-sm shrink-0"></div>
                                        <div className="hidden md:block w-3/4 h-8 bg-transparent border-l-2 border-[#1FA97A] pl-3"></div>
                                        <div className="hidden md:block w-4/5 h-8 bg-transparent pl-4"></div>
                                    </div>
                                </div>
                                <div className="flex-1 h-full flex flex-col bg-[#091A22]">
                                    <div className="h-[10%] min-h-[40px] max-h-[64px] border-b border-[#E6F1F5]/5 w-full shrink-0 flex items-center px-4 md:px-6">
                                        <div className="w-1/2 md:w-[250px] h-6 md:h-8 bg-[#E6F1F5]/5 rounded-sm"></div>
                                    </div>
                                    <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6">
                                        <div className="flex gap-4 w-full h-[20%] min-h-[60px] max-h-[120px]">
                                            <div className="flex-1 bg-[#123543]/40 rounded-md border border-[#E6F1F5]/5"></div>
                                            <div className="flex-1 bg-[#123543]/40 rounded-md border border-[#E6F1F5]/5"></div>
                                            <div className="hidden md:block flex-1 bg-[#123543]/20 rounded-md border border-[#E6F1F5]/5"></div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                            <div className="w-full sm:w-[40%] flex-1 bg-[#123543]/40 rounded-md border border-[#E6F1F5]/5"></div>
                                            <div className="w-full sm:w-[60%] flex-1 bg-[#123543]/20 rounded-md border border-[#E6F1F5]/5"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* IMAGEN REAL */}
                            <img
                                src="/dashboard-preview.webp"
                                alt="Dashboard ClientLabs"
                                className="absolute z-[2] inset-0 w-full h-auto object-contain rounded-lg"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* SPACER FOR PREVIEW OVERLAP */}
            <div className="h-[60px] bg-[#FFFFFF] w-full border-t border-transparent" />

            {/* 2. PROBLEMA — BLANCO */}
            <section className="bg-[#FFFFFF] w-full py-24 md:py-32">
                <div className="mx-auto flex w-full max-w-[1000px] flex-col px-6">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} className="text-left">
                        <h2 className="text-[36px] md:text-[48px] font-[600] text-[#0F1F2A] tracking-tight mb-8">
                            El crecimiento sin sistema genera fricción.
                        </h2>
                        <div className="w-full h-px bg-[#0F1F2A]/10 mb-16"></div>
                        <ul className="flex flex-col gap-10 md:gap-16 max-w-[800px]">
                            {[
                                { title: "Herramientas aisladas" },
                                { title: "Procesos manuales propensos a error" },
                                { title: "Falta de visibilidad financiera en tiempo real" },
                                { title: "Decisiones operativas sin datos consolidados" }
                            ].map((item, idx) => (
                                <li key={idx} className="flex flex-col sm:flex-row sm:items-start gap-4 md:gap-8">
                                    <span className="text-[#8FA6B2] text-[20px] md:text-[24px] font-[400] w-[40px] shrink-0 pt-0.5">0{idx + 1}</span>
                                    <span className="text-[20px] md:text-[28px] font-[400] text-[#0F1F2A] tracking-[-0.01em] leading-snug">{item.title}.</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* 3. TRANSICIÓN — GRIS SUAVE */}
            <section className="bg-[#F4F7F9] w-full py-24 md:py-32 border-y border-[#E2E8ED]">
                <div className="mx-auto flex w-full max-w-[1000px] flex-col px-6">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                        {/* Sin ClientLabs */}
                        <div className="space-y-10">
                            <p className="text-[14px] font-[600] text-[#8FA6B2] uppercase tracking-widest border-b border-[#0F1F2A]/10 pb-4">
                                Sin ClientLabs
                            </p>
                            <ul className="space-y-6">
                                {[
                                    "Fragmentación de herramientas y pagos",
                                    "Datos de clientes inconsistentes e incompletos",
                                    "Falta de trazabilidad en las conversiones",
                                    "Caos operativo a partir de cierto umbral"
                                ].map((text, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#8FA6B2] mt-2.5 shrink-0" />
                                        <span className="text-[18px] text-[#5F7280] font-[400] leading-relaxed">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Con ClientLabs */}
                        <div className="space-y-10">
                            <p className="text-[14px] font-[600] text-[#1FA97A] uppercase tracking-widest border-b border-[#1FA97A]/20 pb-4">
                                Con ClientLabs
                            </p>
                            <ul className="space-y-6">
                                {[
                                    "Núcleo central único para ventas y operaciones",
                                    "Flujos activos automatizados e inteligentes",
                                    "Métricas confiables calculadas al milisegundo",
                                    "Control operativo real en todas tus áreas"
                                ].map((text, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1FA97A] mt-2.5 shrink-0" />
                                        <span className="text-[18px] text-[#0F1F2A] font-[500] leading-relaxed">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 4. ARQUITECTURA / MÓDULOS — BLANCO */}
            <section className="bg-[#FFFFFF] w-full py-24 md:py-32">
                <div className="mx-auto flex w-full max-w-[1000px] flex-col px-6">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
                        <h2 className="text-[36px] md:text-[48px] font-[600] text-[#0F1F2A] tracking-tight mb-8">
                            Un núcleo que conecta todas tus áreas operativas.
                        </h2>
                        <div className="w-full h-px bg-[#0F1F2A]/10 mb-16"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                            {[
                                { name: "CRM Financiero", desc: "Gestión unificada de todo el ciclo de vida del cliente, transacciones y comunicaciones en un solo hilo histórico auditable." },
                                { name: "Pagos y Cobros", desc: "Trazabilidad robusta de suscripciones, control de impagos, cobros recurrentes y facturación sincronizada en milisegundos." },
                                { name: "Analytics y Proyecciones", desc: "Dashboards analíticos de nivel directivo y proyecciones de flujo de caja puras basadas en históricos reales inmutables." },
                                { name: "Automatizaciones de Negocio", desc: "Flujos lógicos trazables para automatizar la operativa crítica: avisos de impago, control de procesos y delegación de tareas." }
                            ].map((mod, i) => (
                                <div key={i} className="flex flex-col gap-4">
                                    <h3 className="text-[22px] md:text-[24px] font-[600] text-[#0F1F2A] tracking-[-0.01em]">{mod.name}</h3>
                                    <p className="text-[18px] text-[#5F7280] font-[400] leading-relaxed max-w-[400px]">{mod.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 5. INFRAESTRUCTURA TÉCNICA — BLOQUE OSCURO */}
            <section className="bg-[#0B1F2A] w-full py-24 md:py-32 border-t border-[#E2E8ED]/10">
                <div className="mx-auto flex w-full max-w-[1000px] flex-col lg:flex-row items-center gap-16 px-6">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} className="flex-1 space-y-8">
                        <h2 className="text-[32px] md:text-[44px] font-[600] text-[#E6F1F5] tracking-tight leading-[1.1]">
                            Arquitectura preparada para integraciones.
                        </h2>
                        <p className="text-[18px] md:text-[20px] text-[#8FA6B2] font-[400] leading-relaxed max-w-[500px]">
                            Implementa ClientLabs como un motor secundario transparente. Extrae la información programáticamente y envía eventos desde tu infraestructura propietaria usando webhooks seguros o nuestra API REST estricta.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} className="flex-1 w-full bg-[#061A22] border border-[#E6F1F5]/10 rounded-sm p-8 font-mono text-[14px]">
                        <p className="text-[#8FA6B2] mb-6"># Integración REST API v1</p>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-baseline">
                                <span className="text-[#1FA97A] font-semibold w-[50px]">POST</span>
                                <span className="text-[#E6F1F5] truncate">/api/v1/customers</span>
                            </div>
                            <div className="flex gap-4 items-baseline">
                                <span className="text-[#1FA97A] font-semibold w-[50px]">POST</span>
                                <span className="text-[#E6F1F5] truncate">/api/v1/events/sync</span>
                            </div>
                            <div className="flex gap-4 items-baseline pb-6 border-b border-[#E6F1F5]/10">
                                <span className="text-[#3B82F6] font-semibold w-[50px]">GET</span>
                                <span className="text-[#E6F1F5] truncate">/api/v1/metrics/cashflow</span>
                            </div>
                            <p className="text-[#8FA6B2] pt-4">{"{"}</p>
                            <p className="text-[#8FA6B2] pl-4">"status": 200,</p>
                            <p className="text-[#8FA6B2] pl-4">"data": {"{"}</p>
                            <p className="text-[#8FA6B2] pl-8">"next_30_days": 14500.00</p>
                            <p className="text-[#8FA6B2] pl-4">{"}"}</p>
                            <p className="text-[#8FA6B2]">{"}"}</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 6. CTA FINAL — OSCURO MINIMALISTA */}
            <section className="bg-[#0B1F2A] w-full pt-20 pb-40 border-t border-[#E6F1F5]/10">
                <div className="mx-auto flex w-full max-w-[800px] flex-col items-center text-center px-6">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} className="flex flex-col items-center">
                        <h2 className="text-[40px] md:text-[56px] font-[600] text-[#E6F1F5] tracking-tight mb-10 leading-[1.1]">
                            Empieza a operar con claridad.
                        </h2>
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center rounded-sm px-10 py-5 text-[16px] font-[500] text-white transition-colors bg-[#1FA97A] hover:bg-[#157A5C]"
                        >
                            Crear cuenta
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER - DARK */}
            <footer className="bg-[#061A22] border-t border-[#E6F1F5]/5 py-10 flex flex-col items-center text-center text-[#8FA6B2] text-[14px] font-[400] px-6">
                <p>© {new Date().getFullYear()} ClientLabs. Infraestructura estructurada para negocios reales.</p>
            </footer>
        </main>
    )
}
