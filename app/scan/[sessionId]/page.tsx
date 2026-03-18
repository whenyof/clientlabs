import { Suspense } from "react"
import { ScanSessionPageInner } from "./scan-session-page-inner"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default function ScanSessionPage(props: { params: { sessionId: string } }) {
  const { sessionId } = props.params
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">Cargando sesión de escaneo…</div>}>
      <ScanSessionPageInner sessionId={sessionId} />
    </Suspense>
  )
}

