import { redirect } from "next/navigation"

/**
 * Página legacy de analytics sin backend propio (renderizaba widgets vacíos
 * y arrastraba un mock.ts sin uso — eliminados en el blindaje pre-lanzamiento).
 * El panel real de informes vive en /dashboard/reporting.
 */
export default function AnalyticsRedirect() {
  redirect("/dashboard/reporting")
}
