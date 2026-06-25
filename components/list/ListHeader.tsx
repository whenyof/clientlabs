"use client"

import { Search, ChevronDown } from "lucide-react"

/**
 * Cabecera unificada de las listas (Clientes, Leads, Proveedores).
 * Modelo: el "Directorio de proveedores". Una sola fila con:
 *   título + subtítulo a la izquierda, buscador + filtros (etiqueta delante) a la derecha.
 *
 * Cada lista conserva su propia lógica (búsqueda, filtros, orden, paginación):
 * este componente solo aporta la PRESENTACIÓN. Le pasas valores + callbacks por props.
 */

// ─── Design tokens (alineados con las vistas de lista) ──────────────────────
const C = {
  bg: "#ffffff",
  bg3: "#f5f5f5",
  ink: "#0a0a0a",
  ink3: "#737373",
  ink4: "#a3a3a3",
  line: "#e8e8e8",
  line2: "#eeeeee",
}

export type ListHeaderFilter = {
  /** Etiqueta delante, p.ej. "Categoría", "País", "Estado". */
  label: string
  /** Valor actual mostrado / seleccionado. */
  value: string
  /** Si se pasan opciones + onChange, el filtro es interactivo (select). Si no, es decorativo. */
  options?: { value: string; label: string }[]
  onChange?: (value: string) => void
}

export type ListHeaderProps = {
  /** Título de la lista, p.ej. "Directorio de proveedores". */
  title: string
  /** Subtítulo de contexto: recuento + nota de orden, p.ej. "21 registros · ordenados por gasto YTD".
   *  Acepta nodo para poder incluir, p.ej., un indicador de carga inline. */
  subtitle?: React.ReactNode
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  /** Filtros con etiqueta delante. */
  filters?: ListHeaderFilter[]
  /** Control de orden, renderizado como un filtro más (a la derecha de los filtros). */
  sort?: ListHeaderFilter
  /** Slot opcional para acciones extra (Exportar CSV, toggle Lista/Pipeline, etc.). */
  actions?: React.ReactNode
}

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 10px",
  border: `1px solid ${C.line}`,
  borderRadius: 6,
  background: C.bg,
  fontSize: 11.5,
  color: C.ink3,
  whiteSpace: "nowrap",
}

function FilterChip({ filter }: { filter: ListHeaderFilter }) {
  const interactive = !!filter.options && !!filter.onChange
  if (!interactive) {
    return (
      <div style={{ ...pillStyle, cursor: "pointer" }}>
        <span>{filter.label}</span>
        <span style={{ color: C.ink, fontWeight: 550 }}>{filter.value}</span>
        <ChevronDown size={10} color={C.ink4} />
      </div>
    )
  }
  return (
    <label style={{ ...pillStyle, cursor: "pointer" }}>
      <span>{filter.label}</span>
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        <select
          value={filter.value}
          onChange={(e) => filter.onChange?.(e.target.value)}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            border: "none",
            background: "transparent",
            color: C.ink,
            fontWeight: 550,
            fontSize: 11.5,
            paddingRight: 15,
            cursor: "pointer",
            outline: "none",
          }}
        >
          {filter.options!.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={10}
          color={C.ink4}
          style={{ position: "absolute", right: 0, pointerEvents: "none" }}
        />
      </span>
    </label>
  )
}

export function ListHeader({
  title,
  subtitle,
  searchPlaceholder = "Buscar…",
  searchValue,
  onSearchChange,
  filters = [],
  sort,
  actions,
}: ListHeaderProps) {
  return (
    <div
      style={{
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid ${C.line2}`,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {/* Título + subtítulo */}
      <div>
        <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: C.ink }}>
          {title}
        </h3>
        {subtitle && (
          <div style={{ fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Buscador + filtros + acciones */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={12}
            style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.ink4 }}
          />
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              padding: "5px 10px 5px 28px",
              border: `1px solid ${C.line}`,
              borderRadius: 6,
              background: C.bg,
              fontSize: 12.5,
              color: C.ink,
              outline: "none",
              width: 200,
            }}
          />
        </div>

        {filters.map((f, i) => (
          <FilterChip key={f.label + i} filter={f} />
        ))}
        {sort && <FilterChip filter={sort} />}
        {actions}
      </div>
    </div>
  )
}
