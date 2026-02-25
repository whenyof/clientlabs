import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function PerfilPage() {
 const session = await getServerSession(authOptions)
 if (!session?.user?.id) {
 redirect("/auth")
 }

 return (
 <div className="min-h-screen px-6 pb-16 pt-28 text-[var(--text-primary)]">
 <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 backdrop-blur">
 <h1 className="text-2xl font-semibold">Perfil</h1>
 <div className="space-y-2 text-sm text-[var(--text-secondary)]">
 <p>
 <span className="text-[var(--text-secondary)]">Nombre:</span>{" "}
 {session.user.name ?? "No definido"}
 </p>
 <p>
 <span className="text-[var(--text-secondary)]">Email:</span>{" "}
 {session.user.email ?? "No definido"}
 </p>
 </div>
 </div>
 </div>
 )
}
