"use client"

import { createContext, useContext, useState } from "react"

interface LeadsSearchCtx {
  searchTerm: string
  setSearchTerm: (v: string) => void
}

const LeadsSearchContext = createContext<LeadsSearchCtx>({
  searchTerm: "",
  setSearchTerm: () => {},
})

export function useLeadsSearch() {
  return useContext(LeadsSearchContext)
}

export function LeadsSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("")
  return (
    <LeadsSearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </LeadsSearchContext.Provider>
  )
}
