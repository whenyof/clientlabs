"use client"

import { useState } from "react"
import { Upload, Download, Users, Building2, Truck, Package, ExternalLink, FileArchive } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { EntityImportModal } from "./EntityImportModal"
import { useRouter } from "next/navigation"

const TEMPLATE_LEADS = `nombre,email,telefono,mensaje,origen,estado,temperatura
María García,maria@email.com,612345678,Interesada en el plan Pro,web,nuevo,caliente
Carlos López,carlos@empresa.com,699887766,Pidió demo,referido,contactado,tibio`

const TEMPLATE_CLIENTES = `nombre,email,telefono,notas,origen
Ana Martínez,ana@negocio.com,611223344,Cliente desde 2023,referido
Pedro Sánchez,pedro@empresa.es,655443322,Pago puntual,web`

const TEMPLATE_PROVEEDORES = `nombre,tipo,email_contacto,telefono_contacto,web,notas,coste_mensual,nivel_dependencia
Hosting SL,hosting,info@hosting.es,910111213,hosting.es,Servidor principal,29.99,alto
Diseño Studio,diseño,hola@diseño.es,666777888,diseño.es,Colaborador freelance,0,bajo`

type ModalKey = "leads" | "clientes" | "proveedores" | null

const EXPORT_OPTIONS = [
  {
    key: "all",
    label: "Todos mis datos",
    description: "ZIP con leads, clientes, facturas, proveedores y productos en JSON",
    url: "/api/settings/export/all",
    filename: "clientlabs-export.zip",
    icon: FileArchive,
    isZip: true,
  },
  {
    key: "invoices",
    label: "Solo facturas",
    description: "Todas tus facturas emitidas en CSV",
    url: "/api/settings/export/invoices",
    filename: "facturas.csv",
    icon: Download,
    isZip: false,
  },
  {
    key: "clients",
    label: "Solo clientes",
    description: "Tu cartera de clientes en CSV",
    url: "/api/settings/export/clients",
    filename: "clientes.csv",
    icon: Building2,
    isZip: false,
  },
  {
    key: "leads",
    label: "Solo leads",
    description: "Todos tus leads y contactos en CSV",
    url: "/api/settings/export/leads",
    filename: "leads.csv",
    icon: Users,
    isZip: false,
  },
  {
    key: "providers",
    label: "Solo proveedores",
    description: "Tu base de proveedores en CSV",
    url: "/api/settings/export/providers",
    filename: "proveedores.csv",
    icon: Truck,
    isZip: false,
  },
] as const

export function ImportExportPanel() {
  const router = useRouter()
  const [tab, setTab] = useState<"import" | "export">("import")
  const [modal, setModal] = useState<ModalKey>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const download = async (url: string, filename: string, key: string) => {
    setDownloading(key)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Error al exportar")
      const blob = await res.blob()
      const href = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = href
      a.download = filename
      a.click()
      URL.revokeObjectURL(href)
    } catch {
      toast.error("No se pudo generar la exportación")
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Modals */}
      {modal === "leads" && (
        <EntityImportModal
          title="Importar leads"
          description="Importa contactos y clientes potenciales"
          apiUrl="/api/leads/import"
          templateCsv={TEMPLATE_LEADS}
          templateFilename="plantilla-leads.csv"
          onClose={() => setModal(null)}
          onDone={() => setModal(null)}
        />
      )}
      {modal === "clientes" && (
        <EntityImportModal
          title="Importar clientes"
          description="Importa tu cartera de clientes actuales"
          apiUrl="/api/clients/import"
          templateCsv={TEMPLATE_CLIENTES}
          templateFilename="plantilla-clientes.csv"
          onClose={() => setModal(null)}
          onDone={() => setModal(null)}
        />
      )}
      {modal === "proveedores" && (
        <EntityImportModal
          title="Importar proveedores"
          description="Importa tu base de proveedores"
          apiUrl="/api/providers/import"
          templateCsv={TEMPLATE_PROVEEDORES}
          templateFilename="plantilla-proveedores.csv"
          onClose={() => setModal(null)}
          onDone={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">Importar / Exportar</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">Mueve tus datos entre ClientLabs y otros sistemas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {(["import", "export"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 text-[12px] font-medium rounded-md transition-all",
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t === "import" ? "Importar" : "Exportar"}
          </button>
        ))}
      </div>

      {/* IMPORT TAB */}
      {tab === "import" && (
        <div className="space-y-3">
          <p className="text-[12px] text-slate-500">
            Sube un archivo CSV o Excel para importar tus datos existentes a ClientLabs.
          </p>

          {/* Leads */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-800">Leads</p>
                <p className="text-[11px] text-slate-400">Importa contactos y clientes potenciales</p>
              </div>
            </div>
            <button
              onClick={() => setModal("leads")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#0F766E] border border-[#0F766E]/30 bg-white rounded-lg hover:bg-[#E1F5EE] transition-colors shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar
            </button>
          </div>

          {/* Clientes */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-800">Clientes</p>
                <p className="text-[11px] text-slate-400">Importa tu cartera de clientes actuales</p>
              </div>
            </div>
            <button
              onClick={() => setModal("clientes")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#0F766E] border border-[#0F766E]/30 bg-white rounded-lg hover:bg-[#E1F5EE] transition-colors shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar
            </button>
          </div>

          {/* Proveedores */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-800">Proveedores</p>
                <p className="text-[11px] text-slate-400">Importa tu base de proveedores</p>
              </div>
            </div>
            <button
              onClick={() => setModal("proveedores")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#0F766E] border border-[#0F766E]/30 bg-white rounded-lg hover:bg-[#E1F5EE] transition-colors shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar
            </button>
          </div>

          {/* Productos — link al catálogo */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-600">Productos y servicios</p>
                <p className="text-[11px] text-slate-400">Ya disponible en "Mis productos"</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/settings?section=catalog")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-500 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ir a Mis productos
            </button>
          </div>
        </div>
      )}

      {/* EXPORT TAB */}
      {tab === "export" && (
        <div className="space-y-3">
          <p className="text-[12px] text-slate-500">
            Descarga tus datos en cualquier momento. Es tu derecho (RGPD Art. 20).
          </p>
          {EXPORT_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isLoading = downloading === opt.key
            return (
              <div key={opt.key} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    opt.isZip ? "bg-emerald-50" : "bg-slate-50"
                  )}>
                    <Icon className={cn("w-4 h-4", opt.isZip ? "text-emerald-600" : "text-slate-400")} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-slate-800">{opt.label}</p>
                    <p className="text-[11px] text-slate-400">{opt.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => download(opt.url, opt.filename, opt.key)}
                  disabled={!!downloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shrink-0"
                >
                  {isLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {isLoading ? "Generando..." : "Descargar"}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
