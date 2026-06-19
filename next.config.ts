import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "recharts",
      "date-fns",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-select",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
    ],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  async redirects() {
    return [
      // Rutas en inglés del sistema legacy de automatizaciones
      { source: "/dashboard/automations/new", destination: "/dashboard/automatizaciones", permanent: true },
      { source: "/dashboard/automations/:id/edit", destination: "/dashboard/automatizaciones", permanent: true },
      // Alias en español para ajustes
      { source: "/dashboard/ajustes", destination: "/dashboard/settings", permanent: true },
      { source: "/dashboard/ajustes/:path*", destination: "/dashboard/settings/:path*", permanent: true },
      // Blog: slugs reescritos -> nuevos (301)
      { source: "/blog/verifactu-guia-completa", destination: "/blog/verifactu-2026", statusCode: 301 },
      { source: "/blog/facturacion-electronica-obligatoria-espana", destination: "/blog/factura-electronica-obligatoria", statusCode: 301 },
      { source: "/blog/errores-facturacion-autonomos", destination: "/blog/errores-factura-autonomo", statusCode: 301 },
      { source: "/blog/modelo-303-iva-trimestral-guia", destination: "/blog/modelo-303", statusCode: 301 },
      { source: "/blog/como-gestionar-leads-autonomo", destination: "/blog/sistema-de-leads-simple", statusCode: 301 },
      { source: "/blog/organizar-clientes-proveedores", destination: "/blog/clientes-y-proveedores-centralizados", statusCode: 301 },
      { source: "/blog/que-es-crm-autonomos", destination: "/blog/que-es-un-crm", statusCode: 301 },
      { source: "/blog/captar-clientes-internet-autonomo", destination: "/blog/conseguir-clientes-por-internet", statusCode: 301 },
      { source: "/blog/obligaciones-fiscales-autonomo-2026", destination: "/blog/calendario-fiscal-autonomo-2026", statusCode: 301 },
      { source: "/blog/mejores-software-facturacion-autonomos", destination: "/blog/mejores-programas-facturacion-autonomos-2026", statusCode: 301 },
      { source: "/blog/mejor-crm-gratis-autonomos", destination: "/blog/mejores-crm-gratis-autonomos", statusCode: 301 },
      { source: "/blog/facturar-excel-vs-software", destination: "/blog/facturar-en-excel-2026", statusCode: 301 },
      { source: "/blog/crear-primera-factura-clientlabs", destination: "/blog/primera-factura-clientlabs", statusCode: 301 },
      { source: "/blog/gestionar-leads-clientlabs", destination: "/blog/pipeline-de-clientlabs", statusCode: 301 },
      { source: "/blog/clientlabs-verifactu-facturacion-legal", destination: "/blog/verifactu-en-clientlabs", statusCode: 301 },
      { source: "/blog/migrar-excel-clientlabs", destination: "/blog/migrar-de-excel-a-clientlabs", statusCode: 301 },
      { source: "/blog/clientlabs-vs-quipu", destination: "/blog/mejores-programas-facturacion-autonomos-2026", statusCode: 301 },
    ]
  },

  // Headers for cache and security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.upstash.io https://*.neon.tech https://*.vercel-insights.com https://*.vercel-analytics.com https://clientlabs.io",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      // Static asset caching — production only (dev hot-reload needs no-cache)
      ...(process.env.NODE_ENV === "production" ? [
        {
          source: "/logo.PNG",
          headers: [
            { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          ],
        },
        {
          source: "/:all*(svg|jpg|jpeg|png|webp|gif|ico|woff|woff2)",
          headers: [
            { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          ],
        },
        {
          source: "/_next/static/:path*",
          headers: [
            { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          ],
        },
      ] : []),
    ];
  },
};

export default nextConfig;
