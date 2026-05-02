import { MetadataRoute } from "next"

const BLOG_SLUGS = [
  "verifactu-guia-completa",
  "facturacion-electronica-obligatoria-espana",
  "errores-facturacion-autonomos",
  "modelo-303-iva-trimestral-guia",
  "cuota-autonomos-2026",
  "como-gestionar-leads-autonomo",
  "organizar-clientes-proveedores",
  "que-es-crm-autonomos",
  "captar-clientes-internet-autonomo",
  "obligaciones-fiscales-autonomo-2026",
  "mejores-software-facturacion-autonomos",
  "clientlabs-vs-holded",
  "clientlabs-vs-quipu",
  "alternativas-facturaplus",
  "mejor-crm-gratis-autonomos",
  "facturar-excel-vs-software",
  "crear-primera-factura-clientlabs",
  "gestionar-leads-clientlabs",
  "clientlabs-verifactu-facturacion-legal",
  "migrar-excel-clientlabs",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://clientlabs.io"
  const now = new Date()

  return [
    { url: baseUrl,                           lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${baseUrl}/precios`,              lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/producto`,             lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/soluciones`,           lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`,                 lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${baseUrl}/contacto`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/embajadores`,          lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/changelog`,            lastModified: now, changeFrequency: "weekly",  priority: 0.5 },
    { url: `${baseUrl}/privacy`,              lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/terms`,                lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/cookies`,              lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/legal`,                lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    ...BLOG_SLUGS.map(slug => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
