export function BackgroundGlow() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.2),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(124,58,237,0.16),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_22%,rgba(255,255,255,0.04)_45%,rgba(255,255,255,0)_68%,rgba(255,255,255,0.04)_90%)] opacity-30" />
    </>
  )
}

export function LogoMark({ size = "md" }: { size?: "md" | "sm" }) {
  const dimension = size === "sm" ? "h-9 w-9 text-sm" : "h-10 w-10 text-lg"
  return (
    <div
      className={`flex ${dimension} items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] via-indigo-500 to-blue-500 font-black shadow-lg shadow-purple-800/25`}
    >
      <span className="sr-only">ClientLabs</span>
      <span aria-hidden>◎</span>
    </div>
  )
}

export function Navbar() {
  const navItems = [
    { label: "Producto", href: "/producto" },
    { label: "Precios", href: "/precios" },
    { label: "Empresa", href: "/about" },
    { label: "Seguridad", href: "/seguridad" },
    { label: "Contacto", href: "/contacto" },
  ]

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
        {/* Left */}
        <a href="/" className="flex items-center gap-3 text-white">
          <LogoMark />
          <span className="text-base font-semibold tracking-tight">ClientLabs</span>
        </a>

        {/* Center */}
        <div className="mx-auto hidden items-center gap-6 text-sm text-white/70 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-2 py-1 transition hover:text-white hover:bg-white/5"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2">
          <a
            href="/login"
            className="hidden rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-white/80 transition hover:border-white/40 hover:text-white md:inline-flex"
          >
            Login
          </a>
          <a
            href="/register"
            className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black shadow-lg shadow-white/10 transition hover:bg-white/90"
          >
            Empezar
          </a>
        </div>
      </div>
    </nav>
  )
}

