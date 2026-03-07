/**
 * SDK installation verification status.
 * Used by SdkInstallation model and status endpoint.
 */
export const SDK_INSTALLATION_STATUS = {
  NOT_INSTALLED: "NOT_INSTALLED",
  SCRIPT_DETECTED: "SCRIPT_DETECTED",
  SDK_ACTIVE: "SDK_ACTIVE",
  RECEIVING_EVENTS: "RECEIVING_EVENTS",
  DISCONNECTED: "DISCONNECTED",
} as const

export type SdkInstallationStatus = (typeof SDK_INSTALLATION_STATUS)[keyof typeof SDK_INSTALLATION_STATUS]

/** Event types that indicate script loaded (first detection). */
export const EVENT_TYPE_SDK_LOADED = "sdk_loaded"

/** Event types that indicate heartbeat (SDK active). */
export const EVENT_TYPE_SDK_HEARTBEAT = "sdk_heartbeat"

/** Event types that indicate real user interaction or conversion (set status to RECEIVING_EVENTS). */
export const RECEIVING_EVENT_TYPES = new Set([
  "pageview",
  "button_click",
  "form_submit",
  "checkout_click",
  "purchase_detected",
  "lead_identified",
])
