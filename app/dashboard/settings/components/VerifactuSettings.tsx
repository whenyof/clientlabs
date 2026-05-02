"use client"

import { useState, useEffect } from "react"
import { Shield, CheckCircle2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { VerifactuActivationModal } from "./VerifactuActivationModal"

interface VerifactuProfile {
  verifactuEnabled: boolean
  verifactuActivatedAt: string | null
  taxId: string | null
  legalName: string | null
  address: string | null
  postalCode: string | null
  city: string | null
}

export function VerifactuSettings() {
  const [profile, setProfile] = useState<VerifactuProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch("/api/settings/business-profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile) {
          setProfile({
            verifactuEnabled: data.profile.verifactuEnabled ?? false,
            verifactuActivatedAt: data.profile.verifactuActivatedAt ?? null,
            taxId: data.profile.taxId ?? null,
            legalName: data.profile.legalName ?? data.profile.companyName ?? null,
            address: data.profile.address ?? null,
            postalCode: data.profile.postalCode ?? null,
            city: data.profile.city ?? null,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSuccess = (nif: string, nombre: string, address?: string, postalCode?: string, city?: string) => {
    setProfile((prev) =>
      prev
        ? { ...prev, verifactuEnabled: true, verifactuActivatedAt: new Date().toISOString(), taxId: nif, legalName: nombre, address: address ?? prev.address, postalCode: postalCode ?? prev.postalCode, city: city ?? prev.city }
        : prev
    )
    setShowModal(false)
  }

  if (loading) {
    return <div className="rounded-xl border border-slate-200 p-6 animate-pulse bg-slate-50 h-32" />
  }

  if (profile?.verifactuEnabled) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#1FA97A] shrink-0">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-emerald-900">Facturación legal activa</h3>
            <p className="text-sm text-emerald-700 mt-0.5">
              NIF: <span className="font-mono font-medium">{profile.taxId}</span>
              {profile.legalName && <> — {profile.legalName}</>}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Tus facturas se envían automáticamente a la AEAT con QR verificable
            </p>
            <Link
              href="/legal/declaracion-responsable"
              target="_blank"
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-800 transition-colors underline underline-offset-2"
            >
              Declaración responsable del fabricante <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 shrink-0">
            <Shield className="h-6 w-6 text-[#1FA97A]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">Facturación legal (Verifactu)</h3>
            <p className="mt-1 text-sm text-slate-500">
              Activa el sistema VERI*FACTU para que tus facturas se envíen automáticamente a la AEAT
              con QR verificable y cumplan con la normativa de la Ley Antifraude.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="rounded-lg bg-[#1FA97A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a9469] transition-colors"
              >
                Activar Verifactu
              </button>
              <Link
                href="/legal/declaracion-responsable"
                target="_blank"
                className="inline-flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-700 transition-colors underline underline-offset-2"
              >
                Declaración responsable <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <VerifactuActivationModal
          nifDefault={profile?.taxId ?? ""}
          nombreDefault={profile?.legalName ?? ""}
          direccionDefault={profile?.address ?? ""}
          cpDefault={profile?.postalCode ?? ""}
          ciudadDefault={profile?.city ?? ""}
          onSuccess={handleSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
