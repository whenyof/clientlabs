interface SkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular"
  width?: string
  height?: string
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-[var(--bg-card)] "

  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  }

  const style = {
    width: width || (variant === "text" ? "100%" : undefined),
    height:
      height ||
      (variant === "text"
        ? "1rem"
        : variant === "circular"
          ? "2.5rem"
          : "1rem"),
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      <div className="bg-[var(--bg-card)] animate-shimmer" />
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="w-72 bg-[var(--bg-card)]/50 backdrop- border-r border-[var(--border-subtle)] p-6 space-y-8">
      <Skeleton variant="text" className="h-8 w-32" />

      <div className="space-y-8">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-3">
            <Skeleton variant="text" className="h-3 w-16" />
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-[var(--border-subtle)]">
        <Skeleton variant="circular" className="h-10 w-10 mb-3" />
        <Skeleton variant="text" className="h-4 w-20 mb-1" />
        <Skeleton variant="text" className="h-3 w-16" />
      </div>
    </div>
  )
}

