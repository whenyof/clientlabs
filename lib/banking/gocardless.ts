/**
 * GoCardless Bank Account Data API (formerly Nordigen) — REST client
 * https://bankaccountdata.gocardless.com/api/v2/
 */

const BASE_URL = "https://bankaccountdata.gocardless.com/api/v2"

let cachedToken: string | null = null
let tokenExpiresAt: number | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken
  }

  const res = await fetch(`${BASE_URL}/token/new/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      secret_id: process.env.GOCARDLESS_SECRET_ID,
      secret_key: process.env.GOCARDLESS_SECRET_KEY,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GoCardless auth failed: ${err}`)
  }

  const data = await res.json()
  cachedToken = data.access as string
  tokenExpiresAt = Date.now() + (data.access_expires as number) * 1000
  return cachedToken
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const token = await getAccessToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GoCardless API error ${res.status}: ${err}`)
  }

  return res.json()
}

// ─── Institutions ──────────────────────────────────────────────────────────────

export type Institution = {
  id: string
  name: string
  bic: string
  transaction_total_days: string
  countries: string[]
  logo: string
}

export async function getInstitutions(country = "ES"): Promise<Institution[]> {
  const data = await apiFetch(`/institutions/?country=${country}`)
  return data as Institution[]
}

// ─── Agreements ───────────────────────────────────────────────────────────────

export type Agreement = {
  id: string
  created: string
  max_historical_days: number
  access_valid_for_days: number
  access_scope: string[]
  accepted: string | null
  institution_id: string
}

export async function createAgreement(institutionId: string): Promise<Agreement> {
  const data = await apiFetch("/agreements/enduser/", {
    method: "POST",
    body: JSON.stringify({
      institution_id: institutionId,
      max_historical_days: 730,
      access_valid_for_days: 90,
      access_scope: ["balances", "details", "transactions"],
    }),
  })
  return data as Agreement
}

// ─── Requisitions ─────────────────────────────────────────────────────────────

export type Requisition = {
  id: string
  created: string
  redirect: string
  status: string
  institution_id: string
  agreement: string
  reference: string
  accounts: string[]
  link: string
  ssn: string | null
  account_selection: boolean
  redirect_immediate: boolean
}

export async function createRequisition(params: {
  redirect: string
  institutionId: string
  agreementId: string
  reference: string
}): Promise<Requisition> {
  const data = await apiFetch("/requisitions/", {
    method: "POST",
    body: JSON.stringify({
      redirect: params.redirect,
      institution_id: params.institutionId,
      agreement: params.agreementId,
      user_language: "ES",
      reference: params.reference,
    }),
  })
  return data as Requisition
}

export async function getRequisition(id: string): Promise<Requisition> {
  const data = await apiFetch(`/requisitions/${id}/`)
  return data as Requisition
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export type Balance = {
  balanceAmount: { amount: string; currency: string }
  balanceType: string
  referenceDate?: string
}

export type AccountTransaction = {
  transactionId?: string
  bookingDate: string
  valueDate?: string
  transactionAmount: { amount: string; currency: string }
  creditorName?: string
  debtorName?: string
  remittanceInformationUnstructured?: string
}

export async function getBalances(accountId: string): Promise<{ balances: Balance[] }> {
  const data = await apiFetch(`/accounts/${accountId}/balances/`)
  return data as { balances: Balance[] }
}

export async function getTransactions(accountId: string): Promise<{
  transactions: { booked: AccountTransaction[]; pending: AccountTransaction[] }
}> {
  const data = await apiFetch(`/accounts/${accountId}/transactions/`)
  return data as {
    transactions: { booked: AccountTransaction[]; pending: AccountTransaction[] }
  }
}
