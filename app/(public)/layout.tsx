import { CookieBanner } from "./components/CookieBanner"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#FFFFFF] text-[#0F1F2A] min-h-screen">
      {children}
      <CookieBanner />
    </div>
  )
}
