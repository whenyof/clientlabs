import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { Navbar }    from "@/components/landing/navbar"
import { Hero }      from "@/components/landing/hero"
import { Problem }   from "@/components/landing/problem"
import { Platform }  from "@/components/landing/platform"
import { Tasks }     from "@/components/landing/tasks"
import { AI }        from "@/components/landing/ai"
import { Carousel }  from "@/components/landing/carousel"
import { Stats }     from "@/components/landing/stats"
import { Pricing }   from "@/components/landing/pricing"
import { FinalCTA }  from "@/components/landing/final-cta"
import { Footer }    from "@/components/landing/footer"

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

interface Props {
  searchParams: Promise<{ key?: string }>
}

export default async function PreviewPage({ searchParams }: Props) {
  const { key } = await searchParams
  const validKey = process.env.PREVIEW_SECRET_KEY

  if (!key || key !== validKey) {
    redirect("/whitelist")
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Platform />
        <Carousel />
        <Tasks />
        <AI />
        <Stats />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
