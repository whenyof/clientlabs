import { Suspense } from "react"
import AuthShell from "@/components/auth/AuthShell"

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthShell defaultRegister={true} />
    </Suspense>
  )
}
