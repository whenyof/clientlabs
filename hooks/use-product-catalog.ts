"use client"

import { useState, useEffect, useCallback } from "react"

/** Producto del catálogo tal como lo devuelve GET /api/products */
export type CatalogProduct = {
  id: string
  name: string
  description: string | null
  price: number
  taxRate: number
  unit: string
  category: string | null
  isService: boolean
}

/** Datos mínimos para crear un producto desde una línea de documento */
export type ProductDraft = {
  name: string
  price: number
  taxRate: number
  unit: string
}

export type UseProductCatalog = {
  products: CatalogProduct[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createProduct: (draft: ProductDraft) => Promise<CatalogProduct>
}

/**
 * Carga el catálogo de productos UNA sola vez (no por fila).
 * `createProduct` hace POST /api/products y añade el resultado a la lista en memoria.
 */
export function useProductCatalog(): UseProductCatalog {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/products", { credentials: "include" })
      if (!res.ok) throw new Error("No se pudo cargar el catálogo")
      const data = await res.json()
      setProducts(Array.isArray(data.products) ? data.products : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el catálogo")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createProduct = useCallback(async (draft: ProductDraft): Promise<CatalogProduct> => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: draft.name,
        price: draft.price,
        taxRate: draft.taxRate,
        unit: draft.unit || "ud",
        isService: false,
        category: null,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.product) {
      throw new Error(data?.error ?? "No se pudo crear el producto")
    }
    const created = data.product as CatalogProduct
    setProducts((prev) => [created, ...prev])
    return created
  }, [])

  return { products, loading, error, refetch: load, createProduct }
}
