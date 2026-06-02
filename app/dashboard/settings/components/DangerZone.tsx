"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Download, ExternalLink, Trash2, LogOut, PauseCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Step = 0 | 1 | 2 | 3

function DeleteModal({ step, emailInput, userEmail, onChange, onBack, onContinue, onDelete, onClose }: {
  step: Step; emailInput: string; userEmail: string
  onChange: (v: string) => void; onBack: () => void
  onContinue: () => void; onDelete: () => void; onClose: () => void
}) {
  const emailMatch = emailInput.trim().toLowerCase() === userEmail.toLowerCase()
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={step !== 3 ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-[14px] font-semibold text-slate-900">
              {step === 1 ? "¿Seguro que quieres eliminar tu cuenta?" : step === 2 ? "Confirma tu identidad" : "Eliminando cuenta…"}
            </p>
          </div>
          {step !== 3 && <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>}
        </div>

        <div className="p-6">
          {step === 1 && (
            <>
              <p className="text-[12px] text-slate-500 mb-4">Se eliminarán permanentemente todos tus datos:</p>
              <ul className="space-y-1.5 mb-4">
                {["Todos tus leads", "Todos tus clientes", "Todas tus facturas", "Todos tus proveedores", "Todos tus productos", "Toda la configuración de tu cuenta"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-slate-600">
                    <span className="text-red-400 font-bold">✗</span>{item}
                  </li>
                ))}
              </ul>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-5">
                <p className="text-[12px] text-amber-700 font-medium">¿Has descargado tus datos? Asegúrate de tener una copia antes de continuar.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2 text-[13px] text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">Cancelar</button>
                <button onClick={onContinue} className="flex-1 py-2 text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">Continuar →</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-[12px] text-slate-500 mb-1">Escribe tu email para confirmar</p>
              <p className="text-[12px] font-mono text-slate-700 mb-4 bg-slate-50 px-2 py-1 rounded">{userEmail}</p>
              <input
                type="email"
                autoFocus
                value={emailInput}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => e.key === "Enter" && emailMatch && onDelete()}
                placeholder="Tu email exacto"
                className={cn(
                  "w-full px-3.5 py-2.5 border rounded-lg text-[13px] font-mono text-center mb-4 focus:outline-none focus:ring-1 transition-colors",
                  emailMatch ? "border-red-300 text-red-600 ring-red-200" : "border-slate-200"
                )}
              />
              <div className="flex gap-2">
                <button onClick={onBack} className="flex-1 py-2 text-[13px] text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">← Atrás</button>
                <button onClick={onDelete} disabled={!emailMatch} className="flex-1 py-2 text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors">Eliminar definitivamente</button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center py-4 gap-3">
              <span className="w-8 h-8 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
              <p className="text-[13px] text-slate-500">Eliminando tu cuenta…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function DangerZone() {
  const { data: session } = useSession()
  const router = useRouter()
  const userEmail = session?.user?.email ?? ""
  const plan = (session?.user as { plan?: string })?.plan ?? "FREE"
  const isPaidPlan = !["FREE", "TRIAL"].includes(plan)

  const [step, setStep] = useState<Step>(0)
  const [emailInput, setEmailInput] = useState("")
  const [downloading, setDownloading] = useState(false)
  const [revokingAll, setRevokingAll] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch("/api/settings/export/all")
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const date = new Date().toISOString().slice(0, 10)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = `clientlabs-backup-${date}.zip`; a.click()
      URL.revokeObjectURL(url)
      toast.success("Datos descargados correctamente")
    } catch {
      toast.error("Error al descargar los datos")
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    setStep(3)
    try {
      const res = await fetch("/api/user/delete-account", { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? "Error al eliminar la cuenta")
        setStep(2)
        return
      }
      await signOut({ callbackUrl: "/" })
    } catch {
      toast.error("Error de conexión")
      setStep(2)
    }
  }

  const handleRevokeAll = async () => {
    setRevokingAll(true)
    try {
      const res = await fetch("/api/settings/sessions/revoke-all", { method: "POST" })
      if (res.ok) toast.success("Todas las sesiones cerradas")
      else toast.error("No se pudieron cerrar las sesiones")
    } catch {
      toast.error("Error de conexión")
    } finally {
      setRevokingAll(false)
    }
  }

  const handleDeactivate = async () => {
    if (!confirm("¿Seguro que quieres desactivar tu cuenta? Podrás reactivarla contactando con soporte.")) return
    setDeactivating(true)
    try {
      const res = await fetch("/api/user/deactivate", { method: "PATCH" })
      if (res.ok) { toast.success("Cuenta desactivada"); await signOut({ callbackUrl: "/" }) }
      else toast.error("No se pudo desactivar la cuenta")
    } catch {
      toast.error("Error de conexión")
    } finally {
      setDeactivating(false)
    }
  }

  const closeModal = () => { setStep(0); setEmailInput("") }

  return (
    <div className="space-y-5">
      {step > 0 && <DeleteModal step={step} emailInput={emailInput} userEmail={userEmail} onChange={setEmailInput} onBack={() => setStep(1)} onContinue={() => setStep(2)} onDelete={handleDelete} onClose={closeModal} />}

      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Zona de peligro</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Acciones irreversibles sobre tu cuenta y datos.</p>
        </div>
      </div>

      {/* Sección 1: Exportar */}
      <div className="bg-white rounded-xl border border-amber-200 p-5">
        <p className="text-[13px] font-semibold text-slate-800 mb-1">Antes de irte, descarga tus datos</p>
        <p className="text-[12px] text-slate-500 mb-4">Tienes derecho a llevarte todos tus datos (RGPD Art. 17 y 20). Descárgalos antes de eliminar tu cuenta.</p>
        <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 px-3.5 py-2 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors">
          <Download className="w-3.5 h-3.5" />
          {downloading ? "Preparando…" : "Descargar todos mis datos"}
        </button>
      </div>

      {/* Sección 2: Cancelar suscripción (solo si tiene plan de pago) */}
      {isPaidPlan && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-slate-800">Cancela tu suscripción primero</p>
            <p className="text-[12px] text-slate-500 mt-0.5">Antes de eliminar tu cuenta, cancela tu suscripción activa para evitar cargos futuros.</p>
          </div>
          <button onClick={() => router.push("/dashboard/settings?section=subscription")} className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shrink-0">
            <ExternalLink className="w-3.5 h-3.5" />Plan y facturación
          </button>
        </div>
      )}

      {/* Sección 3: Eliminar cuenta */}
      <div className="bg-white rounded-xl border border-red-200 p-5">
        <p className="text-[13px] font-semibold text-red-600 mb-1">Eliminar mi cuenta</p>
        <p className="text-[12px] text-red-500/80 mb-4">Esta acción es irreversible. Se eliminarán todos tus datos: leads, clientes, facturas, proveedores, productos, tareas y toda la información de tu cuenta.</p>
        <button onClick={() => setStep(1)} className="flex items-center gap-2 px-3.5 py-2 text-[12px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
          <Trash2 className="w-3.5 h-3.5" />Eliminar mi cuenta permanentemente
        </button>
      </div>

      {/* Sección 4: Otras acciones */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-slate-800">Cerrar todas las sesiones activas</p>
            <p className="text-[12px] text-slate-400 mt-0.5">Cierra sesión en todos los dispositivos excepto este.</p>
          </div>
          <button onClick={handleRevokeAll} disabled={revokingAll} className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shrink-0">
            <LogOut className="w-3.5 h-3.5" />{revokingAll ? "Cerrando…" : "Cerrar otras sesiones"}
          </button>
        </div>
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-slate-800">Desactivar mi cuenta</p>
            <p className="text-[12px] text-slate-400 mt-0.5">Pausa tu cuenta sin perder datos. Puedes reactivarla contactando con soporte.</p>
          </div>
          <button onClick={handleDeactivate} disabled={deactivating} className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shrink-0">
            <PauseCircle className="w-3.5 h-3.5" />{deactivating ? "Desactivando…" : "Desactivar cuenta"}
          </button>
        </div>
      </div>
    </div>
  )
}
