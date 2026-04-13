import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { QuarterDetail } from "./QuarterDetail"

const VALID_QUARTERS = ["q1", "q2", "q3", "q4"] as const
type ValidQuarter = (typeof VALID_QUARTERS)[number]

type Props = {
  params: Promise<{ quarter: string }>
}

export default async function QuarterPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const { quarter } = await params

  if (!VALID_QUARTERS.includes(quarter as ValidQuarter)) {
    notFound()
  }

  return <QuarterDetail quarter={quarter as ValidQuarter} />
}
