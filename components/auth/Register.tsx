"use client"

import { useState } from "react"
import GoogleButton from "./GoogleButton"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"

type Props = {
 onSwitch: () => void
}

export default function Register({ onSwitch }: Props) {
 const [show, setShow] = useState(false)
 const [accepted, setAccepted] = useState(false)
 const [password, setPassword] = useState("")
 const [focus, setFocus] = useState(false)
 const [email, setEmail] = useState("")
 const [name, setName] = useState("")
 const [confirm, setConfirm] = useState("")
 const [loading, setLoading] = useState(false)

 const hasUpper = /[A-Z]/.test(password)
 const hasLower = /[a-z]/.test(password)
 const hasNumber = /\d/.test(password)
 const hasSymbol = /[_!]/.test(password)
 const longEnough = password.length >= 8

 const score =
 [hasUpper, hasLower, hasNumber, hasSymbol, longEnough].filter(Boolean).length

 async function handleRegister(e: React.FormEvent) {
 e.preventDefault()

 if (password !== confirm) {
 alert("Las contraseñas no coinciden")
 return
 }

 setLoading(true)

 const res = await fetch("/api/register", {
 method: "POST",
 body: JSON.stringify({ name, email, password }),
 })

 setLoading(false)

 if (res.ok) {
 await signIn("credentials", {
 email,
 password,
 callbackUrl: "/dashboard",
 })
 } else {
 alert("Error al crear cuenta")
 }
 }

 return (
 <div className="space-y-6 pt-2">

 {/* TITLE */}
 <div className="text-center">
 <h2 className="text-2xl font-bold">Crear cuenta</h2>
 <p className="text-sm text-[var(--text-secondary)] mt-1">
 Empieza gratis en menos de 1 minuto
 </p>
 </div>

 <GoogleButton />

 <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
 <div className="h-px flex-1 bg-[var(--bg-card)]" />
 o
 <div className="h-px flex-1 bg-[var(--bg-card)]" />
 </div>

 {/* FORM */}
 <form className="space-y-5" onSubmit={handleRegister}>

 <input
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full h-11 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4"
 placeholder="Nombre"
 required
 />

 <input
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full h-11 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4"
 placeholder="Email"
 required
 />

 {/* PASSWORD */}
 <div className="relative space-y-2">

 <div className="relative">
 <input
 type={show ? "text" : "password"}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 onFocus={() => setFocus(true)}
 onBlur={() => setFocus(false)}
 className="w-full h-11 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4 pr-12"
 placeholder="Contraseña"
 required
 />

 <button
 type="button"
 onClick={() => setShow(!show)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
 >
 {show ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>

 {/* TOOLTIP */}
 {focus && (
 <div className="
 absolute left-full ml-4 top-0
 w-56 p-4
 rounded-xl
 border border-[var(--border-subtle)]
 bg-[var(--bg-card)] backdrop-
 shadow-sm
 text-xs
 z-50
 ">
 <p className="font-semibold mb-2 text-[var(--text-primary)]">Requisitos</p>

 <ul className="space-y-1">
 <li className={hasUpper ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>✔ 1 mayúscula</li>
 <li className={hasLower ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>✔ 1 minúscula</li>
 <li className={hasNumber ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>✔ 1 número</li>
 <li className={hasSymbol ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>✔ 1 símbolo (_ !)</li>
 <li className={longEnough ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>✔ Mín 8 caracteres</li>
 </ul>
 </div>
 )}

 <input
 type="password"
 value={confirm}
 onChange={(e) => setConfirm(e.target.value)}
 className="w-full h-11 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4"
 placeholder="Confirmar contraseña"
 required
 />
 </div>

 {/* TERMS */}
 <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] ml-1">
 <input
 type="checkbox"
 checked={accepted}
 onChange={(e) => setAccepted(e.target.checked)}
 className="accent-purple-500 w-4"
 />
 <span>
 Acepto los{" "}
 <a href="/terminos" target="_blank" className="text-[var(--accent)]-hover hover:underline">
 términos y condiciones
 </a>
 </span>
 </label>

 <button
 disabled={!accepted || score < 4 || loading}
 className="w-full h-12 rounded-full bg-[var(--bg-card)] font-semibold disabled:opacity-40"
 >
 {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
 </button>
 </form>

 <p className="text-center text-sm text-[var(--text-secondary)]">
 ¿Ya tienes cuenta?{" "}
 <button onClick={onSwitch} className="text-[var(--accent)]-hover hover:underline">
 Inicia sesión
 </button>
 </p>
 </div>
 )
}