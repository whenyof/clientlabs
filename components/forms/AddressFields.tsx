"use client"

import { useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SPANISH_PROVINCES, provinceFromPostalCode } from "@/lib/spanish-provinces"

export type AddressFieldKey = "address" | "postalCode" | "city" | "province" | "country"
export type AddressValues = Partial<Record<AddressFieldKey, string | null | undefined>>

type Props = {
  values: AddressValues
  /** Cada form cablea esto a su propio estado (no cambiamos su lógica de guardado) */
  onChange: (field: AddressFieldKey, value: string) => void
  disabled?: boolean
  className?: string
  /** País por defecto si está vacío (se persiste). Por defecto "España". */
  countryDefault?: string
}

const inputCls =
  "w-full h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/40 focus:border-[#0F766E] disabled:opacity-60"
const labelCls = "block text-[12px] font-medium text-slate-700 mb-1.5"

export function AddressFields({ values, onChange, disabled, className, countryDefault = "España" }: Props) {
  const v = (k: AddressFieldKey) => (values[k] ?? "").toString()

  // País por defecto: si está vacío, fijamos el default (una sola vez)
  useEffect(() => {
    if (!v("country") && countryDefault) onChange("country", countryDefault)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Al teclear el CP, autoselecciona provincia SOLO si está vacía (no pisa la elección del usuario)
  const handlePostalCode = (value: string) => {
    onChange("postalCode", value)
    if (!v("province")) {
      const auto = provinceFromPostalCode(value)
      if (auto) onChange("province", auto)
    }
  }

  return (
    <div className={className ?? "space-y-4"}>
      <div>
        <label className={labelCls}>Calle y número</label>
        <input
          type="text"
          value={v("address")}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Calle Mayor 1, 2.º A"
          disabled={disabled}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Código postal</label>
          <input
            type="text"
            value={v("postalCode")}
            onChange={(e) => handlePostalCode(e.target.value)}
            placeholder="28001"
            maxLength={5}
            inputMode="numeric"
            disabled={disabled}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Municipio</label>
          <input
            type="text"
            value={v("city")}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Madrid"
            disabled={disabled}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Provincia</label>
          <Select
            value={v("province") || undefined}
            onValueChange={(val) => onChange("province", val)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar provincia" />
            </SelectTrigger>
            <SelectContent>
              {SPANISH_PROVINCES.map((p) => (
                <SelectItem key={p.code} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={labelCls}>País</label>
          <input
            type="text"
            value={v("country") || countryDefault}
            onChange={(e) => onChange("country", e.target.value)}
            placeholder={countryDefault}
            disabled={disabled}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  )
}
