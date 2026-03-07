import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://clientlabs.com"
  const now = new Date()

  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/producto`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/precios`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/soluciones`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/recursos`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/seguridad`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ]
}


