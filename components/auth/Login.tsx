"use client"

import GoogleButton from "./GoogleButton"
import { signIn } from "next-auth/react"
import { useState } from "react"

type Props = {
  onSwitch: () => void
}

export default function Login({ onSwitch }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    })

    setLoading(false)
  }

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold text-center">Iniciar sesión</h2>

      <GoogleButton />

      <div className="flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" />o<div className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4"
          placeholder="Email"
          required
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4"
          placeholder="Contraseña"
          type="password"
          required
        />

        <button className="w-full h-11 rounded-full bg-purple-600 font-semibold">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-sm text-white/60">
        ¿No tienes cuenta?{" "}
        <button onClick={onSwitch} className="text-purple-400">
          Regístrate
        </button>
      </p>
    </div>
  )
}