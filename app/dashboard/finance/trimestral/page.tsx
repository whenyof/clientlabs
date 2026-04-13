import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TrimestralOverview } from "./TrimestralOverview"

export default async function TrimestralPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  return <TrimestralOverview userId={session.user.id} />
}
