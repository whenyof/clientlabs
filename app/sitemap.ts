import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://clientlabs.io", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://clientlabs.io/whitelist", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://clientlabs.io/blog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: "https://clientlabs.io/docs", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: "https://clientlabs.io/recursos", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://clientlabs.io/changelog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: "https://clientlabs.io/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://clientlabs.io/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ]
}
