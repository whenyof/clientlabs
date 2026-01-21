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
  height
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-700/50 via-gray-600/50 to-gray-700/50"

  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg"
  }

  const style = {
    width: width || (variant === "text" ? "100%" : undefined),
    height: height || (variant === "text" ? "1rem" : variant === "circular" ? "2.5rem" : "1rem")
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      <div className="bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="w-72 bg-gray-900/50 backdrop-blur-xl border-r border-white/10 p-6 space-y-8">
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

      <div className="pt-6 border-t border-white/10">
        <Skeleton variant="circular" className="h-10 w-10 mb-3" />
        <Skeleton variant="text" className="h-4 w-20 mb-1" />
        <Skeleton variant="text" className="h-3 w-16" />
      </div>
    </div>
  )
}