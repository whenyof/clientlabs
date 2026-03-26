export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API error ${res.status}: ${text}`)
  }

  return res.json()
}

