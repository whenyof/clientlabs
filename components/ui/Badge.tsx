interface BadgeProps {
  variant: "pro" | "new" | "beta" | "premium"
  children: React.ReactNode
  className?: string
}

const variants = {
  pro: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
  new: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
  beta: "bg-gradient-to-r from-orange-500 to-yellow-500 text-black",
  premium: "bg-gradient-to-r from-purple-700 to-indigo-700 text-white",
}

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}