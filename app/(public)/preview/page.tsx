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
  title: "ClientLabs — CRM y Facturación para Autónomos y Pequeños Negocios",
  description:
    "Gestiona leads, clientes, proveedores y facturas en un solo sistema. CRM con IA, automatizaciones y facturación electrónica para autónomos en España. Empieza gratis.",
  keywords: ["crm autónomos", "facturación autónomos", "gestión clientes", "software pymes españa", "crm español", "facturación electrónica", "crm gratis"],
  openGraph: {
    title: "ClientLabs — CRM y Facturación para Autónomos",
    description: "Gestiona leads, clientes, proveedores y facturas en un solo sistema. Empieza gratis.",
    type: "website",
    url: "https://clientlabs.io",
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClientLabs — CRM y Facturación para Autónomos",
    description: "Gestiona leads, clientes, proveedores y facturas en un solo sistema. Empieza gratis.",
  },
  alternates: { canonical: "https://clientlabs.io" },
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
