"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Color from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import { useState, useCallback, useMemo } from "react"
import DOMPurify from "dompurify"
import {
  Bold, Italic, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  Heading1, Heading2, ChevronDown, Eye, EyeOff,
  Sparkles, X, Loader2, Check,
} from "lucide-react"

interface EmailEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  onSubjectGenerated?: (subject: string) => void
}

const VARIABLES = [
  { label: "Nombre", value: "{{nombre}}" },
  { label: "Email", value: "{{email}}" },
  { label: "Empresa", value: "{{empresa}}" },
  { label: "Nombre negocio", value: "{{negocio}}" },
  { label: "Tu nombre", value: "{{usuario.nombre}}" },
]

const TONES = [
  { value: "profesional", label: "Profesional" },
  { value: "cercano", label: "Cercano" },
  { value: "urgente", label: "Urgente" },
  { value: "informativo", label: "Informativo" },
] as const

type Tone = (typeof TONES)[number]["value"]
type AIMode = "subject" | "content" | "improve"

function ToolbarBtn({
  onClick, active, title, children, disabled,
}: {
  onClick: () => void; active?: boolean; title: string
  children: React.ReactNode; disabled?: boolean
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-[var(--accent)] text-white"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      } disabled:opacity-30`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-slate-200 mx-0.5 self-center" />
}

// ── AI Panel ──────────────────────────────────────────────────────────────────

function AIPanel({
  editorContent,
  onInsertContent,
  onSubjectGenerated,
  onClose,
}: {
  editorContent: string
  onInsertContent: (html: string) => void
  onSubjectGenerated?: (subject: string) => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<AIMode>("subject")
  const [prompt, setPrompt] = useState("")
  const [tone, setTone] = useState<Tone>("profesional")
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [generatedContent, setGeneratedContent] = useState("")
  const [error, setError] = useState("")

  const generate = async () => {
    if (!prompt.trim() && mode !== "improve") return
    setLoading(true)
    setError("")
    setSubjects([])
    setGeneratedContent("")

    try {
      const res = await fetch("/api/email/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          prompt: prompt.trim() || "Mejorar el email",
          tone,
          existingContent: mode === "improve" ? editorContent : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error generando contenido")
      if (mode === "subject") setSubjects(data.subjects ?? [])
      else setGeneratedContent(data.content ?? "")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const insertContent = () => {
    if (generatedContent) { onInsertContent(generatedContent); onClose() }
  }

  const selectSubject = (s: string) => {
    onSubjectGenerated?.(s)
    onClose()
  }

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-lg overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-semibold text-slate-800">Generar con IA</span>
        </div>
        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-slate-200 transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b border-slate-100">
        {(["subject", "content", "improve"] as AIMode[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setSubjects([]); setGeneratedContent(""); setError("") }}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              mode === m ? "text-violet-600 border-b-2 border-violet-500 bg-violet-50/50" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {m === "subject" ? "Asunto" : m === "content" ? "Contenido" : "Mejorar"}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {/* Prompt input */}
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1.5">
            {mode === "subject" ? "¿Sobre qué es el email?" : mode === "content" ? "Describe el email que necesitas" : "¿Qué quieres mejorar?"}
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), generate())}
            rows={2}
            placeholder={
              mode === "subject" ? "Ej: Lanzamiento de producto con descuento 20%..." :
              mode === "content" ? "Ej: Email de bienvenida para nuevos suscriptores..." :
              "Ej: Hazlo más corto y directo..."
            }
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-violet-400 resize-none"
          />
        </div>

        {/* Tone selector */}
        {mode !== "improve" && (
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Tono</label>
            <div className="flex gap-1.5 flex-wrap">
              {TONES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    tone === t.value ? "bg-violet-100 text-violet-700 border border-violet-300" : "bg-slate-100 text-slate-600 border border-transparent hover:border-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          type="button"
          onClick={generate}
          disabled={loading || (mode !== "improve" && !prompt.trim())}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: loading ? "#7c3aed80" : "#7c3aed" }}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</> : <><Sparkles className="w-4 h-4" /> Generar</>}
        </button>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Subject results */}
        {subjects.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500">Selecciona un asunto:</p>
            {subjects.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectSubject(s)}
                className="w-full text-left px-3 py-2 text-xs rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-colors text-slate-700 group flex items-start justify-between gap-2"
              >
                <span>{s}</span>
                <Check className="w-3.5 h-3.5 text-violet-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </button>
            ))}
          </div>
        )}

        {/* Content result */}
        {generatedContent && (
          <div className="space-y-2">
            <div
              className="p-3 text-xs border border-slate-200 rounded-lg max-h-40 overflow-y-auto prose prose-xs"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatedContent) }}
            />
            <button
              type="button"
              onClick={insertContent}
              className="w-full py-1.5 rounded-lg text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
            >
              Insertar en el editor
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function EmailEditor({ content, onChange, placeholder, minHeight = 280, onSubjectGenerated }: EmailEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showVarMenu, setShowVarMenu] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Color,
      TextStyle,
      Placeholder.configure({
        placeholder: placeholder ?? "Escribe el contenido del email…",
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
        style: `min-height:${minHeight}px;padding:16px`,
      },
    },
  })

  const insertVariable = useCallback(
    (v: string) => {
      editor?.chain().focus().insertContent(v).run()
      setShowVarMenu(false)
    },
    [editor]
  )

  const applyLink = useCallback(() => {
    if (!linkUrl) {
      editor?.chain().focus().unsetLink().run()
    } else {
      editor?.chain().focus().setLink({ href: linkUrl }).run()
    }
    setShowLinkInput(false)
    setLinkUrl("")
  }, [editor, linkUrl])

  const insertAIContent = useCallback((html: string) => {
    editor?.chain().focus().setContent(html).run()
    onChange(html)
  }, [editor, onChange])

  const chars = editor?.storage.characterCount.characters() ?? 0
  const words = editor?.storage.characterCount.words() ?? 0

  const safePreviewHtml = useMemo(() => {
    const raw = editor?.getHTML() ?? ""
    if (typeof window === "undefined") return ""
    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ["p","br","strong","em","u","h1","h2","h3","ul","ol","li","a","span","div","blockquote"],
      ALLOWED_ATTR: ["href","rel","target","style","class"],
      ALLOW_DATA_ATTR: false,
    })
  }, [showPreview, editor])

  return (
    <div className="space-y-2">
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50">
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Negrita (Ctrl+B)">
            <Bold className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Cursiva (Ctrl+I)">
            <Italic className="w-3.5 h-3.5" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive("heading", { level: 1 })} title="Título H1">
            <Heading1 className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} title="Subtítulo H2">
            <Heading2 className="w-3.5 h-3.5" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Lista">
            <List className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Lista numerada">
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign("left").run()} active={editor?.isActive({ textAlign: "left" })} title="Alinear izquierda">
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign("center").run()} active={editor?.isActive({ textAlign: "center" })} title="Centrar">
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign("right").run()} active={editor?.isActive({ textAlign: "right" })} title="Alinear derecha">
            <AlignRight className="w-3.5 h-3.5" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn onClick={() => setShowLinkInput((v) => !v)} active={editor?.isActive("link") || showLinkInput} title="Insertar enlace">
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolbarBtn>

          <Divider />

          {/* Variables dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowVarMenu((v) => !v) }}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--accent)] hover:bg-emerald-50 transition-colors"
            >
              {"{ }"} Variables <ChevronDown className="w-3 h-3" />
            </button>
            {showVarMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                {VARIABLES.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); insertVariable(v.value) }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700"
                  >
                    <span className="font-mono text-[var(--accent)]">{v.value}</span>
                    <span className="text-slate-400 ml-2">{v.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-0.5">
            {/* AI button */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowAIPanel(v => !v) }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                showAIPanel
                  ? "bg-violet-100 text-violet-700"
                  : "text-violet-600 hover:bg-violet-50"
              }`}
              title="Generar con IA"
            >
              <Sparkles className="w-3.5 h-3.5" />
              IA
            </button>

            <Divider />

            <ToolbarBtn
              onClick={() => setShowPreview((v) => !v)}
              active={showPreview}
              title={showPreview ? "Editar" : "Vista previa"}
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </ToolbarBtn>
          </div>
        </div>

        {/* Link input bar */}
        {showLinkInput && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyLink()}
              placeholder="https://..."
              className="flex-1 text-sm px-2 py-1 border border-blue-200 rounded bg-white outline-none focus:ring-1 focus:ring-blue-400"
              autoFocus
            />
            <button type="button" onClick={applyLink} className="text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition-colors">
              Aplicar
            </button>
            <button type="button" onClick={() => setShowLinkInput(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded">
              Cancelar
            </button>
          </div>
        )}

        {/* Editor / Preview */}
        {showPreview ? (
          <div
            className="p-4 prose prose-sm max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: safePreviewHtml }}
          />
        ) : (
          <div className="prose prose-sm max-w-none" onClick={() => editor?.commands.focus()}>
            <EditorContent editor={editor} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400">
          <span>{words} palabras</span>
          <span>{chars} caracteres</span>
        </div>
      </div>

      {/* AI Panel */}
      {showAIPanel && (
        <AIPanel
          editorContent={editor?.getHTML() ?? ""}
          onInsertContent={insertAIContent}
          onSubjectGenerated={onSubjectGenerated}
          onClose={() => setShowAIPanel(false)}
        />
      )}
    </div>
  )
}
