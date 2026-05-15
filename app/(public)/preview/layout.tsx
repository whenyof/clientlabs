import { ExitIntentPopup } from "@/components/landing/ExitIntentPopup"

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ExitIntentPopup />
    </>
  )
}
