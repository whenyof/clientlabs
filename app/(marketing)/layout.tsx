import type { ReactNode } from "react"
import { Source_Serif_4, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google"
import Navbar from "@/components/marketing/Navbar"
import Footer from "@/components/marketing/Footer"
import Reveal from "@/components/marketing/Reveal"
import "./marketing.css"

// Self-hosted via next/font (no render-blocking external <link>). These map to
// the --serif / --sans / --mono CSS vars consumed by marketing.css.
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-mkt-serif",
  display: "swap",
})
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-mkt-sans",
  display: "swap",
})
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mkt-mono",
  display: "swap",
})

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`mkt ${serif.variable} ${sans.variable} ${mono.variable}`}>
      <Navbar />
      {children}
      <Footer />
      <Reveal />
    </div>
  )
}
