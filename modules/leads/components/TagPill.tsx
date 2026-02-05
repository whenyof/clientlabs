import { X } from "lucide-react"

type TagPillProps = {
    tag: string
    onRemove?: () => void
    size?: "sm" | "md"
}

// Get tag color based on prefix
function getTagColor(tag: string): { bg: string; border: string; text: string } {
    if (tag === "imported") {
        return {
            bg: "bg-blue-500/10",
            border: "border-blue-500/30",
            text: "text-blue-400"
        }
    }
    if (tag.startsWith("domain:")) {
        return {
            bg: "bg-purple-500/10",
            border: "border-purple-500/30",
            text: "text-purple-400"
        }
    }
    if (tag.startsWith("source:")) {
        return {
            bg: "bg-slate-500/10",
            border: "border-slate-500/30",
            text: "text-slate-400"
        }
    }
    // Custom tags
    return {
        bg: "bg-white/5",
        border: "border-white/20",
        text: "text-white/70"
    }
}

export function TagPill({ tag, onRemove, size = "sm" }: TagPillProps) {
    const colors = getTagColor(tag)
    const sizeClasses = size === "sm"
        ? "px-2 py-0.5 text-xs"
        : "px-2.5 py-1 text-sm"

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border ${colors.bg} ${colors.border} ${colors.text} ${sizeClasses} font-medium transition-all`}
        >
            {tag}
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove()
                    }}
                    className="hover:bg-white/10 rounded-full p-0.5 transition-colors"
                    title="Eliminar tag"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </span>
    )
}
