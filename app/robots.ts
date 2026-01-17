import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://clientlabs.com/sitemap.xml",
    host: "https://clientlabs.com",
  }
}


