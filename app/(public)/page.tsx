import type { Metadata } from "next"
import WhitelistClient from "./whitelist/WhitelistClient"

export const metadata: Metadata = {
  title: "ClientLabs — CRM y gestión para autónomos y pymes en España",
  description: "La plataforma todo en uno para autónomos en España. CRM, facturación con Verifactu, gestión de leads, presupuestos y automatizaciones. Apúntate a la lista de espera.",
  keywords: [
    "CRM autónomos España",
    "software gestión autónomos",
    "facturación autónomos España",
    "Verifactu autónomos",
    "gestión leads autónomo",
    "alternativa Holded autónomos",
    "software pymes España",
    "ClientLabs",
  ],
  alternates: {
    canonical: "https://clientlabs.io",
    languages: { "es-ES": "https://clientlabs.io" },
  },
  openGraph: {
    title: "ClientLabs — CRM y gestión para autónomos y pymes en España",
    description: "La plataforma todo en uno para autónomos en España. CRM, facturación, leads y automatizaciones.",
    url: "https://clientlabs.io",
    locale: "es_ES",
    type: "website",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué es ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ClientLabs es una plataforma de gestión todo en uno para autónomos y pymes en España. Centraliza leads, clientes, proveedores, facturas con Verifactu, presupuestos, albaranes, tareas, proyectos y automatizaciones en un solo lugar. Pensada para los 3,4 millones de autónomos en España que gestionan su negocio con WhatsApp y Excel.",
      },
    },
    {
      "@type": "Question",
      name: "¿Para quién es ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para autónomos, freelancers y pequeños negocios de 1 a 10 personas en España. Es especialmente útil para fontaneros, electricistas, agencias de marketing, consultores, diseñadores, fisioterapeutas, nutricionistas y cualquier profesional que necesite gestión profesional sin la complejidad de herramientas para grandes empresas.",
      },
    },
    {
      "@type": "Question",
      name: "¿En qué se diferencia ClientLabs de Holded o Quipu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ClientLabs es la única plataforma que combina CRM, facturación con Verifactu, captación de leads y automatizaciones en un solo producto pensado para autónomos en España. Holded está orientado a empresas medianas y resulta demasiado complejo y caro para autónomos. Quipu solo hace facturación, sin CRM ni gestión de leads.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ClientLabs tiene planes desde 24,99€/mes con IVA incluido. Los early adopters que se apunten antes del lanzamiento consiguen un 50% de descuento de por vida. Habrá una prueba gratuita de 14 días con acceso completo sin necesidad de tarjeta de crédito.",
      },
    },
    {
      "@type": "Question",
      name: "¿ClientLabs cumple con Verifactu y la normativa fiscal española?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. ClientLabs está preparado para la normativa Verifactu (Real Decreto 1007/2023) de facturación electrónica en España. Las facturas incluyen los tipos de IVA correctos para España, firma digital y QR verificable por la AEAT.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuándo lanza ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El lanzamiento oficial es el 23 de junio de 2026. Los que estén en la lista de espera serán los primeros en entrar con ventajas exclusivas de early adopter: 1 mes gratis, 50% de descuento de por vida y acceso prioritario al producto.",
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      {/* JSON-LD: hardcoded constant, no user input — XSS-safe */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <WhitelistClient />
    </>
  )
}
