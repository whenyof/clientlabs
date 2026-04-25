import { Suspense } from "react"
import AuthShell from "@/components/auth/AuthShell"

export default function LoginPage() {
  return (
    <Suspense>
      <AuthShell defaultRegister={false} />
    </Suspense>
  )
}
