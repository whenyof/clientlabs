import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google"
import { CookieBanner } from "./components/CookieBanner"

const interTight = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`min-h-screen ${interTight.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      {children}
      <CookieBanner />
    </div>
  )
}
