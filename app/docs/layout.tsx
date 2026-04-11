import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentación | ClientLabs",
  description: "Guía completa para usar ClientLabs. Primeros pasos, módulos, integraciones y preguntas frecuentes.",
  alternates: { canonical: "https://clientlabs.io/docs" },
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
