/**
 * ClientLabs Plugin — Auto Ingest (behavioural events to /api/v1/ingest)
 *
 * This plugin does NOT affect existing scoring events (/api/track).
 * It sends lightweight JSON events to /api/v1/ingest with:
 *   - type
 *   - api_key
 *   - domain
 *   - timestamp
 *   - additional payload (url, text, etc.)
 */

import type { ClientLabsPlugin, PluginContext } from "../types"
import { sendIngestEvent } from "../ingestTransport"

function createAutoIngestPlugin(): ClientLabsPlugin {
  let clickHandler: ((e: MouseEvent) => void) | null = null
  let submitHandler: ((e: SubmitEvent) => void) | null = null
  let blurHandler: ((e: FocusEvent) => void) | null = null
  let heartbeatId: ReturnType<typeof setInterval> | null = null
  let purchaseObserver: MutationObserver | null = null
  let purchaseDetected = false
  let spaCleanup: (() => void) | null = null

  const WHATSAPP_PATTERNS = ["wa.me", "api.whatsapp.com"]
  const CHECKOUT_KEYWORDS = [
    "checkout",
    "buy",
    "pay",
    "pagar",
    "comprar",
    "add to cart",
    "add-to-cart",
    "complete order",
    "place order",
    "proceed to payment",
  ]

  const hasWhatsApp = (href: string): boolean => {
    const lower = href.toLowerCase()
    return WHATSAPP_PATTERNS.some((p) => lower.includes(p))
  }

  const hasCheckoutIntent = (textOrHref: string): boolean => {
    const lower = textOrHref.toLowerCase()
    return CHECKOUT_KEYWORDS.some((kw) => lower.includes(kw))
  }

  const getButtonLikeTarget = (target: EventTarget | null): HTMLElement | null => {
    if (!target || !(target instanceof Element)) return null
    return target.closest(
      "button, a, [role='button'], [data-track], [data-clientlabs]"
    ) as HTMLElement | null
  }

  const EMAIL_DETECTED_KEY = "clientlabs_email_detected"

  function hasSessionFlag(key: string): boolean {
    try {
      return typeof sessionStorage !== "undefined" && sessionStorage.getItem(key) === "1"
    } catch {
      return false
    }
  }

  function setSessionFlag(key: string): void {
    try {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(key, "1")
      }
    } catch {
      // ignore
    }
  }

  function hashEmail(email: string): string {
    let hash = 0
    for (let i = 0; i < email.length; i++) {
      hash = (hash * 31 + email.charCodeAt(i)) | 0
    }
    return Math.abs(hash).toString(16)
  }

  const MAX_RAGE_RADIUS = 40

  return {
    name: "autoIngest",

    init(_ctx: PluginContext): void {
      if (typeof window === "undefined" || typeof document === "undefined") return

      let lastUrl = window.location.href
      let lastPageviewAt = 0
      const PAGEVIEW_DEDUPE_MS = 500

      const emitPageview = (referrer: string | null) => {
        const now = Date.now()
        if (now - lastPageviewAt < PAGEVIEW_DEDUPE_MS) return
        lastPageviewAt = now
        try {
          sendIngestEvent("pageview", {
            url: window.location.href,
            path: window.location.pathname,
            referrer,
          })
        } catch {
          // ignore
        }
        lastUrl = window.location.href
      }

      // 1) Pageview on load
      try {
        sendIngestEvent("pageview", {
          url: window.location.href,
          path: window.location.pathname,
          referrer: document.referrer || null,
        })
        lastPageviewAt = Date.now()
        lastUrl = window.location.href
      } catch {
        // ignore
      }

      // SPA navigation: correct referrer (document.referrer not updated in SPA)
      if (typeof history !== "undefined") {
        const originalPush = history.pushState
        const originalReplace = history.replaceState
        history.pushState = function (...args: unknown[]) {
          const result = originalPush.apply(this, args as any)
          emitPageview(lastUrl)
          return result
        }
        history.replaceState = function (...args: unknown[]) {
          const result = originalReplace.apply(this, args as any)
          emitPageview(lastUrl)
          return result
        }
        const onPopState = () => emitPageview(lastUrl)
        window.addEventListener("popstate", onPopState)
        spaCleanup = () => {
          history.pushState = originalPush
          history.replaceState = originalReplace
          window.removeEventListener("popstate", onPopState)
        }
      }

      // Session duration: emit session_end on hidden / beforeunload / pagehide (Safari fallback)
      const sessionStart = Date.now()
      let sessionEnded = false
      const sendSessionEnd = () => {
        if (sessionEnded) return
        sessionEnded = true
        try {
          const duration_seconds = Math.round((Date.now() - sessionStart) / 1000)
          sendIngestEvent("session_end", { duration_seconds })
        } catch {
          // ignore
        }
      }
      document.addEventListener("visibilitychange", () => {
        try {
          if (document.visibilityState === "hidden") {
            sendIngestEvent("page_hidden", {})
            sendSessionEnd()
          } else if (document.visibilityState === "visible") {
            sendIngestEvent("page_visible", {})
          }
        } catch {
          // ignore
        }
      })
      window.addEventListener("beforeunload", sendSessionEnd)
      window.addEventListener("pagehide", sendSessionEnd)

      // 2) Button / link clicks, WhatsApp, checkout intent, rage click
      const rageClicks: Array<{ t: number; x: number; y: number }> = []
      let lastCheckoutAt = 0
      clickHandler = (e: MouseEvent): void => {
        const now = Date.now()
        // Rage click: 5 clicks within 1s and within MAX_RAGE_RADIUS (avoid false positives)
        rageClicks.push({ t: now, x: e.clientX, y: e.clientY })
        while (rageClicks.length && now - rageClicks[0].t > 1000) {
          rageClicks.shift()
        }
        if (rageClicks.length >= 5) {
          const first = rageClicks[0]
          const last = rageClicks[rageClicks.length - 1]
          const dx = last.x - first.x
          const dy = last.y - first.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < MAX_RAGE_RADIUS) {
            try {
              sendIngestEvent("rage_click", { x: last.x, y: last.y })
            } catch {
              // ignore
            }
          }
          rageClicks.length = 0
        }

        const el = getButtonLikeTarget(e.target)
        if (!el) return

        const tag = el.tagName.toLowerCase()
        const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 150)
        const href =
          (el instanceof HTMLAnchorElement && el.href) ||
          (el.getAttribute && el.getAttribute("href")) ||
          null
        const dataAttrs = [
          el.getAttribute("data-track") || "",
          el.getAttribute("data-clientlabs") || "",
        ]
          .join(" ")
          .toLowerCase()

        // Generic button_click
        try {
          sendIngestEvent("button_click", {
            text: text || null,
            href,
            tag,
          })
        } catch {
          // ignore
        }

        // WhatsApp click
        if (href && hasWhatsApp(href)) {
          try {
            sendIngestEvent("whatsapp_click", {
              href,
            })
          } catch {
            // ignore
          }
        }

        // Checkout intent (text, href or data attributes)
        const sources = [text.toLowerCase(), (href || "").toLowerCase(), dataAttrs]
        const hasIntent = sources.some((s) => s && hasCheckoutIntent(s))
        // Cooldown to avoid multiple checkout_click in rapid succession
        if (hasIntent && now - lastCheckoutAt > 2000) {
          lastCheckoutAt = now
          try {
            sendIngestEvent("checkout_click", {
              text: text || null,
              href,
            })
          } catch {
            // ignore
          }
        }
      }

      document.addEventListener("click", clickHandler, {
        passive: true,
        capture: true,
      })

      // 3) Form submissions + email/lead detection
      submitHandler = (e: SubmitEvent): void => {
        const form = e.target as HTMLFormElement | null
        if (!form || form.tagName !== "FORM") return

        const formId = form.id || null
        const action = form.getAttribute("action") || window.location.href
        const method = (form.getAttribute("method") || "GET").toUpperCase()

        try {
          sendIngestEvent("form_submit", {
            form_id: formId,
            action,
            method,
          })
        } catch {
          // ignore
        }

        // Form lead detection: capture email + domain when present (dedup per session/email)
        const emailInput = form.querySelector("input[type='email']") as HTMLInputElement | null
        const emailValue = emailInput?.value?.trim()
        if (emailValue && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          const hash = hashEmail(emailValue.toLowerCase())
          const key = `clientlabs_lead_email_${hash}`
          if (!hasSessionFlag(key)) {
            try {
              sendIngestEvent("lead_identified", {
                email: emailValue,
              })
              setSessionFlag(key)
            } catch {
              // ignore
            }
          }
        }
      }

      document.addEventListener("submit", submitHandler, {
        passive: true,
        capture: true,
      })

      // 4) Email detection on blur/focusout (session-level dedupe)
      blurHandler = (e: FocusEvent): void => {
        const target = e.target as HTMLElement | null
        if (!target || !(target instanceof HTMLInputElement)) return
        if (target.type !== "email") return
        const value = target.value?.trim()
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return
        if (hasSessionFlag(EMAIL_DETECTED_KEY)) return
        try {
          sendIngestEvent("email_detected", {})
          setSessionFlag(EMAIL_DETECTED_KEY)
        } catch {
          // ignore
        }
      }

      document.addEventListener("focusout", blurHandler, {
        passive: true,
        capture: true,
      })

      // 5) Heartbeat every 60 seconds
      heartbeatId = setInterval(() => {
        if (typeof document !== "undefined" && document.visibilityState === "hidden") return
        try {
          sendIngestEvent("sdk_heartbeat", {})
        } catch {
          // ignore
        }
      }, 60 * 1000)

      // 7) Scroll depth tracking (25, 50, 75, 100)
      const milestones = [25, 50, 75, 100]
      const reached = new Set<number>()
      const onScroll = () => {
        if (typeof document === "undefined") return
        const doc = document.documentElement
        const body = document.body
        const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0
        const viewport = window.innerHeight || doc.clientHeight
        const height = Math.max(
          body.scrollHeight,
          doc.scrollHeight,
          body.offsetHeight,
          doc.offsetHeight,
          body.clientHeight,
          doc.clientHeight
        )
        const maxScroll = Math.max(height - viewport, 1)
        const percentage = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100))
        for (const m of milestones) {
          if (!reached.has(m) && percentage >= m) {
            reached.add(m)
            try {
              sendIngestEvent("scroll_depth", { percentage: m })
            } catch {
              // ignore
            }
          }
        }
        if (reached.size === milestones.length) {
          window.removeEventListener("scroll", onScroll)
        }
      }
      window.addEventListener("scroll", onScroll, { passive: true })

      // 6) Purchase detection with MutationObserver (once per page load, in-memory flag)
      const checkPurchase = (): boolean => {
        if (purchaseDetected) return true
        try {
          const bodyText = document.body?.innerText?.toLowerCase() || ""
          if (
            bodyText.includes("thank you for your purchase") ||
            bodyText.includes("order confirmed") ||
            bodyText.includes("pedido confirmado")
          ) {
            sendIngestEvent("purchase_detected", {})
            purchaseDetected = true
            return true
          }
        } catch {
          // ignore
        }
        return false
      }

      // Initial check + throttled observer
      let lastPurchaseCheck = 0
      if (!checkPurchase() && typeof MutationObserver !== "undefined") {
        purchaseObserver = new MutationObserver(() => {
          const now = Date.now()
          if (now - lastPurchaseCheck < 500) return
          lastPurchaseCheck = now
          if (checkPurchase() && purchaseObserver) {
            purchaseObserver.disconnect()
            purchaseObserver = null
          }
        })
        try {
          purchaseObserver.observe(document.body, {
            childList: true,
            subtree: true,
          })
        } catch {
          if (purchaseObserver) {
            purchaseObserver.disconnect()
            purchaseObserver = null
          }
        }
      }
    },

    destroy(): void {
      spaCleanup?.()
      spaCleanup = null
      if (typeof document !== "undefined") {
        if (clickHandler) {
          document.removeEventListener("click", clickHandler, { capture: true } as any)
          clickHandler = null
        }
        if (submitHandler) {
          document.removeEventListener("submit", submitHandler, { capture: true } as any)
          submitHandler = null
        }
        if (blurHandler) {
          document.removeEventListener("focusout", blurHandler, { capture: true } as any)
          blurHandler = null
        }
      }
      if (heartbeatId) {
        clearInterval(heartbeatId)
        heartbeatId = null
      }
      if (purchaseObserver) {
        purchaseObserver.disconnect()
        purchaseObserver = null
      }
    },
  }
}

export default createAutoIngestPlugin

