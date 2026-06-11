import { redirect } from "next/navigation"

/**
 * El panel de integraciones real vive en /dashboard/connect.
 * Esta ruta existía como prototipo con datos mock (eliminado en el
 * blindaje pre-lanzamiento). Se mantiene como redirect permanente para
 * no romper enlaces antiguos ni marcadores.
 */
export default function IntegrationsRedirect() {
  redirect("/dashboard/connect")
}
