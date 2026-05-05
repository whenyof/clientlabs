import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AcceptInviteClient } from "./AcceptInviteClient"
import { AlertCircle, Users, Clock } from "lucide-react"

const TEAM_LIMITS: Record<string, number> = {
  FREE: 1,
  TRIAL: 5,
  STARTER: 1,
  PRO: 5,
  BUSINESS: Infinity,
}

function ErrorCard({ icon, title, message, sub }: { icon: React.ReactNode; title: string; message: string; sub?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          {icon}
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#0B1F2A]">{title}</h1>
          <p className="text-sm text-slate-500 mt-1.5">{message}</p>
        </div>
        {sub}
        <a
          href="/"
          className="inline-block mt-2 text-sm font-medium text-[#1FA97A] hover:underline"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}

export default async function InvitePage({ params }: { params: { token: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/invite/${params.token}`)
  }

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token: params.token },
    include: {
      workspace: {
        include: {
          owner: {
            select: {
              plan: true,
              BusinessProfile: { select: { extraSeats: true } },
            },
          },
          members: { select: { id: true, userId: true } },
        },
      },
    },
  })

  if (!invite) {
    return (
      <ErrorCard
        icon={<AlertCircle className="w-7 h-7 text-slate-400" />}
        title="Invitación no encontrada"
        message="Este enlace de invitación no es válido o ya ha sido utilizado."
      />
    )
  }

  if (invite.expiresAt < new Date()) {
    return (
      <ErrorCard
        icon={<Clock className="w-7 h-7 text-amber-400" />}
        title="Invitación expirada"
        message="Este enlace de invitación ha caducado. Pide al administrador del equipo que te envíe uno nuevo."
      />
    )
  }

  const plan = invite.workspace.owner.plan ?? "STARTER"
  const extraSeats = invite.workspace.owner.BusinessProfile?.extraSeats ?? 0
  const baseLimit = TEAM_LIMITS[plan] ?? 1
  const limit = baseLimit === Infinity ? Infinity : baseLimit + extraSeats
  const memberCount = invite.workspace.members.length

  if (memberCount >= limit) {
    return (
      <ErrorCard
        icon={<Users className="w-7 h-7 text-red-400" />}
        title="Límite de usuarios alcanzado"
        message={`El equipo "${invite.workspace.name}" ha alcanzado el máximo de usuarios de su plan (${limit === Infinity ? "ilimitado" : limit} usuario${limit !== 1 ? "s" : ""}).`}
        sub={
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600">
            Para ampliar el límite, el administrador del equipo debe actualizar su plan.
            Contacta con nosotros en{" "}
            <a href="mailto:info@clientlabs.io" className="text-[#1FA97A] font-medium hover:underline">
              info@clientlabs.io
            </a>
          </div>
        }
      />
    )
  }

  const alreadyMember = invite.workspace.members.some(m => m.userId === session.user.id)

  return (
    <AcceptInviteClient
      token={params.token}
      workspaceName={invite.workspace.name}
      role={invite.role}
      alreadyMember={alreadyMember}
    />
  )
}
