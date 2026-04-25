import { Suspense } from "react"
import AuthShell from "@/components/auth/AuthShell"

export default function Page() {
  return (
    <Suspense>
      <AuthShell />
    </Suspense>
  )
}