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
