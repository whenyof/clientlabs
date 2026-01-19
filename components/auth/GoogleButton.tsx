"use client"

import Image from "next/image"
import { signIn } from "next-auth/react"

export default function GoogleButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="
        w-full h-12 flex items-center justify-center gap-3
        rounded-lg bg-white text-sm font-medium text-gray-800
        border border-gray-200 shadow-sm
        transition hover:shadow-md hover:scale-[1.01]
      "
    >
      <Image src="/google.png" alt="Google" width={20} height={20} />
      <span>Continuar con Google</span>
    </button>
  )
}