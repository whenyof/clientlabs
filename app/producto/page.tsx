import type { Metadata } from "next"
import ProductClient from "./ProductClient"

export const metadata: Metadata = {
  title: "Producto | ClientLabs – Dashboard que se adapta a tu negocio",
  description:
    "Descubre el dashboard inteligente de ClientLabs. Se adapta a tu tipo de negocio: agencias, SaaS, ecommerce y consultores.",
}

export default function Page() {
  return <ProductClient />
}