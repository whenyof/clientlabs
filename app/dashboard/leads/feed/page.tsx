import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LeadFeed } from "./LeadFeed"

export default async function LeadFeedPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth")

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Lead Feed</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Latest visitor activity by intent. Newest first.
        </p>
      </div>
      <LeadFeed />
    </div>
  )
}
