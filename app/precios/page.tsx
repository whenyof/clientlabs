import type { Metadata } from "next"
import PricingClient from "./PricingClient"

export const metadata: Metadata = {
  title: "Precios — ClientLabs",
  description: "Planes desde 24,99€/mes con IVA incluido. Básico, Pro y Negocio. Prueba gratuita 14 días sin tarjeta. CRM y gestión para autónomos en España.",
  keywords: [
    "precios crm autónomos",
    "software facturación precio",
    "alternativa holded precio",
    "alternativa quipu precio",
    "verifactu incluido",
    "crm autónomos precio",
    "gestión pymes precio",
  ],
  openGraph: {
    title: "Precios — ClientLabs",
    description: "Planes desde 24,99€/mes con IVA incluido. Prueba gratuita 14 días sin tarjeta.",
    type: "website",
    url: "https://clientlabs.io/precios",
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: "https://clientlabs.io/precios" },
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
        text: "ClientLabs es una plataforma de gestión todo en uno para autónomos y pymes en España. Centraliza leads, clientes, proveedores, facturas, presupuestos, albaranes, tareas, proyectos y automatizaciones en un solo lugar. Pensada específicamente para los 3,4 millones de autónomos en España que gestionan su negocio con WhatsApp y Excel.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ClientLabs tiene tres planes: Básico a 24,99€/mes, Pro a 49,99€/mes y Negocio a 79,99€/mes. Todos los precios incluyen IVA. Hay una prueba gratuita de 14 días sin necesidad de tarjeta de crédito.",
      },
    },
    {
      "@type": "Question",
      name: "¿Para quién es ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ClientLabs está diseñado para autónomos, freelancers y pequeñas empresas de 1 a 10 personas en España. Es especialmente útil para fontaneros, electricistas, agencias de marketing, consultores, diseñadores, fisioterapeutas, y cualquier profesional que necesite gestionar clientes, facturas y leads sin la complejidad de herramientas pensadas para grandes empresas.",
      },
    },
    {
      "@type": "Question",
      name: "¿En qué se diferencia ClientLabs de Holded o Quipu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ClientLabs está pensado exclusivamente para autónomos y pymes de menos de 10 personas en España, mientras que Holded y Quipu están orientados a empresas más grandes. ClientLabs combina CRM, facturación, gestión de proveedores y automatizaciones en una sola plataforma simple y operativa desde el primer día. Precio de entrada desde 24,99€/mes con IVA incluido.",
      },
    },
    {
      "@type": "Question",
      name: "¿Tiene ClientLabs prueba gratuita?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. ClientLabs ofrece una prueba gratuita de 14 días con acceso completo a todas las funcionalidades sin necesidad de tarjeta de crédito. Al terminar los 14 días puedes elegir el plan que mejor se adapte a tu negocio.",
      },
    },
    {
      "@type": "Question",
      name: "¿Funciona ClientLabs para la normativa fiscal española?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. ClientLabs está diseñado específicamente para la normativa fiscal española. Las facturas cumplen todos los requisitos legales, incluye los tipos de IVA correctos para España y está preparado para la futura normativa Verifactu.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué módulos incluye ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ClientLabs incluye: gestión de leads con pipeline de ventas, CRM de clientes, gestión de proveedores, facturación en PDF, presupuestos con firma digital, albaranes, hojas de pedido, gestión de tareas, proyectos, automatizaciones de negocio, email marketing y portal del cliente. Todo en una sola plataforma.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo gestionar mis proveedores en ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. ClientLabs incluye un módulo completo de gestión de proveedores donde puedes registrar tus proveedores, gestionar pedidos, registrar compras y llevar el control de facturas de proveedores.",
      },
    },
  ],
}

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "ClientLabs",
  description: "Plataforma de gestión todo en uno para autónomos y pymes en España",
  brand: { "@type": "Brand", name: "ClientLabs" },
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "24.99",
    highPrice: "79.99",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <PricingClient />
    </>
  )
}