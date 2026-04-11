import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-[80px] font-bold text-[#1FA97A] leading-none mb-4">404</div>
        <h1 className="text-[24px] font-bold text-[#0B1F2A] mb-3">Página no encontrada</h1>
        <p className="text-slate-500 text-[14px] leading-relaxed mb-8">
          Esta página no existe o ha sido movida.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 bg-[#1FA97A] text-white text-[13px] font-medium rounded-lg hover:bg-[#1a9068] transition-colors"
          >
            Volver al inicio
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 border border-slate-200 text-slate-600 text-[13px] font-medium rounded-lg hover:border-[#1FA97A] transition-colors"
          >
            Empezar gratis
          </Link>
        </div>
      </div>
    </div>
  )
}
