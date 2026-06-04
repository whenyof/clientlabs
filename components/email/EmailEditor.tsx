"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Color from "@tiptap/extension-color"
import TextStyle from "@tiptap/extension-text-style"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import { useState, useCallback, useMemo } from "react"
import DOMPurify from "dompurify"
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  Heading1, Heading2, ChevronDown, Eye, EyeOff,
} from "lucide-react"

interface EmailEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

const VARIABLES = [
  { label: "Nombre", value: "{{nombre}}" },
  { label: "Email", value: "{{email}}" },
  { label: "Empresa", value: "{{empresa}}" },
  { label: "Nombre negocio", value: "{{negocio}}" },
  { label: "Tu nombre", value: "{{usuario.nombre}}" },
]

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

export function EmailEditor({ content, onChange, placeholder, minHeight = 280 }: EmailEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showVarMenu, setShowVarMenu] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)

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

        {/* Link */}
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

        <div className="ml-auto">
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
  )
}
