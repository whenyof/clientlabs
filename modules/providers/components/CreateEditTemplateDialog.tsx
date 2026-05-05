"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
    createProviderEmailTemplate,
    updateProviderEmailTemplate,
} from "@/app/dashboard/providers/actions"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { HelpCircle, ListOrdered } from "lucide-react"

const TEMPLATE_VARIABLES = [
    { key: "{nombre_proveedor}", desc: "Nombre del proveedor" },
    { key: "{fecha_pedido}", desc: "Fecha del pedido" },
    { key: "{numero_pedido}", desc: "Número del pedido" },
    { key: "{lineas_pedido}", desc: "Detalle de líneas (productos, cantidades, importes)" },
    { key: "{importe_total}", desc: "Importe total del pedido" },
    { key: "{notas_pedido}", desc: "Observaciones del pedido" },
]

const DEFAULT_BODY = `Hola,

Te enviamos el pedido nº {numero_pedido} con fecha {fecha_pedido}.

Detalle del pedido:
{lineas_pedido}

Importe total:
{importe_total}

Observaciones:
{notas_pedido}

Gracias.`

export type ProviderEmailTemplateRow = {
    id: string
    name: string
    subject: string
    body: string
    isDefault: boolean
}

type CreateEditTemplateDialogProps = {
    providerId: string
    providerName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    template?: ProviderEmailTemplateRow | null
}

export function CreateEditTemplateDialog({
    providerId,
    providerName,
    open,
    onOpenChange,
    onSuccess,
    template,
}: CreateEditTemplateDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")
    const [isDefault, setIsDefault] = useState(false)
    const [activeField, setActiveField] = useState<"subject" | "body">("body")
    const subjectRef = useRef<HTMLInputElement>(null)
    const bodyRef = useRef<HTMLTextAreaElement | null>(null)
    const isEdit = Boolean(template?.id)

    useEffect(() => {
        if (open && template) {
            setName(template.name)
            setSubject(template.subject)
            setBody(template.body)
            setIsDefault(template.isDefault)
        } else if (open && !template) {
            setName("")
            setSubject("")
            setBody(DEFAULT_BODY)
            setIsDefault(false)
        }
    }, [open, template])

    const insertVariable = (variableKey: string) => {
        if (activeField === "subject" && subjectRef.current) {
            const el = subjectRef.current
            const start = el.selectionStart ?? el.value.length
            const end = el.selectionEnd ?? el.value.length
            const newValue = subject.slice(0, start) + variableKey + subject.slice(end)
            setSubject(newValue)
            requestAnimationFrame(() => {
                const pos = start + variableKey.length
                el.setSelectionRange(pos, pos)
                el.focus()
            })
        } else if (activeField === "body" && bodyRef.current) {
            const el = bodyRef.current
            const start = el.selectionStart ?? el.value.length
            const end = el.selectionEnd ?? el.value.length
            const newValue = body.slice(0, start) + variableKey + body.slice(end)
            setBody(newValue)
            requestAnimationFrame(() => {
                const pos = start + variableKey.length
                el.setSelectionRange(pos, pos)
                el.focus()
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            toast.error("El nombre es obligatorio")
            return
        }
        if (!subject.trim()) {
            toast.error("El asunto es obligatorio")
            return
        }
        setLoading(true)
        try {
            if (isEdit && template) {
                const result = await updateProviderEmailTemplate(template.id, {
                    name: name.trim(),
                    subject: subject.trim(),
                    body,
                    isDefault,
                })
                if (result.success) {
                    toast.success("Plantilla actualizada")
                    onOpenChange(false)
                    onSuccess?.()
                    router.refresh()
                } else {
                    toast.error(result.error || "Error al actualizar")
                }
            } else {
                const result = await createProviderEmailTemplate({
                    providerId,
                    name: name.trim(),
                    subject: subject.trim(),
                    body,
                    isDefault,
                })
                if (result.success) {
                    toast.success("Plantilla creada")
                    onOpenChange(false)
                    onSuccess?.()
                    router.refresh()
                    setName("")
                    setSubject("")
                    setBody(DEFAULT_BODY)
                    setIsDefault(false)
                } else {
                    toast.error(result.error || "Error al crear")
                }
            }
        } catch {
            toast.error("Error al guardar")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden",
                    "bg-[var(--bg-card)] border-[var(--border-main)]"
                )}
            >
                <DialogHeader className="p-6 pb-4 shrink-0 border-b border-[var(--border-main)]">
                    <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
                        {isEdit ? "Editar plantilla" : "Nueva plantilla de pedido"}
                    </DialogTitle>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                        {isEdit
                            ? "Modifica el correo que se enviará al proveedor con cada pedido."
                            : "Crea un correo reutilizable. Al hacer un pedido, las líneas del catálogo se insertarán automáticamente."}
                    </p>
                    {providerName && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                            Proveedor: {providerName}
                        </p>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0 flex-1 min-h-0 min-h-[320px]">
                        {/* Columna izquierda: configuración y ayuda */}
                        <div
                            className={cn(
                                "flex flex-col gap-4 p-5 border-b lg:border-b-0 lg:border-r border-[var(--border-main)]",
                                "bg-[var(--bg-main)]/40 overflow-auto"
                            )}
                        >
                            <div>
                                <Label htmlFor="tpl-name" className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                                    Nombre de la plantilla *
                                </Label>
                                <Input
                                    id="tpl-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1.5 h-9 bg-[var(--bg-card)] border-[var(--border-main)] text-sm"
                                    placeholder="Ej: Pedido estándar"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="tpl-default"
                                    checked={isDefault}
                                    onCheckedChange={(c) => setIsDefault(Boolean(c))}
                                />
                                <Label
                                    htmlFor="tpl-default"
                                    className="text-xs text-[var(--text-secondary)] cursor-pointer leading-tight"
                                >
                                    Usar como plantilla predeterminada
                                </Label>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <HelpCircle className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                                    <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                                        Variables
                                    </span>
                                </div>
                                <p className="text-[11px] text-[var(--text-secondary)] mb-2">
                                    Clic para insertar en {activeField === "subject" ? "asunto" : "cuerpo"}.
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {TEMPLATE_VARIABLES.map((v) => (
                                        <button
                                            key={v.key}
                                            type="button"
                                            onClick={() => insertVariable(v.key)}
                                            className={cn(
                                                "inline-flex px-2 py-1 rounded text-[11px] font-mono",
                                                "bg-[var(--bg-card)] border border-[var(--border-main)]",
                                                "hover:bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors"
                                            )}
                                            title={v.desc}
                                        >
                                            {v.key}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tarjeta explicativa {lineas_pedido} */}
                            <div
                                className={cn(
                                    "rounded-lg border border-[var(--border-main)] p-3",
                                    "bg-[var(--bg-card)]"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <ListOrdered className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                                    <span className="text-xs font-medium text-[var(--text-primary)]">
                                        {"{lineas_pedido}"}
                                    </span>
                                </div>
                                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-2">
                                    Se sustituye por una lista o tabla con: código del producto, nombre, precio por unidad, cantidad e importe por línea. Debajo se muestra el total con {"{importe_total}"}.
                                </p>
                            </div>

                            {/* Mini preview de ejemplo */}
                            <div
                                className={cn(
                                    "rounded-lg border border-[var(--border-main)] p-3",
                                    "bg-[var(--bg-card)]/80"
                                )}
                            >
                                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                                    Ejemplo de líneas
                                </span>
                                <pre className="mt-2 text-[10px] text-[var(--text-secondary)] leading-relaxed font-sans whitespace-pre-wrap break-words">
{`COD-001  Coca-Cola 330ml    1,20 €  x2  2,40 €
COD-002  Fanta Naranja 330ml 1,10 €  x4  4,40 €

Total: 6,80 €`}
                                </pre>
                            </div>
                        </div>

                        {/* Columna derecha: asunto y cuerpo (bloque principal) */}
                        <div className="flex flex-col gap-4 p-6 overflow-auto">
                            <div>
                                <Label htmlFor="tpl-subject" className="text-sm font-medium text-[var(--text-primary)]">
                                    Asunto del correo *
                                </Label>
                                <Input
                                    ref={subjectRef}
                                    id="tpl-subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    onFocus={() => setActiveField("subject")}
                                    className="mt-1.5 bg-[var(--bg-main)] border-[var(--border-main)]"
                                    placeholder="Ej: Pedido {numero_pedido} - {nombre_proveedor}"
                                    required
                                />
                            </div>
                            <div className="flex-1 flex flex-col min-h-0">
                                <Label htmlFor="tpl-body" className="text-sm font-medium text-[var(--text-primary)]">
                                    Cuerpo del correo
                                </Label>
                                <textarea
                                    ref={bodyRef}
                                    id="tpl-body"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    onFocus={() => setActiveField("body")}
                                    className={cn(
                                        "mt-1.5 w-full flex-1 min-h-[280px] rounded-md border px-3 py-2 text-sm resize-y",
                                        "bg-[var(--bg-main)] border-[var(--border-main)]",
                                        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                                    )}
                                    placeholder="Escribe el mensaje. Usa las variables de la columna izquierda."
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-4 border-t border-[var(--border-main)] shrink-0 gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear plantilla"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
