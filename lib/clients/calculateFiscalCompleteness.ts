export function calculateFiscalCompleteness(client: any) {
 if (!client) return false

 return Boolean(
 client.legalName &&
 client.taxId &&
 client.address &&
 client.postalCode &&
 client.city &&
 client.country
 )
}

/** Required fiscal fields for a complete (F1) invoice, with human labels. */
const F1_REQUIRED_FIELDS: { key: string; label: string }[] = [
 { key: "legalName", label: "nombre/razón social fiscal" },
 { key: "taxId", label: "NIF/CIF" },
 { key: "address", label: "dirección" },
 { key: "postalCode", label: "código postal" },
 { key: "city", label: "ciudad" },
 { key: "country", label: "país" },
]

/** Human labels of the fiscal fields the client is missing (empty if complete). */
export function getMissingFiscalFields(client: any): string[] {
 if (!client) return F1_REQUIRED_FIELDS.map((f) => f.label)
 return F1_REQUIRED_FIELDS.filter((f) => !client[f.key]).map((f) => f.label)
}

/**
 * Returns a user-facing error message when a COMPLETE (F1) invoice cannot be
 * generated because the client lacks required fiscal data, or null if it can.
 * F2 (simplificada) does not require client NIF, so callers should skip this for F2.
 */
export function getF1ClientFiscalBlock(client: any): string | null {
 const missing = getMissingFiscalFields(client)
 if (missing.length === 0) return null
 return `No se puede generar una factura completa (F1): faltan datos fiscales del cliente (${missing.join(", ")}). Complétalos en la ficha del cliente o genera una factura simplificada (F2).`
}
