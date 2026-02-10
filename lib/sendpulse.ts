/**
 * SendPulse transactional email client.
 * Server-only. Use from API routes, Server Actions, or server components.
 *
 * Requires: SENDPULSE_CLIENT_ID, SENDPULSE_CLIENT_SECRET
 */

if (typeof window !== "undefined") {
  throw new Error("[sendpulse] This module is server-only. Do not import in client components.")
}

const OAUTH_URL = "https://api.sendpulse.com/oauth/access_token"
const SMTP_URL = "https://api.sendpulse.com/smtp/emails"

const DEFAULT_FROM = {
  name: "ClientLabs",
  email: "noreply@clientlabs.io",
} as const

/** Refresh token 60s before expiry */
const EXPIRY_BUFFER_MS = 60_000

let token: string | null = null
let tokenExpiresAt: number = 0

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SendEmailOptions = {
  to: string
  subject: string
  html: string
  fromName?: string
  fromEmail?: string
}

export type SendTemplateEmailOptions = {
  to: string
  templateId: number
  variables: Record<string, string>
  fromName?: string
  fromEmail?: string
  subject?: string
}

type OAuthResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

type SmtpSuccessResponse = {
  result: true
  id: string
}

type SmtpErrorResponse = {
  result?: false
  error?: string
  message?: string
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value?.trim()) {
    throw new SendPulseError(`Missing environment variable: ${name}`)
  }
  return value.trim()
}

async function fetchToken(): Promise<string> {
  const clientId = getEnv("SENDPULSE_CLIENT_ID")
  const clientSecret = getEnv("SENDPULSE_CLIENT_SECRET")

  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new SendPulseError(
      `SendPulse OAuth failed (${res.status}): ${text || res.statusText}`
    )
  }

  const data = (await res.json()) as OAuthResponse
  if (!data.access_token) {
    throw new SendPulseError("SendPulse OAuth response missing access_token")
  }

  const expiresInMs = (data.expires_in ?? 3600) * 1000
  tokenExpiresAt = Date.now() + expiresInMs - EXPIRY_BUFFER_MS
  token = data.access_token
  return data.access_token
}

/**
 * Returns a valid Bearer token, refreshing from cache or OAuth when needed.
 */
export async function getSendpulseToken(): Promise<string> {
  if (token && Date.now() < tokenExpiresAt) {
    return token
  }
  token = null
  tokenExpiresAt = 0
  return fetchToken()
}

/**
 * Clears the in-memory token (e.g. after 401 to force refresh).
 */
export function clearSendpulseToken(): void {
  token = null
  tokenExpiresAt = 0
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class SendPulseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SendPulseError"
    Object.setPrototypeOf(this, SendPulseError.prototype)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function base64Encode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8").toString("base64")
  }
  return btoa(unescape(encodeURIComponent(str)))
}

function buildFrom(options: SendEmailOptions | SendTemplateEmailOptions): { name: string; email: string } {
  return {
    name: options.fromName ?? DEFAULT_FROM.name,
    email: options.fromEmail ?? DEFAULT_FROM.email,
  }
}

// ---------------------------------------------------------------------------
// sendEmail
// ---------------------------------------------------------------------------

/**
 * Sends a single transactional email via SendPulse SMTP.
 * HTML is sent Base64-encoded; a plain-text fallback is generated.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ id: string }> {
  const { to, subject, html, fromName, fromEmail } = options
  const from = buildFrom(options)

  const payload = {
    email: {
      html: base64Encode(html),
      text: html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "No plain text content.",
      subject,
      from: { name: from.name, email: from.email },
      to: [{ email: to }],
      auto_plain_text: false,
    },
  }

  const run = async (accessToken: string): Promise<SmtpSuccessResponse> => {
    const res = await fetch(SMTP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    const data = (await res.json()) as SmtpSuccessResponse | SmtpErrorResponse

    if (!res.ok) {
      if (res.status === 401) {
        clearSendpulseToken()
        throw new SendPulseError("SendPulse token expired")
      }
      const msg =
        (data && typeof (data as SmtpErrorResponse).error === "string"
          ? (data as SmtpErrorResponse).error
          : (data as SmtpErrorResponse).message) || res.statusText
      throw new SendPulseError(`SendPulse SMTP failed (${res.status}): ${msg}`)
    }

    if (!data || (data as SmtpSuccessResponse).result !== true) {
      throw new SendPulseError("SendPulse SMTP returned invalid response")
    }

    return data as SmtpSuccessResponse
  }

  try {
    const accessToken = await getSendpulseToken()
    const result = await run(accessToken)
    return { id: result.id }
  } catch (err) {
    if (err instanceof SendPulseError && err.message === "SendPulse token expired") {
      const accessToken = await getSendpulseToken()
      return run(accessToken).then((r) => ({ id: r.id }))
    }
    throw err
  }
}

// ---------------------------------------------------------------------------
// sendTemplateEmail (stub / ready for template API)
// ---------------------------------------------------------------------------

/**
 * Sends an email using a SendPulse template and variables.
 * Uses the template endpoint (id + variables).
 */
export async function sendTemplateEmail(options: SendTemplateEmailOptions): Promise<{ id: string }> {
  const { to, templateId, variables, fromName, fromEmail, subject } = options
  const from = buildFrom(options)

  const payload = {
    email: {
      subject: subject ?? "",
      template: {
        id: templateId,
        variables,
      },
      from: { name: from.name, email: from.email },
      to: [{ email: to }],
    },
  }

  const run = async (accessToken: string): Promise<SmtpSuccessResponse> => {
    const res = await fetch(SMTP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    const data = (await res.json()) as SmtpSuccessResponse | SmtpErrorResponse

    if (!res.ok) {
      if (res.status === 401) {
        clearSendpulseToken()
        throw new SendPulseError("SendPulse token expired")
      }
      const msg =
        (data && typeof (data as SmtpErrorResponse).error === "string"
          ? (data as SmtpErrorResponse).error
          : (data as SmtpErrorResponse).message) || res.statusText
      throw new SendPulseError(`SendPulse SMTP template failed (${res.status}): ${msg}`)
    }

    if (!data || (data as SmtpSuccessResponse).result !== true) {
      throw new SendPulseError("SendPulse SMTP template returned invalid response")
    }

    return data as SmtpSuccessResponse
  }

  try {
    const accessToken = await getSendpulseToken()
    const result = await run(accessToken)
    return { id: result.id }
  } catch (err) {
    if (err instanceof SendPulseError && err.message === "SendPulse token expired") {
      const accessToken = await getSendpulseToken()
      return run(accessToken).then((r) => ({ id: r.id }))
    }
    throw err
  }
}
