import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Programa de Embajadores Fundadores | ClientLabs",
  description:
    "Únete al programa de embajadores de ClientLabs. 40% de comisión recurrente por cada cliente que traigas. Solo 20 plazas.",
  alternates: { canonical: "https://clientlabs.io/embajadores" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
