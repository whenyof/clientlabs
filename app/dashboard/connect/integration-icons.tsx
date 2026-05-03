"use client"

import React from "react"
import {
  SiWhatsapp, SiFacebook, SiMeta, SiTiktok,
  SiGmail, SiMailchimp,
  SiGooglecalendar, SiCalendly, SiCaldotcom,
  SiZapier, SiMake, SiN8n,
  SiStripe, SiPaypal,
  SiNotion, SiGoogledrive,
  SiGoogleads,
  SiWordpress, SiShopify, SiGoogletagmanager, SiWix, SiWebflow,
} from "@icons-pack/react-simple-icons"
import { Globe, Send, Mail } from "lucide-react"

// Inline SVGs for brands not in simple-icons
function LinkedInIcon({ size = 20, color = "#0A66C2" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function SlackIcon({ size = 20, color = "#4A154B" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  )
}

function OutlookIcon({ size = 20, color = "#0078D4" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M24 7.387v10.478c0 .23-.08.426-.24.583a.815.815 0 0 1-.59.236h-9.613V8.025l1.088.708 9.355-1.346zm-11.216.374L1.52 6.04A1.55 1.55 0 0 0 .43 6.45 1.46 1.46 0 0 0 0 7.5v9c0 .406.144.75.43 1.034.287.283.63.424 1.03.424h1.04v-8.04l9.284 1.327V7.76zm-1.27 8.84-9.014-1.29v3.202c0 .41.143.756.43 1.04.286.284.629.426 1.03.426h9.644a.819.819 0 0 0 .59-.235.794.794 0 0 0 .24-.583v-1.547l-2.92-.013zm2.92-6.424V8.025L3.5 9.37v7.757l9.934-1.53z" />
    </svg>
  )
}

// Map: integration id → { icon element, bg tailwind class }
export const ICON_CONFIG: Record<string, { el: (size?: number) => React.ReactNode; bg: string }> = {
  // Captación
  web:               { el: (s=20) => <Globe size={s} style={{ color: "#1FA97A" }} />,            bg: "bg-[#E8F5EF]" },
  whatsapp:          { el: (s=20) => <SiWhatsapp size={s} style={{ color: "#25D366" }} />,        bg: "bg-green-50" },
  facebook:          { el: (s=20) => <SiMeta size={s} style={{ color: "#0467DF" }} />,            bg: "bg-blue-50" },
  "google-ads":      { el: (s=20) => <SiGoogleads size={s} style={{ color: "#4285F4" }} />,       bg: "bg-red-50" },
  linkedin:          { el: (s=20) => <LinkedInIcon size={s} color="#0A66C2" />,                   bg: "bg-sky-50" },
  tiktok:            { el: (s=20) => <SiTiktok size={s} style={{ color: "#010101" }} />,          bg: "bg-zinc-100" },
  // Email
  gmail:             { el: (s=20) => <SiGmail size={s} style={{ color: "#EA4335" }} />,           bg: "bg-red-50" },
  outlook:           { el: (s=20) => <OutlookIcon size={s} color="#0078D4" />,                    bg: "bg-blue-50" },
  mailchimp:         { el: (s=20) => <SiMailchimp size={s} style={{ color: "#FFE01B" }} />,       bg: "bg-yellow-50" },
  sendgrid:          { el: (s=20) => <Send size={s} style={{ color: "#1A82E2" }} />,               bg: "bg-teal-50" },
  // Calendar
  "google-calendar": { el: (s=20) => <SiGooglecalendar size={s} style={{ color: "#4285F4" }} />, bg: "bg-red-50" },
  calendly:          { el: (s=20) => <SiCalendly size={s} style={{ color: "#006BFF" }} />,        bg: "bg-blue-50" },
  cal:               { el: (s=20) => <SiCaldotcom size={s} style={{ color: "#111827" }} />,       bg: "bg-gray-100" },
  // Automatización
  zapier:            { el: (s=20) => <SiZapier size={s} style={{ color: "#FF4F00" }} />,          bg: "bg-orange-50" },
  make:              { el: (s=20) => <SiMake size={s} style={{ color: "#6D00CC" }} />,            bg: "bg-purple-50" },
  n8n:               { el: (s=20) => <SiN8n size={s} style={{ color: "#EA4B71" }} />,             bg: "bg-rose-50" },
  // Pagos
  stripe:            { el: (s=20) => <SiStripe size={s} style={{ color: "#635BFF" }} />,          bg: "bg-indigo-50" },
  paypal:            { el: (s=20) => <SiPaypal size={s} style={{ color: "#002991" }} />,          bg: "bg-blue-50" },
  // Productividad
  slack:             { el: (s=20) => <SlackIcon size={s} color="#4A154B" />,                      bg: "bg-purple-50" },
  notion:            { el: (s=20) => <SiNotion size={s} style={{ color: "#000000" }} />,          bg: "bg-gray-100" },
  "google-drive":    { el: (s=20) => <SiGoogledrive size={s} style={{ color: "#4285F4" }} />,     bg: "bg-green-50" },
  // Web providers (used in ConnectView)
  web_sdk:           { el: (s=20) => <Globe size={s} style={{ color: "#1FA97A" }} />,             bg: "bg-[#E8F5EF]" },
  wordpress:         { el: (s=20) => <SiWordpress size={s} style={{ color: "#21759B" }} />,       bg: "bg-sky-50" },
  shopify:           { el: (s=20) => <SiShopify size={s} style={{ color: "#7AB55C" }} />,         bg: "bg-lime-50" },
  gtm:               { el: (s=20) => <SiGoogletagmanager size={s} style={{ color: "#246FDB" }} />, bg: "bg-orange-50" },
  wix:               { el: (s=20) => <SiWix size={s} style={{ color: "#0C6EFC" }} />,             bg: "bg-violet-50" },
  webflow:           { el: (s=20) => <SiWebflow size={s} style={{ color: "#146EF5" }} />,         bg: "bg-indigo-50" },
}

export function IntegrationIcon({ id, size = 20 }: { id: string; size?: number }) {
  return <>{ICON_CONFIG[id]?.el(size) ?? null}</>
}

export function getIconBg(id: string): string {
  return ICON_CONFIG[id]?.bg ?? "bg-slate-100"
}
