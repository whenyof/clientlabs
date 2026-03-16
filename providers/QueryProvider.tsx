"use client"

import React from "react"
import QueryProviderImpl from "../src/providers/QueryProvider"

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <QueryProviderImpl>{children}</QueryProviderImpl>
}

