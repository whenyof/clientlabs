import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ClientLabs",
    short_name: "ClientLabs",
    description: "El CRM para autónomos españoles",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1FA97A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
