import { redirect } from "next/navigation"
import { FullLandingPage } from "../components/FullLanding.old"

interface Props {
  searchParams: Promise<{ key?: string }>
}

export default async function PreviewPage({ searchParams }: Props) {
  const { key } = await searchParams
  const validKey = process.env.PREVIEW_SECRET_KEY

  if (!key || key !== validKey) {
    redirect("/whitelist")
  }

  return <FullLandingPage />
}
