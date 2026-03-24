/**
 * Base URL Utility — centralized resolution for API calls
 */

export function getBaseUrl(): string {
  // 1. Browser context
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  
  // 2. Explicit Environment Variable (Preferred for Server/Workers)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  // 3. Fallbacks for Next.js Server contexts
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  
  return "http://localhost:3000"
}
