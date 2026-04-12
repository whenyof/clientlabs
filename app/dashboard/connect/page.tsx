"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getBaseUrl } from "@/lib/api/baseUrl"
import { toast } from "sonner"
import {
  Globe,
  MessageCircle,
  Mail,
  Calendar,
  Zap,
  CreditCard,
  Layers,
  Search,
  X,
  Key,
  Webhook,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  ChevronRight,
  ShieldCheck,
  Link2,
  Activity,
} from "lucide-react"
import {
  INTEGRATIONS,
  CATEGORIES,
  type IntegrationDef,
  type CategoryId,
} from "./integrations"

// ─── Category Icons ───────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <Layers className="w-3.5 h-3.5" />,
  leads: <Globe className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  calendar: <Calendar className="w-3.5 h-3.5" />,
  automation: <Zap className="w-3.5 h-3.5" />,
  payments: <CreditCard className="w-3.5 h-3.5" />,
  productivity: <MessageCircle className="w-3.5 h-3.5" />,
}

// ─── Connect Modal ────────────────────────────────────────────────────────────
function ConnectModal({
  integration,
  onClose,
  onConnected,
}: {
  integration: IntegrationDef
  onClose: () => void
  onConnected: (id: string) => void
}) {
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleConnect = async () => {
    if (integration.connectType === "apikey" && !apiKey.trim()) {
      toast.error("Introduce tu API Key para continuar.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: integration.category,
          provider: integration.id,
          config: apiKey ? { apiKey } : {},
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`${integration.name} conectado correctamente.`)
        onConnected(integration.id)
        onClose()
      } else {
        toast.error(data.error ?? "Error al conectar.")
      }
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const webhookUrl = `${getBaseUrl()}/api/webhooks/ingest/${integration.id}`

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl border border-[var(--color-border-secondary)] shadow-sm w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8ED]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${integration.color} flex items-center justify-center`}>
              <span className={`text-xs font-bold ${integration.textColor}`}>
                {integration.initials}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0B1F2A]">{integration.name}</p>
              <p className={`text-xs ${integration.textColor} font-medium`}>
                {integration.connectType === "coming_soon"
                  ? "Próximamente"
                  : integration.connectType === "oauth"
                  ? "OAuth 2.0"
                  : integration.connectType === "apikey"
                  ? "API Key"
                  : integration.connectType === "webhook"
                  ? "Webhook"
                  : "SDK"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F4F7F9] transition-colors"
          >
            <X className="w-4 h-4 text-[#5F7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="rounded-lg bg-[#F4F7F9] border border-[#E2E8ED] p-3 flex gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#1FA97A] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#374151] leading-relaxed">{integration.benefit}</p>
          </div>

          {integration.connectType === "coming_soon" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">En desarrollo</p>
                <p className="text-xs text-amber-700 mt-1">
                  Esta integración llegará próximamente. Te avisaremos cuando esté disponible.
                </p>
              </div>
            </div>
          )}

          {integration.connectType === "oauth" && (
            <div className="space-y-3">
              <p className="text-xs text-[#5F7280]">
                Serás redirigido a {integration.name} para autorizar el acceso. ClientLabs solo solicita los permisos estrictamente necesarios.
              </p>
              <div className="rounded-lg border border-[#E2E8ED] p-3 space-y-1.5">
                <p className="text-xs font-medium text-[#0B1F2A]">Permisos solicitados</p>
                <p className="text-xs text-[#5F7280]">Lectura de datos · Sincronización bidireccional · Webhooks</p>
              </div>
            </div>
          )}

          {integration.connectType === "apikey" && (
            <div className="space-y-3">
              <p className="text-xs text-[#5F7280]">
                Introduce tu API Key de {integration.name}. La encontrarás en la configuración de tu cuenta en {integration.name}.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8FA6B2]" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxx"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-[#E2E8ED] bg-white text-[#0B1F2A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1FA97A] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {integration.connectType === "webhook" && (
            <div className="space-y-3">
              <p className="text-xs text-[#5F7280]">
                Añade esta URL como webhook en la configuración de {integration.name}. ClientLabs recibirá los eventos en tiempo real.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">Tu Webhook URL</label>
                <div className="flex items-center gap-2 bg-[#F4F7F9] rounded-lg border border-[#E2E8ED] px-3 py-2.5">
                  <Webhook className="w-3.5 h-3.5 text-[#8FA6B2] flex-shrink-0" />
                  <code className="flex-1 text-xs text-[#0B1F2A] truncate font-mono">{webhookUrl}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl)
                      toast.success("URL copiada")
                    }}
                    className="flex-shrink-0 p-1 hover:bg-[#E2E8ED] rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-[#5F7280]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#5F7280] border border-[#E2E8ED] rounded-lg hover:bg-[#F4F7F9] transition-colors"
          >
            Cancelar
          </button>
          {integration.connectType !== "coming_soon" && (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#1FA97A] hover:bg-[#178a64] rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? "Conectando..." : integration.connectType === "oauth" ? "Autorizar acceso" : "Conectar"}
              {!loading && <ExternalLink className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Integration Card ─────────────────────────────────────────────────────────
function IntegrationCard({
  integration,
  onAction,
}: {
  integration: IntegrationDef
  onAction: (integration: IntegrationDef) => void
}) {
  const isConnected = integration.status === "connected"
  const isComingSoon = integration.status === "coming_soon"
  const isError = integration.status === "error"

  return (
    <div
      className={`bg-white rounded-xl border transition-all flex flex-col gap-4 p-5 ${
        isConnected
          ? "border-[#1FA97A]/30"
          : isError
          ? "border-amber-200"
          : "border-[#E2E8ED] hover:border-[#C8D6E0]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center flex-shrink-0`}>
            <span className={`text-xs font-bold ${integration.textColor}`}>{integration.initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0B1F2A] leading-tight">{integration.name}</p>
            <p className="text-xs text-[#5F7280] mt-0.5 line-clamp-2 leading-relaxed">{integration.description}</p>
          </div>
        </div>

        {isConnected && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-[#1FA97A] bg-[#E8F5EF] px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1FA97A]" />
            Activo
          </span>
        )}
        {isError && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        )}
        {isComingSoon && (
          <span className="flex-shrink-0 text-[10px] font-semibold text-[#8FA6B2] bg-[#F4F7F9] px-2 py-0.5 rounded-full">
            Próx.
          </span>
        )}
      </div>

      <p className="text-[11px] text-[#8FA6B2] leading-relaxed border-t border-[#F4F7F9] pt-3">
        {integration.benefit}
      </p>

      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[10px] uppercase tracking-widest text-[#C8D6E0] font-medium">
          {integration.connectType === "oauth"
            ? "OAuth"
            : integration.connectType === "apikey"
            ? "API Key"
            : integration.connectType === "webhook"
            ? "Webhook"
            : integration.connectType === "web_sdk"
            ? "SDK"
            : "—"}
        </span>
        <button
          onClick={() => onAction(integration)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            isConnected
              ? "text-[#5F7280] border border-[#E2E8ED] hover:bg-[#F4F7F9]"
              : isComingSoon
              ? "text-[#8FA6B2] border border-[#E2E8ED] cursor-default"
              : "text-white bg-[#1FA97A] hover:bg-[#178a64]"
          }`}
        >
          {isConnected ? "Gestionar" : isComingSoon ? "Ver" : "Conectar"}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ─── Activity Empty State ─────────────────────────────────────────────────────
function ActivityEmptyState() {
  const items = [
    { label: "Webhooks recibidos", desc: "Eventos entrantes de Calendly, WhatsApp, Meta Ads..." },
    { label: "Sincronizaciones", desc: "Registros de sincronización de Gmail, Stripe, Google Calendar..." },
    { label: "Errores de conexión", desc: "Avisos cuando una integración deja de funcionar correctamente." },
  ]

  return (
    <div className="py-4 space-y-6">
      <div className="flex flex-col items-center py-12 gap-4 text-center border border-[#E2E8ED] rounded-xl bg-white">
        <div className="w-12 h-12 rounded-full bg-[#F4F7F9] border border-[#E2E8ED] flex items-center justify-center">
          <Activity className="w-5 h-5 text-[#C8D6E0]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#0B1F2A] mb-1">Sin actividad aún</p>
          <p className="text-xs text-[#8FA6B2] max-w-xs leading-relaxed">
            Conecta una integración y los eventos aparecerán aquí en tiempo real.
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-[#C8D6E0] font-medium mb-3">
          Qué registra este panel
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.label} className="bg-white border border-[#E2E8ED] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#0B1F2A] mb-1">{item.label}</p>
              <p className="text-[11px] text-[#8FA6B2] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type ActiveTab = "conexiones" | "actividad"

export default function ConnectPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ActiveTab>("conexiones")
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all")
  const [search, setSearch] = useState("")
  const [integrations, setIntegrations] = useState<IntegrationDef[]>(INTEGRATIONS)
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDef | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch(getBaseUrl() + "/api/integrations", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setIntegrations((prev) =>
          prev.map((int) => {
            if (int.id === "web") return { ...int, status: data.web?.connected ? "connected" : "disconnected" }
            if (int.id === "whatsapp") return { ...int, status: data.whatsapp?.connected ? "connected" : "disconnected" }
            if (int.id === "facebook") return { ...int, status: data.facebook?.connected ? "connected" : "disconnected" }
            const item = data.items?.find(
              (i: { provider: string; status: string }) =>
                i.provider.toLowerCase() === int.id.toLowerCase()
            )
            if (item) return { ...int, status: item.status === "CONNECTED" ? "connected" : "disconnected" }
            return int
          })
        )
      })
      .catch(() => {})
      .finally(() => setLoadingStatus(false))
    return () => controller.abort()
  }, [])

  const handleAction = (integration: IntegrationDef) => {
    if (integration.id === "web") {
      router.push("/dashboard/connect/web")
      return
    }
    setSelectedIntegration(integration)
  }

  const handleConnected = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "connected" } : i))
    )
  }

  const filtered = integrations.filter((i) => {
    const matchCat = activeCategory === "all" || i.category === activeCategory
    const matchSearch =
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const connected = integrations.filter((i) => i.status === "connected").length
  const total = integrations.filter((i) => i.status !== "coming_soon").length
  const comingSoon = integrations.filter((i) => i.status === "coming_soon").length

  const tabCls = (tab: ActiveTab) =>
    `px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      activeTab === tab
        ? "border-[#1FA97A] text-[#1FA97A]"
        : "border-transparent text-[#5F7280] hover:text-[#0B1F2A]"
    }`

  return (
    <section className="space-y-5 pb-12">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8ED]">
        <div>
          <h1 className="text-xl font-semibold text-[#0B1F2A]">Conexiones</h1>
          <p className="text-sm text-[#5F7280] mt-0.5">
            Conecta tus herramientas para que ClientLabs trabaje con tu stack actual.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[#1FA97A]/30 bg-[#E8F5EF] text-[#1FA97A]">
            <ShieldCheck className="w-3.5 h-3.5" />
            SSL activo
          </span>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#E2E8ED] text-[#5F7280]">
            {loadingStatus ? "..." : `${connected} de ${total} conectadas`}
          </span>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#E2E8ED] text-[#8FA6B2]">
            {comingSoon} próximamente
          </span>
        </div>
      </header>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-[#E2E8ED] -mt-1">
        <button onClick={() => setActiveTab("conexiones")} className={tabCls("conexiones")}>
          Conexiones
        </button>
        <button onClick={() => setActiveTab("actividad")} className={tabCls("actividad")}>
          Actividad
        </button>
      </div>

      {/* ── Tab: Conexiones ──────────────────────────────────────────────── */}
      {activeTab === "conexiones" && (
        <>
          {/* Search + Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA6B2]" />
              <input
                type="text"
                placeholder="Buscar integración..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[#E2E8ED] bg-white text-[#0B1F2A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1FA97A] transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                    activeCategory === cat.id
                      ? "bg-[#0B1F2A] text-white border-[#0B1F2A]"
                      : "bg-white text-[#5F7280] border-[#E2E8ED] hover:border-[#C8D6E0] hover:text-[#0B1F2A]"
                  }`}
                >
                  {CATEGORY_ICONS[cat.id]}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connected section */}
          {connected > 0 && activeCategory === "all" && !search && (
            <div>
              <p className="text-xs uppercase tracking-widest text-[#8FA6B2] font-medium mb-3 flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5" />
                Conectadas
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {integrations
                  .filter((i) => i.status === "connected")
                  .map((i) => (
                    <IntegrationCard key={i.id} integration={i} onAction={handleAction} />
                  ))}
              </div>
            </div>
          )}

          {/* Main grid */}
          <div>
            {(activeCategory !== "all" || search || connected === 0) && (
              <p className="text-xs uppercase tracking-widest text-[#8FA6B2] font-medium mb-3">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
            {!search && activeCategory === "all" && connected > 0 && (
              <p className="text-xs uppercase tracking-widest text-[#8FA6B2] font-medium mb-3">
                Disponibles
              </p>
            )}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity ${
                loadingStatus ? "opacity-50" : ""
              }`}
            >
              {(activeCategory === "all" && !search
                ? filtered.filter((i) => i.status !== "connected")
                : filtered
              ).map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onAction={handleAction}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-[#8FA6B2]">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No se encontraron integraciones para &ldquo;{search}&rdquo;</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Tab: Actividad ───────────────────────────────────────────────── */}
      {activeTab === "actividad" && <ActivityEmptyState />}

      {/* Modal */}
      {selectedIntegration && (
        <ConnectModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          onConnected={handleConnected}
        />
      )}
    </section>
  )
}
