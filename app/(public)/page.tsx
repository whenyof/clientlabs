import type { Metadata } from "next"

import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "ClientLabs · Todo tu negocio. Un solo sistema.",
  description:
    "CRM, tareas, facturación, automatizaciones e IA. El sistema operativo para autónomos y pequeños negocios hispanohablantes.",
  openGraph: {
    title: "ClientLabs",
    description: "Todo tu negocio. Un solo sistema.",
    type: "website",
  },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {/* Fase C: Problem, Platform, Carousel, Tasks */}
        {/* Fase D: AI, Stats, Pricing */}
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
