import { BackgroundGlow, Navbar } from "../ui/chrome"

export default function Login() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white">
      <BackgroundGlow />
      <Navbar />

      <section className="mx-auto flex max-w-md flex-col gap-6 px-6 pt-28 pb-20 md:pt-32">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Login</p>
          <h1 className="text-3xl font-semibold">Accede a tu panel</h1>
          <p className="text-white/60">Operación centralizada, sin ruido.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="tú@empresa.com"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] via-indigo-500 to-blue-500 px-4 py-3 text-sm font-semibold shadow-lg shadow-purple-800/30 transition hover:shadow-purple-800/50"
            >
              Acceder
            </button>
            <div className="text-center text-xs text-white/50">
              ¿No tienes cuenta?{" "}
              <a href="/register" className="text-white hover:underline">
                Empezar gratis
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}