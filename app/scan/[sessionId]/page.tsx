import { Suspense, use } from "react"
import { ScanSessionPageInner } from "./scan-session-page-inner"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default function ScanSessionPage({
  params,
}: {
  params: { sessionId: string }
}) {
  // Next.js puede entregar `params` como Promise en ciertos modos.
  // Para que `sessionId` nunca quede undefined, desempaquetamos de forma segura sin `await`.
  const sessionId =
    typeof (params as any)?.then === "function"
      ? (use(params as any) as { sessionId?: string })?.sessionId
      : params?.sessionId

  if (!params || !sessionId) {
    console.error("INVALID PARAMS:", params)
  }
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">
        Sesión de escaneo no válida.
      </div>
    )
  }
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">Cargando sesión de escaneo…</div>}>
      <ScanSessionPageInner sessionId={sessionId} />
    </Suspense>
  )
}

