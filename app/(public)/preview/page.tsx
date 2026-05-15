import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { Navbar }      from "@/components/landing/navbar"
import { Hero }        from "@/components/landing/hero"
import { Problem }     from "@/components/landing/problem"
import { Platform }    from "@/components/landing/platform"
import { Tasks }       from "@/components/landing/tasks"
import { AI }          from "@/components/landing/ai"
import { Carousel }    from "@/components/landing/carousel"
import { Stats }       from "@/components/landing/stats"
import { Pricing }     from "@/components/landing/pricing"
import { FinalCTA }    from "@/components/landing/final-cta"
import { BlogPreview } from "@/components/landing/blog-preview"
import { Footer }      from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "ClientLabs — CRM y software de facturación para autónomos | Verifactu incluido",
  description: "El CRM todo-en-uno para autónomos y pymes en España. Facturación legal con Verifactu, captación de leads, gestión de clientes y automatizaciones. 14 días gratis sin tarjeta.",
  keywords: [
    "crm autónomos",
    "software facturación autónomos",
    "verifactu",
    "facturación electrónica españa",
    "gestión clientes autónomos",
    "alternativa holded",
    "alternativa quipu",
    "crm españa",
    "captar leads autónomos",
  ],
  openGraph: {
    title: "ClientLabs — CRM y facturación para autónomos con Verifactu",
    description: "Factura legalmente con Verifactu, capta leads desde tu web y gestiona tu negocio. Todo en uno desde 14,99€/mes.",
    type: "website",
    url: "https://clientlabs.io",
    siteName: "ClientLabs",
    locale: "es_ES",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ClientLabs — CRM y facturación para autónomos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClientLabs — CRM y facturación para autónomos",
    description: "Factura con Verifactu, capta leads y gestiona clientes. Todo en uno desde 14,99€/mes.",
    images: ["/og-image.png"],
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
        <BlogPreview />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
