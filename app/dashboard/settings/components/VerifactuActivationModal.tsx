"use client"

import { useState } from "react"
import { Shield, CheckCircle2, ArrowRight, X } from "lucide-react"
import Link from "next/link"

interface Props {
  nifDefault: string
  nombreDefault: string
  onSuccess: (nif: string, nombre: string) => void
  onClose: () => void
}

export function VerifactuActivationModal({ nifDefault, nombreDefault, onSuccess, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [nif, setNif] = useState(nifDefault)
  const [nombre, setNombre] = useState(nombreDefault)
  const [direccion, setDireccion] = useState("")
  const [cp, setCp] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [provincia, setProvincia] = useState("")
  const [agreementChecked, setAgreementChecked] = useState(false)
  const [declaracionChecked, setDeclaracionChecked] = useState(false)
  const [firma, setFirma] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "long", year: "numeric" }).format(new Date())
  const canGoStep2 = nif.trim().length >= 8 && nombre.trim().length >= 2
  const canActivate = agreementChecked && declaracionChecked && firma.trim().length >= 2

  const handleActivate = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/settings/verifactu/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nif: nif.trim(),
          nombre: nombre.trim(),
          direccion: direccion.trim() || undefined,
          cp: cp.trim() || undefined,
          ciudad: ciudad.trim() || undefined,
          provincia: provincia.trim() || undefined,
          signedBy: firma.trim(),
          agreementAccepted: true,
          declaracionAccepted: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al activar")
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al activar Verifactu")
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1FA97A] focus:border-[#1FA97A]"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#1FA97A]" />
            <h2 className="text-[15px] font-semibold text-slate-900">Activar facturación legal (Verifactu)</h2>
          </div>
          {step !== 3 && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {step !== 3 && (
          <div className="flex gap-1.5 px-6 pt-4">
            {([1, 2] as const).map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#1FA97A]" : "bg-slate-100"}`} />
            ))}
          </div>
        )}

        <div className="px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-[13px] text-slate-500">
                Introduce tus datos fiscales. Deben coincidir exactamente con el censo de la AEAT.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-[12px] font-medium text-slate-700">NIF / CIF <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="B12345678" className={inputClass} value={nif} onChange={(e) => setNif(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-[12px] font-medium text-slate-700">Nombre / Razón social <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Mi Empresa SL" className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-[12px] font-medium text-slate-700">Dirección fiscal</label>
                  <input type="text" placeholder="Calle Mayor 1" className={inputClass} value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-700">Código postal</label>
                  <input type="text" placeholder="28001" className={inputClass} value={cp} onChange={(e) => setCp(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-700">Ciudad</label>
                  <input type="text" placeholder="Madrid" className={inputClass} value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-[12px] font-medium text-slate-700">Provincia</label>
                  <input type="text" placeholder="Madrid" className={inputClass} value={provincia} onChange={(e) => setProvincia(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canGoStep2}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1FA97A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a9469] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-[12px] leading-relaxed text-slate-600">
                <p className="mb-3 font-semibold text-slate-800 uppercase tracking-wide text-[11px]">
                  Acuerdo de representación para remisión de registros de facturación
                </p>
                <p className="mb-2">
                  Yo, <strong>{nombre || "[NOMBRE]"}</strong>, con NIF <strong>{nif || "[NIF]"}</strong>, autorizo a{" "}
                  <strong>Verifacti</strong> (como Colaborador Social de la AEAT) a remitir en mi nombre los registros
                  de facturación generados por el software <strong>ClientLabs</strong> al sistema VERI*FACTU de la
                  Agencia Estatal de Administración Tributaria.
                </p>
                <p className="mb-2">Esta autorización incluye:</p>
                <ul className="mb-2 ml-4 list-disc space-y-1">
                  <li>La remisión de registros de alta de facturas emitidas</li>
                  <li>La remisión de registros de anulación de facturas</li>
                  <li>La recepción de respuestas de la AEAT relativas a dichos envíos</li>
                </ul>
                <p>
                  Declaro que los datos fiscales proporcionados son correctos y me comprometo a mantenerlos actualizados.
                </p>
              </div>

              <div className="space-y-2.5">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#1FA97A]" checked={agreementChecked} onChange={(e) => setAgreementChecked(e.target.checked)} />
                  <span className="text-[12px] text-slate-700">He leído y acepto el acuerdo de representación</span>
                </label>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#1FA97A]" checked={declaracionChecked} onChange={(e) => setDeclaracionChecked(e.target.checked)} />
                  <span className="text-[12px] text-slate-700">
                    He leído la{" "}
                    <Link href="/legal/declaracion-responsable" target="_blank" className="text-[#1FA97A] underline underline-offset-2 hover:text-[#1a9469]">
                      declaración responsable del fabricante
                    </Link>
                  </span>
                </label>
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-700">
                  Firma digital — escribe tu nombre completo <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="Nombre completo" className={inputClass} value={firma} onChange={(e) => setFirma(e.target.value)} />
                <p className="mt-1 text-[11px] text-slate-400">Fecha: {today}</p>
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>
              )}

              <div className="flex items-center justify-between pt-1">
                <button onClick={() => setStep(1)} className="text-[13px] text-slate-500 hover:text-slate-700 transition-colors">
                  Volver
                </button>
                <button
                  onClick={handleActivate}
                  disabled={saving || !canActivate}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1FA97A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a9469] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Activando..." : "Activar Verifactu"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 py-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-7 w-7 text-[#1FA97A]" />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-900">Verifactu activado correctamente</h3>
              <p className="text-[13px] text-slate-500">Tus facturas se enviarán automáticamente a la AEAT.</p>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-left space-y-1">
                <p className="text-[12px] text-slate-600"><span className="font-medium">NIF:</span> {nif}</p>
                <p className="text-[12px] text-slate-600"><span className="font-medium">Nombre:</span> {nombre}</p>
              </div>
              <ul className="list-disc pl-5 text-left text-[12px] text-slate-500 space-y-1">
                <li>QR verificable en cada factura</li>
                <li>Hash encadenado conforme a la AEAT</li>
                <li>Envío automático a VERI*FACTU</li>
              </ul>
              <button
                onClick={() => onSuccess(nif, nombre)}
                className="w-full rounded-lg bg-[#1FA97A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1a9469] transition-colors"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
