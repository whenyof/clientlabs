import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google"
import Script from "next/script"
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

const SDK_KEY = process.env.NEXT_PUBLIC_CLIENTLABS_SDK_KEY ?? ""
const SDK_CONFIG = JSON.stringify({
  key: SDK_KEY,
  features: { pageview: true, forms: true, intent: true, utm: true, cta: true },
})

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`min-h-screen ${interTight.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      {/* ClientLabs tracking — self-hosted SDK */}
      {SDK_KEY && (
        <>
          <Script id="cl-config" strategy="beforeInteractive">{`window.clientlabsConfig=${SDK_CONFIG};`}</Script>
          <Script src="/v1/loader.js" strategy="afterInteractive" />
        </>
      )}
      {children}
      <CookieBanner />
    </div>
  )
}
