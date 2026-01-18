"use client"

import Image from "next/image"

export default function GoogleButton() {
  return (
    <button
      type="button"
      className="
        w-full h-12 
        flex items-center justify-center gap-3
        rounded-lg
        bg-white
        text-sm font-medium text-gray-800
        border border-gray-200
        shadow-sm
        transition
        hover:shadow-md
        hover:scale-[1.01]
        active:scale-[0.98]
      "
      onClick={() => {
        console.log("Login con Google")
        // aquí luego metes signIn("google")
      }}
    >
      {/* LOGO OFICIAL */}
      <Image
        src="/google.png"
        alt="Google"
        width={20}
        height={20}
        className="h-5 w-5"
      />

      <span>Continuar con Google</span>
    </button>
  )
}