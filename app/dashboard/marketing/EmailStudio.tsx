"use client"

import { useState, useCallback, useRef, useId } from "react"
import {
  Search, Bell, Plus, X, Check, Sparkles, ArrowRight, ChevronDown,
  GripVertical, ArrowUp, ArrowDown, Copy, Trash2, AlignLeft, Heading,
  ImageIcon, Square, Columns2, Minus, ArrowUpDown, List, Package,
  Video, Share2, LayoutTemplate, PanelBottom, Palette, Layers, Eye,
  Monitor, Smartphone, Send, Undo2, Redo2, Save, Link, AlignCenter,
  Download, Bold, Italic, Underline, ChevronRight, MoreHorizontal,
} from "lucide-react"

type BlockType =
  | "Hero" | "Logo" | "Heading" | "Text" | "Steps" | "Button"
  | "Divider" | "Spacer" | "Image" | "Columns" | "Product"
  | "Social" | "Video" | "Footer"

interface EmailBlock {
  id: string
  type: BlockType
  variant?: string
  h?: number
}

interface EmailStudioProps {
  mode: "template" | "blank"
  campaignName?: string
  campaignId?: string
  templateName?: string
  onClose: () => void
}

type InspectorTab = "Bloque" | "Estilos" | "Bloques"
type Device = "desktop" | "mobile"

const TEMPLATE_BLOCKS: EmailBlock[] = [
  { id: "hero", type: "Hero" },
  { id: "intro", type: "Text", variant: "intro" },
  { id: "steps", type: "Steps" },
  { id: "cta", type: "Button" },
  { id: "help", type: "Text", variant: "help" },
  { id: "sign", type: "Text", variant: "sign" },
  { id: "foot", type: "Footer" },
]

const BLANK_BLOCKS: EmailBlock[] = [
  { id: "b-logo", type: "Logo" },
  { id: "b-h", type: "Heading" },
]

const BLOCK_LIB: { group: string; items: { type: BlockType; label: string; icon: React.ReactNode }[] }[] = [
  {
    group: "Básicos",
    items: [
      { type: "Heading", label: "Titular", icon: <Heading size={14} /> },
      { type: "Text", label: "Texto", icon: <AlignLeft size={14} /> },
      { type: "Image", label: "Imagen", icon: <ImageIcon size={14} /> },
      { type: "Button", label: "Botón", icon: <Square size={14} /> },
    ],
  },
  {
    group: "Estructura",
    items: [
      { type: "Columns", label: "Columnas", icon: <Columns2 size={14} /> },
      { type: "Divider", label: "Divisor", icon: <Minus size={14} /> },
      { type: "Spacer", label: "Espaciador", icon: <ArrowUpDown size={14} /> },
      { type: "Logo", label: "Cabecera/Logo", icon: <LayoutTemplate size={14} /> },
    ],
  },
  {
    group: "Contenido avanzado",
    items: [
      { type: "Steps", label: "Lista de pasos", icon: <List size={14} /> },
      { type: "Product", label: "Producto", icon: <Package size={14} /> },
      { type: "Video", label: "Vídeo", icon: <Video size={14} /> },
      { type: "Social", label: "Redes sociales", icon: <Share2 size={14} /> },
      { type: "Footer", label: "Pie/baja", icon: <PanelBottom size={14} /> },
    ],
  },
]

const TLABEL: Record<BlockType, string> = {
  Hero: "Hero", Logo: "Logo", Heading: "Titular", Text: "Texto",
  Steps: "Pasos", Button: "Botón", Divider: "Divisor", Spacer: "Espaciador",
  Image: "Imagen", Columns: "Columnas", Product: "Producto",
  Social: "Social", Video: "Vídeo", Footer: "Pie",
}

const STEPS_DATA = [
  { n: 1, title: "Completa tu perfil", desc: "Añade tu nombre, logo y datos de empresa." },
  { n: 2, title: "Conecta tus datos", desc: "Importa clientes o conecta tu CRM favorito." },
  { n: 3, title: "Crea tu primer documento", desc: "Genera una factura o presupuesto en segundos." },
]

function VarText({ text }: { text: string }) {
  const parts = text.split(/({{[^}]+}})/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("{{") ? (
          <span
            key={i}
            style={{
              background: "#EAF4F0",
              color: "#0F766E",
              borderRadius: 5,
              fontFamily: "monospace",
              padding: "1px 5px",
              fontSize: 13,
            }}
          >
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  )
}

function HatchFill({ h = 180, label }: { h?: number; label?: string }) {
  return (
    <div
      style={{
        height: h,
        background:
          "repeating-linear-gradient(45deg, #E6E9E7 0, #E6E9E7 1px, #F4F5F4 0, #F4F5F4 50%)",
        backgroundSize: "8px 8px",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {label && (
        <span style={{ fontSize: 12, color: "#9AA29D", fontWeight: 500 }}>
          {label}
        </span>
      )}
    </div>
  )
}

function BlockBody({ block, scale = 1 }: { block: EmailBlock; scale?: number }) {
  const base = scale < 1 ? { pointerEvents: "none" as const } : {}

  if (block.type === "Hero") {
    return (
      <div style={{ background: "#15655A", padding: "48px 40px", ...base }}>
        <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 700, margin: "0 0 10px" }}>
          <VarText text="¡Bienvenido a {{negocio}}! " />
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", margin: 0, fontSize: 16 }}>
          Estás a 3 pasos de empezar
        </p>
      </div>
    )
  }

  if (block.type === "Logo") {
    return (
      <div style={{ padding: "26px 40px 4px", display: "flex", alignItems: "center", gap: 10, ...base }}>
        <div
          style={{
            width: 30, height: 30, background: "#0F766E", borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>C</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#161A19" }}>ClientLabs</span>
      </div>
    )
  }

  if (block.type === "Heading") {
    return (
      <div style={{ padding: "26px 40px 6px", ...base }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: "#1B211E", margin: 0 }}>
          Escribe un titular potente…
        </p>
      </div>
    )
  }

  if (block.type === "Text") {
    const texts: Record<string, string> = {
      intro: "Hola {{nombre}}, nos alegra muchísimo tenerte aquí. Hemos preparado todo para que empieces cuanto antes.",
      help: "Si tienes cualquier duda, responde a este email y te ayudamos en minutos.",
      sign: "Un saludo, El equipo de {{negocio}}",
    }
    const txt = texts[block.variant ?? ""] ?? "Escribe aquí tu mensaje…"
    return (
      <div style={{ padding: "22px 40px", fontSize: 15, lineHeight: 1.62, color: "#2A312E", ...base }}>
        <VarText text={txt} />
      </div>
    )
  }

  if (block.type === "Steps") {
    return (
      <div style={{ padding: "8px 40px", ...base }}>
        {STEPS_DATA.map((s) => (
          <div key={s.n} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: "50%", background: "#0F766E",
                color: "#fff", fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              {s.n}
            </div>
            <div>
              <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14, color: "#1B211E" }}>{s.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#6A736F", lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (block.type === "Button") {
    return (
      <div style={{ padding: "22px 40px 26px", ...base }}>
        <button
          type="button"
          style={{
            background: "#0F766E", color: "#fff", border: "none", borderRadius: 7,
            padding: "12px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          Empezar ahora <ArrowRight size={16} />
        </button>
      </div>
    )
  }

  if (block.type === "Divider") {
    return (
      <div style={{ padding: "6px 40px", ...base }}>
        <hr style={{ borderTop: "1px solid #E6E9E7", borderBottom: "none", margin: 0 }} />
      </div>
    )
  }

  if (block.type === "Spacer") {
    const h = block.h ?? 32
    return (
      <div
        className="spacer-block"
        style={{ height: h, position: "relative", ...base }}
        data-label={`espaciador · ${h}px`}
      />
    )
  }

  if (block.type === "Image") {
    return (
      <div style={{ margin: "8px 40px", ...base }}>
        <HatchFill h={180} label="Imagen" />
      </div>
    )
  }

  if (block.type === "Columns") {
    return (
      <div style={{ padding: "12px 40px", display: "flex", gap: 16, ...base }}>
        {[0, 1].map((c) => (
          <div key={c} style={{ flex: 1 }}>
            <HatchFill h={100} label="Imagen" />
            <p style={{ fontSize: 13, color: "#2A312E", marginTop: 8 }}>Columna {c + 1}</p>
          </div>
        ))}
      </div>
    )
  }

  if (block.type === "Product") {
    return (
      <div style={{ margin: "8px 40px", border: "1px solid #E6E9E7", borderRadius: 10, padding: 16, display: "flex", gap: 16, ...base }}>
        <div style={{ width: 130, flexShrink: 0 }}>
          <HatchFill h={90} />
        </div>
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 15, color: "#1B211E" }}>Nombre del producto</p>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "#6A736F" }}>Descripción breve del producto o servicio.</p>
          <span style={{ background: "#EAF4F0", color: "#0F766E", borderRadius: 5, padding: "3px 10px", fontSize: 13, fontWeight: 600 }}>
            Ver más
          </span>
        </div>
      </div>
    )
  }

  if (block.type === "Social") {
    const icons = ["X", "in", "ig", "f"]
    return (
      <div style={{ padding: "20px 40px", display: "flex", justifyContent: "center", gap: 12, ...base }}>
        {icons.map((ic) => (
          <div
            key={ic}
            style={{
              width: 36, height: 36, borderRadius: "50%", background: "#F4F5F4",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#33403C",
            }}
          >
            {ic}
          </div>
        ))}
      </div>
    )
  }

  if (block.type === "Video") {
    return (
      <div style={{ margin: "8px 40px", position: "relative", ...base }}>
        <HatchFill h={180} />
        <div
          style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{ width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderLeft: "16px solid #fff", marginLeft: 3 }} />
          </div>
        </div>
      </div>
    )
  }

  if (block.type === "Footer") {
    return (
      <div style={{ padding: "24px 40px 34px", borderTop: "1px solid #E6E9E7", ...base }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "#9AA29D", textAlign: "center" }}>
          <VarText text="{{negocio}} · Has recibido este email porque estás en nuestra lista." />
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#9AA29D", textAlign: "center" }}>
          <span style={{ textDecoration: "underline", cursor: "pointer" }}>Darse de baja</span>
        </p>
      </div>
    )
  }

  return null
}

function InsertZone({ onInsert }: { onInsert: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      style={{
        position: "relative", height: 20, display: "flex",
        alignItems: "center", justifyContent: "center", cursor: "pointer",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onInsert}
    >
      <div
        style={{
          position: "absolute", left: 0, right: 0, height: 1,
          background: hover ? "#0F766E" : "transparent",
          transition: "background 0.15s",
        }}
      />
      {hover && (
        <div
          style={{
            width: 20, height: 20, borderRadius: "50%", background: "#0F766E",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
          }}
        >
          <Plus size={12} color="#fff" />
        </div>
      )}
    </div>
  )
}

function BlockWrap({
  block,
  selected,
  index,
  total,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onInsertAfter,
}: {
  block: EmailBlock
  selected: boolean
  index: number
  total: number
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
  onInsertAfter: () => void
}) {
  const [hover, setHover] = useState(false)
  const active = hover || selected

  return (
    <>
      <div
        style={{
          position: "relative",
          outline: selected
            ? "2px solid #0F766E"
            : hover
            ? "1.5px dashed #0F766E"
            : "1.5px dashed transparent",
          borderRadius: 4,
          transition: "outline 0.12s",
          cursor: "pointer",
        }}
        onClick={onSelect}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {active && (
          <div
            style={{
              position: "absolute", top: -1, left: 0, zIndex: 10,
              background: "#0F766E", color: "#fff", fontSize: 10, fontWeight: 700,
              padding: "2px 7px", borderRadius: "3px 3px 3px 0",
              letterSpacing: "0.04em",
            }}
          >
            {TLABEL[block.type]}
          </div>
        )}
        {active && (
          <div
            style={{
              position: "absolute", top: -1, right: 0, zIndex: 10,
              background: "#161A19", borderRadius: "3px 3px 0 3px",
              display: "flex", alignItems: "center", gap: 1,
              padding: "2px 4px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { icon: <GripVertical size={12} color="#9AA29D" />, action: undefined, title: "Mover" },
              { icon: <ArrowUp size={12} color="#9AA29D" />, action: onMoveUp, title: "Subir", disabled: index === 0 },
              { icon: <ArrowDown size={12} color="#9AA29D" />, action: onMoveDown, title: "Bajar", disabled: index === total - 1 },
              { icon: <Copy size={12} color="#9AA29D" />, action: onDuplicate, title: "Duplicar" },
              { icon: <Trash2 size={12} color="#F87171" />, action: onDelete, title: "Eliminar" },
            ].map((btn, i) => (
              <button
                key={i}
                title={btn.title}
                type="button"
                onClick={btn.action}
                disabled={btn.disabled}
                style={{
                  background: "none", border: "none", padding: "3px 4px",
                  cursor: btn.action ? "pointer" : "default", borderRadius: 3,
                  opacity: btn.disabled ? 0.3 : 1,
                  display: "flex", alignItems: "center",
                }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        )}
        <BlockBody block={block} />
      </div>
      <InsertZone onInsert={onInsertAfter} />
    </>
  )
}

function EmailCanvas({
  blocks,
  selected,
  device,
  onSelect,
  onAdd,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  blocks: EmailBlock[]
  selected: string | null
  device: Device
  onSelect: (id: string) => void
  onAdd: (afterIndex: number) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}) {
  const maxW = device === "mobile" ? 380 : 600

  return (
    <div
      style={{
        flex: 1, background: "#EEF0EF",
        backgroundImage: "radial-gradient(#D4D8D5 0.8px, transparent 0.8px)",
        backgroundSize: "18px 18px",
        overflowY: "auto", padding: "32px 24px",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}
      onClick={() => onSelect("")}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16, width: "100%",
          maxWidth: maxW, boxShadow: "0 2px 24px rgba(0,0,0,0.06)",
          overflow: "hidden", transition: "max-width 0.25s",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {blocks.length === 0 ? (
          <div
            style={{
              padding: "60px 40px", textAlign: "center",
              border: "2px dashed #D4D8D5", margin: 24, borderRadius: 12,
            }}
          >
            <Layers size={32} color="#9AA29D" style={{ marginBottom: 12 }} />
            <p style={{ color: "#6A736F", fontWeight: 600, margin: "0 0 8px" }}>
              Empieza desde cero
            </p>
            <p style={{ color: "#9AA29D", fontSize: 13, margin: "0 0 20px" }}>
              Añade bloques desde la biblioteca de la izquierda
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {["Titular", "Texto", "Botón", "Imagen"].map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => onAdd(-1)}
                  style={{
                    background: "#EAF4F0", color: "#0F766E", border: "none",
                    borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}
                >
                  + {lbl}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <InsertZone onInsert={() => onAdd(-1)} />
            {blocks.map((block, idx) => (
              <BlockWrap
                key={block.id}
                block={block}
                selected={selected === block.id}
                index={idx}
                total={blocks.length}
                onSelect={() => onSelect(block.id)}
                onMoveUp={() => onMoveUp(block.id)}
                onMoveDown={() => onMoveDown(block.id)}
                onDuplicate={() => onDuplicate(block.id)}
                onDelete={() => onDelete(block.id)}
                onInsertAfter={() => onAdd(idx)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function BlockLibraryPanel({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [q, setQ] = useState("")
  const filtered = BLOCK_LIB.map((g) => ({
    ...g,
    items: g.items.filter((i) =>
      !q || i.label.toLowerCase().includes(q.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 14px 10px" }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F4F5F4", borderRadius: 7, padding: "7px 12px",
          }}
        >
          <Search size={13} color="#9AA29D" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar bloque…"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 13, color: "#161A19",
            }}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 16px" }}>
        {filtered.map((g) => (
          <div key={g.group} style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9AA29D", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 4px 8px" }}>
              {g.group}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {g.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onAdd(item.type)}
                  style={{
                    background: "#fff", border: "0.5px solid #EAECEB", borderRadius: 8,
                    padding: "10px 8px", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 7, cursor: "pointer",
                    transition: "border-color 0.12s",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0F766E")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#EAECEB")}
                >
                  <div
                    style={{
                      width: 28, height: 28, background: "#EAF4F0", borderRadius: 6,
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#0F766E",
                    }}
                  >
                    {item.icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#33403C" }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StylePanel() {
  const [emailWidth, setEmailWidth] = useState(600)
  const [radius, setRadius] = useState<"0px" | "8px" | "16px">("8px")
  const [darkMode, setDarkMode] = useState(true)
  const [showLogo, setShowLogo] = useState(true)

  const primaryColors = ["#15655A", "#0F766E", "#14B8A6", "#171B1A", "#1E3A8A"]
  const bgColors = ["#FFFFFF", "#F4F5F4", "#EAF4F0", "#15655A"]

  return (
    <div style={{ padding: "0 14px 20px", fontSize: 13 }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontWeight: 600, color: "#33403C", margin: "0 0 8px" }}>Color principal</p>
        <div style={{ display: "flex", gap: 7 }}>
          {primaryColors.map((c) => (
            <div
              key={c}
              style={{
                width: 26, height: 26, borderRadius: "50%", background: c,
                cursor: "pointer", border: c === "#0F766E" ? "2.5px solid #0F766E" : "2.5px solid transparent",
                outline: c === "#0F766E" ? "2px solid #EAF4F0" : "none",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <p style={{ fontWeight: 600, color: "#33403C", margin: "0 0 8px" }}>Color de fondo</p>
        <div style={{ display: "flex", gap: 7 }}>
          {bgColors.map((c) => (
            <div
              key={c}
              style={{
                width: 26, height: 26, borderRadius: 5, background: c,
                cursor: "pointer", border: "1px solid #EAECEB",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <p style={{ fontWeight: 600, color: "#33403C", margin: "0 0 8px" }}>Tipografía</p>
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#F4F5F4", borderRadius: 7, padding: "8px 12px", cursor: "pointer",
          }}
        >
          <span style={{ color: "#161A19" }}>Hanken Grotesk</span>
          <ChevronDown size={13} color="#9AA29D" />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <p style={{ fontWeight: 600, color: "#33403C", margin: 0 }}>Ancho del correo</p>
          <span style={{ color: "#0F766E", fontWeight: 600 }}>{emailWidth}px</span>
        </div>
        <input
          type="range" min={480} max={680} value={emailWidth}
          onChange={(e) => setEmailWidth(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#0F766E" }}
        />
      </div>

      <div style={{ marginBottom: 18 }}>
        <p style={{ fontWeight: 600, color: "#33403C", margin: "0 0 8px" }}>Radio de esquinas</p>
        <div style={{ display: "flex", gap: 4 }}>
          {(["0px", "8px", "16px"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadius(r)}
              style={{
                flex: 1, padding: "6px 4px", border: "0.5px solid",
                borderColor: radius === r ? "#0F766E" : "#EAECEB",
                background: radius === r ? "#EAF4F0" : "#fff",
                color: radius === r ? "#0F766E" : "#6A736F",
                borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {[
        { label: "Modo oscuro automático", val: darkMode, set: setDarkMode },
        { label: "Mostrar logo en cabecera", val: showLogo, set: setShowLogo },
      ].map(({ label, val, set }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ color: "#33403C", fontWeight: 500 }}>{label}</span>
          <button
            type="button"
            onClick={() => set(!val)}
            style={{
              width: 38, height: 22, borderRadius: 11,
              background: val ? "#0F766E" : "#D4D8D5",
              border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
            }}
          >
            <span
              style={{
                position: "absolute", top: 3, left: val ? 18 : 3,
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s", display: "block",
              }}
            />
          </button>
        </div>
      ))}
    </div>
  )
}

function Inspector({
  block,
  onDelete,
  onDuplicate,
}: {
  block: EmailBlock | null
  onDelete: () => void
  onDuplicate: () => void
}) {
  if (!block) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <AlignLeft size={28} color="#9AA29D" style={{ margin: "0 auto 10px", display: "block" }} />
        <p style={{ color: "#9AA29D", fontSize: 13, margin: 0 }}>
          Selecciona un bloque para editarlo
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: "14px 14px 0", fontSize: 13 }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
          paddingBottom: 12, borderBottom: "0.5px solid #EAECEB",
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0F766E" }} />
        <span style={{ fontWeight: 700, color: "#161A19" }}>{TLABEL[block.type]}</span>
      </div>

      {(block.type === "Text" || block.type === "Heading") && (
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {[
              { icon: <Bold size={13} />, label: "B" },
              { icon: <Italic size={13} />, label: "I" },
              { icon: <Underline size={13} />, label: "U" },
              { icon: <Link size={13} />, label: "L" },
              { icon: <AlignCenter size={13} />, label: "A" },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                style={{
                  background: "#F4F5F4", border: "0.5px solid #EAECEB",
                  borderRadius: 5, padding: "5px 8px", cursor: "pointer", color: "#33403C",
                  display: "flex", alignItems: "center",
                }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
          <textarea
            style={{
              width: "100%", border: "0.5px solid #EAECEB", borderRadius: 7,
              padding: "8px 10px", fontSize: 13, color: "#161A19", resize: "vertical",
              minHeight: 80, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            }}
            defaultValue={block.type === "Heading" ? "Escribe un titular potente…" : "Escribe tu mensaje aquí…"}
          />
          <p style={{ fontSize: 11, color: "#9AA29D", margin: "6px 0 10px", fontWeight: 600 }}>VARIABLES</p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["{{nombre}}", "{{negocio}}", "{{email}}"].map((v) => (
              <span
                key={v}
                style={{
                  background: "#EAF4F0", color: "#0F766E", borderRadius: 5,
                  fontFamily: "monospace", padding: "2px 7px", fontSize: 12, cursor: "pointer",
                }}
              >
                {v}
              </span>
            ))}
          </div>
          <div
            style={{
              marginTop: 14, background: "#FBEFD0", borderRadius: 8, padding: "10px 12px",
              display: "flex", gap: 8, alignItems: "flex-start",
            }}
          >
            <Sparkles size={14} color="#9A6B12" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#9A6B12", fontSize: 12 }}>
                Asistente IA
              </p>
              <p style={{ margin: 0, color: "#9A6B12", fontSize: 12 }}>
                Escribe una instrucción para mejorar este texto…
              </p>
            </div>
          </div>
        </div>
      )}

      {block.type === "Button" && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6A736F", display: "block", marginBottom: 5 }}>
              ETIQUETA
            </label>
            <input
              defaultValue="Empezar ahora"
              style={{
                width: "100%", border: "0.5px solid #EAECEB", borderRadius: 7,
                padding: "7px 10px", fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6A736F", display: "block", marginBottom: 5 }}>
              ENLACE
            </label>
            <input
              defaultValue="https://"
              style={{
                width: "100%", border: "0.5px solid #EAECEB", borderRadius: 7,
                padding: "7px 10px", fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#6A736F", margin: "0 0 6px" }}>COLOR</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {["#0F766E", "#15655A", "#14B8A6", "#171B1A", "#1E3A8A"].map((c) => (
              <div
                key={c}
                style={{ width: 22, height: 22, borderRadius: "50%", background: c, cursor: "pointer" }}
              />
            ))}
          </div>
        </div>
      )}

      {block.type === "Hero" && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6A736F", display: "block", marginBottom: 5 }}>
              TÍTULO
            </label>
            <input
              defaultValue="¡Bienvenido a {{negocio}}!"
              style={{
                width: "100%", border: "0.5px solid #EAECEB", borderRadius: 7,
                padding: "7px 10px", fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6A736F", display: "block", marginBottom: 5 }}>
              SUBTÍTULO
            </label>
            <input
              defaultValue="Estás a 3 pasos de empezar"
              style={{
                width: "100%", border: "0.5px solid #EAECEB", borderRadius: 7,
                padding: "7px 10px", fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#6A736F", margin: "0 0 6px" }}>COLOR DE FONDO</p>
          <div style={{ display: "flex", gap: 6 }}>
            {["#15655A", "#0F766E", "#171B1A", "#1E3A8A", "#7C3AED"].map((c) => (
              <div
                key={c}
                style={{ width: 22, height: 22, borderRadius: "50%", background: c, cursor: "pointer" }}
              />
            ))}
          </div>
        </div>
      )}

      {(block.type === "Image" || block.type === "Video" || block.type === "Product") && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6A736F", display: "block", marginBottom: 5 }}>
              FUENTE
            </label>
            <button
              type="button"
              style={{
                width: "100%", border: "0.5px dashed #EAECEB", borderRadius: 7,
                padding: "10px", cursor: "pointer", background: "#F4F5F4",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                color: "#6A736F", fontSize: 13,
              }}
            >
              <Download size={13} /> Subir archivo
            </button>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6A736F", display: "block", marginBottom: 5 }}>
              TEXTO ALTERNATIVO
            </label>
            <input
              placeholder="Descripción de la imagen…"
              style={{
                width: "100%", border: "0.5px solid #EAECEB", borderRadius: 7,
                padding: "7px 10px", fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      )}

      {["Steps", "Columns", "Social", "Divider", "Spacer", "Footer", "Logo"].includes(block.type) && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6A736F", display: "block", marginBottom: 5 }}>
              ESPACIADO
            </label>
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#F4F5F4", borderRadius: 7, padding: "8px 12px", cursor: "pointer",
              }}
            >
              <span style={{ color: "#161A19" }}>Normal</span>
              <ChevronDown size={13} color="#9AA29D" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6A736F", display: "block", marginBottom: 5 }}>
              ALINEACIÓN
            </label>
            <div style={{ display: "flex", gap: 4 }}>
              {["Izquierda", "Centro", "Derecha"].map((a) => (
                <button
                  key={a}
                  type="button"
                  style={{
                    flex: 1, padding: "6px 4px", border: "0.5px solid #EAECEB",
                    background: a === "Centro" ? "#EAF4F0" : "#fff",
                    color: a === "Centro" ? "#0F766E" : "#6A736F",
                    borderColor: a === "Centro" ? "#0F766E" : "#EAECEB",
                    borderRadius: 6, fontSize: 11, cursor: "pointer",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 20, paddingTop: 14, borderTop: "0.5px solid #EAECEB" }}>
        <button
          type="button"
          onClick={onDuplicate}
          style={{
            flex: 1, padding: "8px", border: "0.5px solid #EAECEB", borderRadius: 7,
            background: "#fff", cursor: "pointer", fontSize: 13, color: "#33403C",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          <Copy size={13} /> Duplicar
        </button>
        <button
          type="button"
          onClick={onDelete}
          style={{
            flex: 1, padding: "8px", border: "0.5px solid #FECACA", borderRadius: 7,
            background: "#FEF2F2", cursor: "pointer", fontSize: 13, color: "#DC2626",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          <Trash2 size={13} /> Eliminar
        </button>
      </div>
    </div>
  )
}

function PreviewMini({ blocks }: { blocks: EmailBlock[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0" }}>
      <div
        style={{
          width: 230, height: 330, borderRadius: 24,
          border: "5px solid #161A19", background: "#EEF0EF",
          overflow: "hidden", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)",
            width: 60, height: 14, background: "#161A19", borderRadius: "0 0 10px 10px", zIndex: 10,
          }}
        />
        <div style={{ position: "absolute", inset: 0, overflowY: "hidden" }}>
          <div
            style={{
              transformOrigin: "top left",
              transform: "scale(0.362)",
              width: 600,
              background: "#fff",
            }}
          >
            {blocks.map((block) => (
              <BlockBody key={block.id} block={block} scale={0.362} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SubjectStrip({ mode, templateName }: { mode: "template" | "blank"; templateName?: string }) {
  const [subject, setSubject] = useState("¡Bienvenido a {{negocio}}! Empieza aquí")

  return (
    <div
      style={{
        background: "#fff", borderBottom: "0.5px solid #EAECEB",
        padding: "10px 20px", flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            background: mode === "template" ? "#EAF4F0" : "#F4F5F4",
            color: mode === "template" ? "#0F766E" : "#6A736F",
            fontSize: 10, fontWeight: 700, padding: "2px 7px",
            borderRadius: 5, letterSpacing: "0.04em",
          }}
        >
          {mode === "template"
            ? `PLANTILLA · ${templateName ?? "Bienvenida Pro"}`
            : "SIN PLANTILLA · Empieza desde cero"}
        </span>
        <button
          type="button"
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, color: "#0F766E", textDecoration: "underline",
            padding: 0,
          }}
        >
          {mode === "template" ? "Cambiar plantilla" : "Elegir plantilla"}
        </button>
      </div>

      <div
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#F4F5F4", borderRadius: 8, padding: "8px 12px", marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "#9AA29D", whiteSpace: "nowrap" }}>Asunto</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            fontSize: 14, color: "#161A19",
          }}
        />
        <span style={{ fontSize: 11, color: "#9AA29D", whiteSpace: "nowrap" }}>
          {subject.length} / 60 · 92% legible móvil
        </span>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          { icon: <Sparkles size={11} />, label: "Sugerir 3 alternativas con IA" },
          { icon: <AlignCenter size={11} />, label: "A/B testear" },
          { icon: <Plus size={11} />, label: "Insertar emoji" },
          { label: "{{nombre}}", mono: true },
        ].map((chip, i) => (
          <button
            key={i}
            type="button"
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: chip.mono ? "#EAF4F0" : "#F4F5F4",
              color: chip.mono ? "#0F766E" : "#33403C",
              border: "0.5px solid",
              borderColor: chip.mono ? "#DFEFE9" : "#EAECEB",
              borderRadius: 6, padding: "4px 10px", fontSize: 12,
              cursor: "pointer", fontFamily: chip.mono ? "monospace" : "inherit",
              fontWeight: chip.mono ? 600 : 400,
            }}
          >
            {chip.icon}
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepBar({ current }: { current: number }) {
  const steps = ["Contenido", "Audiencia", "Test A/B", "Programación", "Seguimiento"]
  return (
    <div
      style={{
        background: "#fff", borderBottom: "0.5px solid #EAECEB",
        display: "flex", alignItems: "center", padding: "0 24px",
        height: 44, gap: 0, flexShrink: 0,
      }}
    >
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "0 14px", height: 44,
              borderBottom: i === current ? "2px solid #0F766E" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 18, height: 18, borderRadius: "50%", fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: i < current ? "#0F766E" : i === current ? "#EAF4F0" : "#F4F5F4",
                color: i < current ? "#fff" : i === current ? "#0F766E" : "#9AA29D",
                border: i === current ? "1.5px solid #0F766E" : "1.5px solid transparent",
              }}
            >
              {i < current ? <Check size={10} /> : i + 1}
            </div>
            <span
              style={{
                fontSize: 13, fontWeight: i === current ? 600 : 400,
                color: i === current ? "#0F766E" : i < current ? "#33403C" : "#9AA29D",
              }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={14} color="#D4D8D5" />
          )}
        </div>
      ))}
    </div>
  )
}

function StepNav({ current, onBack, onNext }: { current: number; onBack: () => void; onNext: () => void }) {
  const steps = ["Contenido", "Audiencia", "Test A/B", "Programación", "Seguimiento"]
  return (
    <div
      style={{
        background: "#fff", borderTop: "0.5px solid #EAECEB",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", flexShrink: 0,
      }}
    >
      <button
        type="button"
        onClick={onBack}
        disabled={current === 0}
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
          border: "0.5px solid #EAECEB", borderRadius: 7, background: "#fff",
          cursor: current === 0 ? "not-allowed" : "pointer",
          opacity: current === 0 ? 0.4 : 1, fontSize: 13, color: "#33403C",
        }}
      >
        Atrás
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === current ? 18 : 6, height: 6,
                borderRadius: 3, transition: "width 0.2s",
                background: i < current ? "#0F766E" : i === current ? "#0F766E" : "#D4D8D5",
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#6A736F" }}>
          Paso {current + 1} de {steps.length} · {steps[current]}
        </span>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={current === steps.length - 1}
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
          border: "none", borderRadius: 7,
          background: current === steps.length - 1 ? "#F4F5F4" : "#0F766E",
          cursor: current === steps.length - 1 ? "not-allowed" : "pointer",
          color: current === steps.length - 1 ? "#9AA29D" : "#fff",
          fontSize: 13, fontWeight: 600,
        }}
      >
        {current < steps.length - 1 ? `Continuar · ${steps[current + 1]}` : "Lanzar campaña"}
        <ArrowRight size={14} />
      </button>
    </div>
  )
}

function GBar({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        background: "#fff", borderBottom: "0.5px solid #EAECEB",
        display: "flex", alignItems: "center", padding: "0 20px",
        height: 52, gap: 12, flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
        <div
          style={{
            width: 26, height: 26, background: "#0F766E", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 12 }}>C</span>
        </div>
        <span style={{ color: "#9AA29D", fontSize: 13 }}>/</span>
        <span style={{ color: "#9AA29D", fontSize: 13 }}>Marketing</span>
        <span style={{ color: "#9AA29D", fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#161A19" }}>Email Studio</span>
      </div>

      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#F4F5F4", borderRadius: 7, padding: "6px 12px",
          width: 220,
        }}
      >
        <Search size={13} color="#9AA29D" />
        <span style={{ fontSize: 13, color: "#9AA29D" }}>Buscar…</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          style={{
            background: "none", border: "none", width: 34, height: 34,
            borderRadius: 7, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Bell size={16} color="#6A736F" />
        </button>
        <button
          type="button"
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
            background: "#0F766E", border: "none", borderRadius: 7,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
          }}
        >
          <Plus size={14} /> Nuevo
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none", border: "0.5px solid #EAECEB", width: 34, height: 34,
            borderRadius: 7, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={15} color="#6A736F" />
        </button>
      </div>
    </div>
  )
}

function CBar({
  campaignName,
  onClose,
}: {
  campaignName: string
  onClose: () => void
}) {
  return (
    <div
      style={{
        background: "#fff", borderBottom: "0.5px solid #EAECEB",
        display: "flex", alignItems: "center", padding: "0 20px",
        height: 48, gap: 10, flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <input
          defaultValue={campaignName}
          style={{
            border: "none", outline: "none", fontSize: 14, fontWeight: 600,
            color: "#161A19", background: "none",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { icon: <Send size={13} />, label: "Enviar prueba", ghost: true },
          { icon: <Save size={13} />, label: "Guardar borrador", ghost: true },
          { icon: <Undo2 size={13} />, label: "", ghost: true, iconOnly: true },
          { icon: <Redo2 size={13} />, label: "", ghost: true, iconOnly: true },
        ].map((btn, i) => (
          <button
            key={i}
            type="button"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: btn.iconOnly ? "7px" : "7px 12px",
              border: "0.5px solid #EAECEB", borderRadius: 7,
              background: "#fff", cursor: "pointer", fontSize: 12, color: "#33403C",
            }}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
        <button
          type="button"
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
            background: "#0F766E", border: "none", borderRadius: 7,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
          }}
        >
          Programar envío <ChevronDown size={13} />
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none", border: "0.5px solid #EAECEB", width: 32, height: 32,
            borderRadius: 7, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={14} color="#6A736F" />
        </button>
      </div>
    </div>
  )
}

export default function EmailStudio({
  mode,
  campaignName = "Nueva campaña",
  campaignId,
  templateName,
  onClose,
}: EmailStudioProps) {
  const uid = useId()
  const [blocks, setBlocks] = useState<EmailBlock[]>(
    mode === "template" ? TEMPLATE_BLOCKS : BLANK_BLOCKS
  )
  const [selected, setSelected] = useState<string | null>(null)
  const [device, setDevice] = useState<Device>("desktop")
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("Bloque")
  const [step, setStep] = useState(0)

  const counter = useRef(100)

  const mkId = () => `b-${++counter.current}`

  const selectedBlock = selected ? blocks.find((b) => b.id === selected) ?? null : null

  const addBlock = useCallback(
    (afterIndex: number, type: BlockType = "Text") => {
      const newBlock: EmailBlock = { id: mkId(), type }
      setBlocks((prev) => {
        const next = [...prev]
        next.splice(afterIndex + 1, 0, newBlock)
        return next
      })
      setSelected(newBlock.id)
    },
    []
  )

  const moveUp = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }, [])

  const moveDown = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }, [])

  const duplicate = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id)
      if (idx < 0) return prev
      const copy: EmailBlock = { ...prev[idx], id: mkId() }
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
  }, [])

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    setSelected((s) => (s === id ? null : s))
  }, [])

  const INSPECTOR_TABS: InspectorTab[] = ["Bloque", "Estilos", "Bloques"]

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", flexDirection: "column",
        background: "#fff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <GBar onClose={onClose} />

      <div
        style={{
          background: "#fff", borderBottom: "0.5px solid #EAECEB",
          display: "flex", alignItems: "center", padding: "0 20px",
          height: 40, gap: 0, flexShrink: 0,
        }}
      >
        {["Campañas", "Segmentos", "Plantillas", "Entregabilidad"].map((t, i) => (
          <button
            key={t}
            type="button"
            style={{
              padding: "0 16px", height: 40, border: "none", background: "none",
              cursor: "pointer", fontSize: 13, fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? "#0F766E" : "#6A736F",
              borderBottom: i === 0 ? "2px solid #0F766E" : "2px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <CBar campaignName={campaignName} onClose={onClose} />
      <StepBar current={step} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div
          style={{
            width: 268, flexShrink: 0, borderRight: "0.5px solid #EAECEB",
            background: "#FAFAFA", display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <BlockLibraryPanel onAdd={(type) => addBlock(blocks.length - 1, type)} />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <SubjectStrip mode={mode} templateName={templateName} />
          <EmailCanvas
            blocks={blocks}
            selected={selected}
            device={device}
            onSelect={(id) => setSelected(id || null)}
            onAdd={addBlock}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onDuplicate={duplicate}
            onDelete={deleteBlock}
          />
        </div>

        <div
          style={{
            width: 332, flexShrink: 0, borderLeft: "0.5px solid #EAECEB",
            background: "#FAFAFA", display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              borderBottom: "0.5px solid #EAECEB", padding: "10px 14px 0",
              display: "flex", flexDirection: "column", gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#33403C" }}>Vista previa</span>
              <div
                style={{
                  display: "flex", gap: 2, background: "#F4F5F4",
                  borderRadius: 7, padding: 2,
                }}
              >
                {([
                  { d: "desktop" as Device, icon: <Monitor size={13} /> },
                  { d: "mobile" as Device, icon: <Smartphone size={13} /> },
                ] as const).map(({ d, icon }) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDevice(d)}
                    style={{
                      border: "none", borderRadius: 5, padding: "4px 8px",
                      cursor: "pointer", display: "flex", alignItems: "center",
                      background: device === d ? "#fff" : "transparent",
                      color: device === d ? "#0F766E" : "#9AA29D",
                      boxShadow: device === d ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <PreviewMini blocks={blocks} />

          <div style={{ borderTop: "0.5px solid #EAECEB", borderBottom: "0.5px solid #EAECEB" }}>
            <div style={{ display: "flex" }}>
              {INSPECTOR_TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setInspectorTab(t)}
                  style={{
                    flex: 1, padding: "9px 4px", border: "none", background: "none",
                    cursor: "pointer", fontSize: 12, fontWeight: inspectorTab === t ? 700 : 400,
                    color: inspectorTab === t ? "#0F766E" : "#9AA29D",
                    borderBottom: inspectorTab === t ? "2px solid #0F766E" : "2px solid transparent",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {inspectorTab === "Bloque" && (
              <Inspector
                block={selectedBlock}
                onDelete={() => selected && deleteBlock(selected)}
                onDuplicate={() => selected && duplicate(selected)}
              />
            )}
            {inspectorTab === "Estilos" && <StylePanel />}
            {inspectorTab === "Bloques" && (
              <BlockLibraryPanel onAdd={(type) => addBlock(blocks.length - 1, type)} />
            )}
          </div>
        </div>
      </div>

      <StepNav
        current={step}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => setStep((s) => Math.min(4, s + 1))}
      />

      <style>{`
        .spacer-block:hover::after {
          content: attr(data-label);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(15,118,110,0.12);
          color: #0F766E;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
