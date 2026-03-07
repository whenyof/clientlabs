/**
 * Shared scoring logic for Lead Intelligence (API and hot lead detector).
 * Input: events from Event table (type, data, url).
 */

const MAX_EVENTS = 100
const MAX_SCORE = 120

const PRICING_PATHS = [
  "pricing",
  "plans",
  "price",
  "tarifas",
  "plan",
  "subscription",
]

const HIGH_INTENT_CLICKS = [
  "signup",
  "sign up",
  "get started",
  "start",
  "buy",
  "purchase",
  "checkout",
]

export type EventForScoring = {
  type: string
  data: unknown
  url: string
}

export function computeVisitorScore(
  events: EventForScoring[]
): { score: number; signals: Set<string> } {
  let score = 0
  const signals = new Set<string>()

  const limited = events.slice(0, MAX_EVENTS)

  for (const event of limited) {
    const data =
      event.data && typeof event.data === "object" && event.data !== null
        ? (event.data as Record<string, unknown>)
        : {}
    const rawUrl = (data.url as string) ?? event.url ?? ""
    const url = rawUrl.toLowerCase()

    const visitedPricing =
      url &&
      PRICING_PATHS.some((p) => {
        const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        return new RegExp(`(?:${escaped})(?:/|$|\\?|#)`).test(url)
      })

    switch (event.type) {
      case "pageview":
        score += 1
        if (visitedPricing && !signals.has("visited_pricing")) {
          score += 10
          signals.add("visited_pricing")
        }
        break
      case "scroll_depth": {
        const percentage = typeof data.percentage === "number" ? data.percentage : 0
        if (percentage >= 75 && !signals.has("deep_scroll")) {
          score += 5
          signals.add("deep_scroll")
        } else if (percentage >= 50 && !signals.has("scroll_50")) {
          score += 3
          signals.add("scroll_50")
        }
        break
      }
      case "button_click": {
        const text = typeof data.text === "string" ? data.text : ""
        const isHighIntent =
          text &&
          HIGH_INTENT_CLICKS.some((k) => text.toLowerCase().includes(k)) &&
          !signals.has("signup_click")
        if (isHighIntent) {
          score += 15
          signals.add("signup_click")
        } else {
          score += 5
        }
        break
      }
      case "checkout_click":
        score += 15
        if (!signals.has("checkout_click")) signals.add("checkout_click")
        break
      case "email_detected":
        if (!signals.has("email_detected")) {
          score += 20
          signals.add("email_detected")
        }
        break
      case "form_submit":
        if (!signals.has("submitted_email")) {
          score += 30
          signals.add("submitted_email")
        }
        break
      case "lead_identified":
        if (!signals.has("identified_lead")) {
          score += 30
          signals.add("identified_lead")
        }
        break
      case "purchase_detected":
        if (!signals.has("purchase")) {
          score += 100
          signals.add("purchase")
        }
        break
      default:
        break
    }
  }

  score = Math.min(score, MAX_SCORE)
  return { score, signals }
}
