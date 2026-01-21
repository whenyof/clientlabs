import Link from "next/link"
import { ReactNode } from "react"

type ButtonSize = "sm" | "md"

type ButtonProps = {
  href: string
  children: ReactNode
  className?: string
  size?: ButtonSize
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  disabled?: boolean
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-8 py-3 text-sm",
}

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-semibold transition will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050814] active:scale-[0.98]"

export function PrimaryButton({
  href,
  children,
  className = "",
  size = "md",
  type = "button",
  onClick,
  disabled,
}: ButtonProps) {
  const classes = `${baseClasses} ${sizeClasses[size]} bg-gradient-to-r from-[#7C3AED] via-indigo-500 to-blue-500 text-white shadow-xl shadow-purple-800/30 hover:shadow-purple-800/60 hover:scale-[1.02] ${className}`
  if (!href) {
    return (
      <button type={type} className={classes} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    )
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}

export function SecondaryButton({ href, children, className = "", size = "md" }: ButtonProps) {
  return (
    <Link
      href={href}
      className={`${baseClasses} ${sizeClasses[size]} border border-white/20 text-white/80 hover:border-white/40 hover:scale-[1.02] ${className}`}
    >
      {children}
    </Link>
  )
}

export function LinkButton({ href, children, className = "" }: Omit<ButtonProps, "size">) {
  return (
    <Link href={href} className={`text-sm font-semibold text-white/80 hover:text-white transition ${className}`}>
      {children}
    </Link>
  )
}


