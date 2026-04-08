"use client"

import { createContext, useContext, useState } from "react"

interface LeadsSearchCtx {
  searchTerm: string
  setSearchTerm: (v: string) => void
  sortBy: string
  setSortBy: (v: string) => void
  sortOrder: "asc" | "desc"
  setSortOrder: (v: "asc" | "desc") => void
  filterStatus: string
  setFilterStatus: (v: string) => void
  filterSource: string
  setFilterSource: (v: string) => void
  filterTemperature: string
  setFilterTemperature: (v: string) => void
}

const LeadsSearchContext = createContext<LeadsSearchCtx>({
  searchTerm: "",
  setSearchTerm: () => {},
  sortBy: "createdAt",
  setSortBy: () => {},
  sortOrder: "desc",
  setSortOrder: () => {},
  filterStatus: "all",
  setFilterStatus: () => {},
  filterSource: "all",
  setFilterSource: () => {},
  filterTemperature: "all",
  setFilterTemperature: () => {},
})

export function useLeadsSearch() {
  return useContext(LeadsSearchContext)
}

export function LeadsSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSource, setFilterSource] = useState("all")
  const [filterTemperature, setFilterTemperature] = useState("all")

  return (
    <LeadsSearchContext.Provider value={{
      searchTerm, setSearchTerm,
      sortBy, setSortBy,
      sortOrder, setSortOrder,
      filterStatus, setFilterStatus,
      filterSource, setFilterSource,
      filterTemperature, setFilterTemperature,
    }}>
      {children}
    </LeadsSearchContext.Provider>
  )
}
