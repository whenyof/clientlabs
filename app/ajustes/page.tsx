import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function AjustesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen px-6 pb-16 pt-28 text-white">
      <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold">Ajustes</h1>
        <p className="text-sm text-white/70">
          Configura notificaciones, preferencias y seguridad de tu cuenta.
        </p>
      </div>
    </div>
  )
}
