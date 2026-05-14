import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LeadsKanbanView } from "@/modules/leads/components/LeadsKanbanView"

export const dynamic = "force-dynamic"

export default async function LeadsKanbanPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth")

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/leads"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} />
            Leads
          </Link>
          <span style={{ color: "var(--border-subtle)", fontSize: 14 }}>/</span>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Pipeline Kanban
          </h1>
        </div>
      </div>
      <LeadsKanbanView />
    </div>
  )
}
