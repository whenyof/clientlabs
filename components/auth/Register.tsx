"use client"

import { useState } from "react"
import GoogleButton from "./GoogleButton"

type Props = {
  onSwitch: () => void
}

export default function Register({ onSwitch }: Props) {
  const [show, setShow] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [password, setPassword] = useState("")

  const strong =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)

  return (
    <div className="space-y-6 pt-2">

      {/* TITLE */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          Crear cuenta
        </h2>
        <p className="text-sm text-white/50 mt-1">
          Empieza gratis en menos de 1 minuto
        </p>
      </div>

      {/* GOOGLE */}
      <GoogleButton />

      {/* DIVIDER */}
      <div className="flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" />
        o
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* FORM */}
      <form className="space-y-5">

        <input
          className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4"
          placeholder="Nombre"
        />

        <input
          className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4"
          placeholder="Email"
        />

        {/* PASSWORD */}
        <div className="space-y-2">

          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4 pr-12"
              placeholder="Contraseña"
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/60 hover:text-white transition"
            >
              {show ? "Ocultar" : "Ver"}
            </button>
          </div>

          <input
            type="password"
            className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4"
            placeholder="Confirmar contraseña"
          />

          {/* SECURITY */}
          <p
            className={`text-xs ${
              strong ? "text-emerald-400" : "text-white/40"
            }`}
          >
            {strong
              ? "Contraseña segura"
              : "Mín 8 caracteres · Mayúscula · Número · Símbolo"}
          </p>
        </div>

        {/* TERMS */}
        <label className="flex items-start gap-2 text-xs text-white/60">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 accent-purple-500"
          />
          Acepto los términos y condiciones
        </label>

        {/* SUBMIT */}
        <button
          disabled={!accepted}
          className="
            w-full h-11 rounded-full 
            bg-gradient-to-r from-purple-600 to-indigo-600 
            font-semibold 
            transition
            hover:scale-[1.02]
            disabled:opacity-40 
            disabled:hover:scale-100
          "
        >
          Crear cuenta gratis
        </button>

      </form>

      {/* SWITCH */}
      <p className="text-center text-sm text-white/60">
        ¿Ya tienes cuenta?{" "}
        <button
          onClick={onSwitch}
          className="text-purple-400 hover:underline"
        >
          Inicia sesión
        </button>
      </p>

    </div>
  )
}