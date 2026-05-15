import type { MetadataRoute } from "next"
import { ARTICLES } from "./blog/data"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://clientlabs.io"
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${baseUrl}/precios`,           lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/producto`,          lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/soluciones`,        lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`,              lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${baseUrl}/about`,             lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`,           lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/changelog`,         lastModified: now, changeFrequency: "weekly",  priority: 0.5 },
    { url: `${baseUrl}/privacy`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/terms`,             lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/cookies`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/legal`,             lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ]

  const blogPosts: MetadataRoute.Sitemap = ARTICLES.map(article => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...blogPosts]
}
