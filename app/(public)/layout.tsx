import { CookieBanner } from "./components/CookieBanner"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
      <CookieBanner />
    </div>
  )
}
