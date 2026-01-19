import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function PerfilPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen px-6 pb-16 pt-28 text-white">
      <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <div className="space-y-2 text-sm text-white/70">
          <p>
            <span className="text-white/50">Nombre:</span>{" "}
            {session.user.name ?? "No definido"}
          </p>
          <p>
            <span className="text-white/50">Email:</span>{" "}
            {session.user.email ?? "No definido"}
          </p>
        </div>
      </div>
    </div>
  )
}
