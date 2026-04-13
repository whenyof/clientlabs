"use client"

import { useState, useEffect, useRef } from "react"
import {
  Building2,
  CheckCircle2,
  RefreshCw,
  Search,
  Unlink,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Institution = {
  id: string
  name: string
  logo: string
  bic?: string
}

type Balance = {
  balanceAmount: { amount: string; currency: string }
  balanceType: string
}

type Tx = {
  transactionId?: string
  bookingDate: string
  valueDate?: string
  transactionAmount: { amount: string; currency: string }
  creditorName?: string
  debtorName?: string
  remittanceInformationUnstructured?: string
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d))
}

// ─── Connected view ────────────────────────────────────────────────────────────

function ConnectedView({
  balances,
  transactions,
  institutionName,
  onDisconnect,
}: {
  balances: Balance[]
  transactions: Tx[]
  institutionName: string | null
  onDisconnect: () => void
}) {
  const disponible = balances.find((b) => b.balanceType === "interimAvailable")
  const contable = balances.find(
    (b) => b.balanceType === "closingBooked" || b.balanceType === "expected"
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1FA97A]/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-[#1FA97A]" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">
              {institutionName ?? "Banco conectado"}
            </h2>
            <p className="text-[11px] text-slate-400">Sincronizado via Open Banking PSD2</p>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] text-slate-500 hover:border-red-200 hover:text-red-500 transition-colors"
        >
          <Unlink className="h-3.5 w-3.5" />
          Desconectar
        </button>
      </div>

      {/* Saldos */}
      {(disponible || contable) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {disponible && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Saldo disponible
              </p>
              <p className="text-[28px] font-bold text-slate-900 tabular-nums">
                {fmt(parseFloat(disponible.balanceAmount.amount))}
              </p>
            </div>
          )}
          {contable && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Saldo contable
              </p>
              <p className="text-[28px] font-bold text-slate-900 tabular-nums">
                {fmt(parseFloat(contable.balanceAmount.amount))}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Movimientos */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-slate-900">Movimientos bancarios</h3>
          <span className="text-[11px] text-slate-400">{transactions.length} movimientos</span>
        </div>
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-slate-400">
            No hay movimientos disponibles
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 30).map((tx, i) => {
              const amount = parseFloat(tx.transactionAmount.amount)
              const isPositive = amount > 0
              const label =
                tx.remittanceInformationUnstructured ??
                (isPositive ? tx.debtorName : tx.creditorName) ??
                "Movimiento"
              return (
                <div key={tx.transactionId ?? i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                        isPositive ? "bg-emerald-50" : "bg-red-50"
                      )}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-slate-900 truncate max-w-[300px]">
                        {label}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {fmtDate(tx.valueDate ?? tx.bookingDate)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-[14px] font-semibold tabular-nums shrink-0 ml-4",
                      isPositive ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {fmt(amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Selector de banco ─────────────────────────────────────────────────────────

function BankSelector({ onConnect }: { onConnect: (id: string, name: string) => void }) {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/banking/institutions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setInstitutions(data)
      })
      .catch(() => toast.error("No se pudo cargar la lista de bancos"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = institutions.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center pb-2">
        <div className="w-14 h-14 rounded-xl bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-7 w-7 text-[#1FA97A]" />
        </div>
        <h1 className="text-[20px] font-bold text-slate-900 mb-1.5">Conecta tu banco</h1>
        <p className="text-[13px] text-slate-500 max-w-sm mx-auto leading-relaxed">
          Importa movimientos automáticamente y concilia facturas sin esfuerzo. Conexión segura
          via Open Banking PSD2.
        </p>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white">
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Busca tu banco..."
          className="text-[13px] outline-none flex-1 text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Grid de bancos */}
      {loading ? (
        <div className="py-10 text-center text-[13px] text-slate-400 animate-pulse">
          Cargando bancos de España...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-slate-400">
          No se encontraron bancos
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((inst) => (
            <button
              key={inst.id}
              onClick={() => {
                setConnecting(inst.id)
                onConnect(inst.id, inst.name)
              }}
              disabled={connecting !== null}
              className={cn(
                "flex items-center gap-3 p-4 bg-white border rounded-xl text-left transition-all",
                "hover:border-[#1FA97A] hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed",
                connecting === inst.id
                  ? "border-[#1FA97A]"
                  : "border-slate-200"
              )}
            >
              {inst.logo ? (
                <img
                  src={inst.logo}
                  alt={inst.name}
                  className="w-9 h-9 rounded-lg object-contain shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-slate-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-slate-900 truncate">{inst.name}</p>
                {connecting === inst.id && (
                  <p className="text-[10px] text-[#1FA97A] flex items-center gap-1 mt-0.5">
                    <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                    Redirigiendo...
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Nota seguridad */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <ShieldCheck className="h-4 w-4 text-[#1FA97A] shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Solo acceso de lectura — ClientLabs nunca puede mover dinero ni modificar tu cuenta.
          Puedes desconectar en cualquier momento.
        </p>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BancoPage() {
  const [view, setView] = useState<"loading" | "selector" | "connected">("loading")
  const [balances, setBalances] = useState<Balance[]>([])
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [institutionName, setInstitutionName] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get("success")) {
      loadBankData()
      toast.success("Banco conectado correctamente")
      window.history.replaceState({}, "", "/dashboard/finance/banco")
      return
    }

    if (params.get("error")) {
      toast.error("No se pudo conectar el banco")
      window.history.replaceState({}, "", "/dashboard/finance/banco")
    }

    // Check si ya hay conexión
    loadBankData()
  }, [])

  async function loadBankData() {
    try {
      const res = await fetch("/api/banking/transactions")
      if (!res.ok) {
        setView("selector")
        return
      }
      const data = await res.json()
      if (data.error) {
        setView("selector")
        return
      }
      setTransactions(data.transactions ?? [])
      setBalances(data.balances ?? [])
      setInstitutionName(data.institutionName ?? null)
      setView("connected")
    } catch {
      setView("selector")
    }
  }

  async function handleConnect(institutionId: string, name: string) {
    try {
      const res = await fetch("/api/banking/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId,
          institutionName: name,
          redirectUrl: `${window.location.origin}/api/banking/callback`,
        }),
      })
      const data = await res.json()
      if (data.link) {
        window.location.href = data.link
      } else {
        toast.error(data.error ?? "No se pudo iniciar la conexión")
      }
    } catch {
      toast.error("Error al conectar con el banco")
    }
  }

  function handleDisconnect() {
    setView("selector")
    setBalances([])
    setTransactions([])
  }

  if (view === "loading") {
    return (
      <div className="flex items-center justify-center py-24 text-[13px] text-slate-400 animate-pulse">
        Cargando...
      </div>
    )
  }

  if (view === "connected") {
    return (
      <ConnectedView
        balances={balances}
        transactions={transactions}
        institutionName={institutionName}
        onDisconnect={handleDisconnect}
      />
    )
  }

  return <BankSelector onConnect={handleConnect} />
}
