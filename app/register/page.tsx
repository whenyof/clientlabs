"use client"

import { useState } from "react"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(e:any) {
    e.preventDefault()

    await fetch("/api/register", {
      method:"POST",
      body: JSON.stringify({ email, password })
    })

    window.location.href = "/login"
  }

  return (
    <form onSubmit={handleSubmit} className="h-screen flex flex-col justify-center items-center gap-4">
      <h1 className="text-3xl font-bold">Register</h1>

      <input
        placeholder="Email"
        className="border p-2"
        onChange={e=>setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        onChange={e=>setPassword(e.target.value)}
      />

      <button className="bg-black text-white px-6 py-2 rounded">
        Create account
      </button>
    </form>
  )
}