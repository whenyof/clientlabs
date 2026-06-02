import { useState, useEffect } from "react"

export function useItemsPerPage(defaultValue = 25): number {
  const [items, setItems] = useState(defaultValue)

  useEffect(() => {
    const saved = localStorage.getItem("cl_items_per_page")
    if (saved) setItems(Number(saved))

    const handler = () => {
      const updated = localStorage.getItem("cl_items_per_page")
      if (updated) setItems(Number(updated))
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  return items
}
