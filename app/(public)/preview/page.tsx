import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<{ key?: string }>
}

/**
 * Pre-launch app gate. A valid ?key= enters the app (middleware sends the
 * visitor to /auth if there's no session); an invalid/absent key bounces to the
 * waitlist. This used to render the old marketing landing — that landing has
 * been retired in favour of the new (marketing) site, so this route is now a
 * pure gate. Do not add UI here; keep it a redirect.
 */
export default async function PreviewPage({ searchParams }: Props) {
  const { key } = await searchParams
  const validKey = process.env.PREVIEW_SECRET_KEY

  if (!key || key !== validKey) {
    redirect("/whitelist")
  }

  redirect("/dashboard")
}
