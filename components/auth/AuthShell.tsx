"use client"

import AuthFlip from "./AuthFlip"

export default function AuthShell() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

        {/* IZQUIERDA - BRAND */}
        <div className="space-y-6">

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Los negocios <span className="text-purple-400"> grandes </span> <br />
            no crecen por  
            <span className="text-purple-400"> suerte.</span>
          </h1>

          <p className="text-white/70 text-lg max-w-md">
            ClientLabs te da control real sobre tus leads, métricas y operaciones.
            Donde el crecimiento deja de ser un problema.
          </p>

          <ul className="space-y-3 text-white/80">
            <li>✔ Paneles accionables</li>
            <li>✔ IA para convertir más</li>
            <li>✔ Datos centralizados</li>
            <li>✔ Sin código</li>
            <li>✔ Escala sin romper nada</li>
          </ul>

        </div>

       {/* DERECHA - AUTH */}
<div className="relative flex justify-center items-center">

{/* Glow */}
<div className="absolute -inset-8 bg-purple-600/20 blur-3xl rounded-full" />

{/* SOLO EL FLIP */}
<AuthFlip />



          
          

        </div>

      </div>
    </main>
  )
}