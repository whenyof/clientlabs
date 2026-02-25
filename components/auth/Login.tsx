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

 <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
 <div className="h-px flex-1 bg-[var(--bg-card)]" />o<div className="h-px flex-1 bg-[var(--bg-card)]" />
 </div>

 <form className="space-y-4" onSubmit={handleLogin}>
 <input
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full h-11 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4"
 placeholder="Email"
 required
 />

 <input
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full h-11 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4"
 placeholder="Contraseña"
 type="password"
 required
 />

 <button className="w-full h-11 rounded-full bg-[var(--accent-soft)]-primary font-semibold">
 {loading ? "Entrando..." : "Entrar"}
 </button>
 </form>

 <p className="text-center text-sm text-[var(--text-secondary)]">
 ¿No tienes cuenta?{" "}
 <button onClick={onSwitch} className="text-[var(--accent)]-hover">
 Regístrate
 </button>
 </p>
 </div>
 )
}