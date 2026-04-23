import { MetadataRoute } from "next"

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
    { url: `${baseUrl}/recursos`,             lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/changelog`,            lastModified: now, changeFrequency: "weekly",  priority: 0.5 },
    { url: `${baseUrl}/privacy`,              lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/terms`,                lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/cookies`,              lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/legal`,                lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ]
}
