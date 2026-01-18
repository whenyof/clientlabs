"use client"

import GoogleButton from "./GoogleButton"

type Props = {
  onSwitch: () => void
}

export default function Login({ onSwitch }: Props) {
  return (
    <div className="space-y-6 ">

      <h2 className="text-2xl font-bold text-center">
        Iniciar sesión
      </h2>

      <GoogleButton />

      <div className="flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" />
        o
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-4">
        <input
          className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4"
          placeholder="Email"
        />

        <input
          className="w-full h-11 rounded-lg bg-white/5 border border-white/10 px-4"
          placeholder="Contraseña"
          type="password"
        />

        <button className="w-full h-11 rounded-full bg-purple-600 font-semibold">
          Entrar
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