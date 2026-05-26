import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/admin/", "/uploads/", "/auth/", "/login", "/register"],
      },
      { userAgent: "GPTBot",         allow: "/" },
      { userAgent: "ChatGPT-User",   allow: "/" },
      { userAgent: "PerplexityBot",  allow: "/" },
      { userAgent: "ClaudeBot",      allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Anthropic-AI",   allow: "/" },
      { userAgent: "CCBot",          allow: "/" },
    ],
    sitemap: "https://clientlabs.io/sitemap.xml",
    host: "https://clientlabs.io",
  }
}
