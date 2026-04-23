// Brand SVG icons for tool chips (hero visual + problem tangle)
// Every SVG has explicit width/height so it renders at the right size
// without relying on [&_svg] Tailwind selectors.

interface BrandIcon {
  color: string  // kept for fallback letter chips
  svg: string
}

export const BrandIcons: Record<string, BrandIcon> = {

  Excel: {
    color: "#1f7145",
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#1D6F42"/>
      <path d="M7 8l3 4-3 4h2.5L11 13.5 12.5 16H15l-3-4 3-4h-2.5L11 10.5 9.5 8H7z" fill="#fff"/>
    </svg>`,
  },

  WhatsApp: {
    color: "#25d366",
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#25d366"/>
      <path d="M17.5 14.5c-.3.8-1.5 1.5-2.4 1.7-.6.1-1.5.2-4.3-1.8-2.3-1.7-3.8-4-4-4.4-.1-.4-.1-1.7.7-2.8.3-.4.8-.6 1.2-.6h.4c.3 0 .7.1.9.7l.7 1.8c.1.3 0 .6-.2.8l-.4.5c-.1.2-.1.4 0 .6.4.8 1 1.5 1.8 2 .7.5 1.5.8 2.1.9.2 0 .4-.1.5-.3l.4-.5c.2-.3.5-.4.8-.2l1.8.8c.6.3.8.7.7 1.1z" fill="#fff"/>
    </svg>`,
  },

  // Gmail — red envelope
  Gmail: {
    color: "#EA4335",
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#fff"/>
      <path d="M2 6.5L12 13.5L22 6.5" stroke="#EA4335" stroke-width="1.5" fill="none"/>
      <rect x="2" y="6" width="20" height="13" rx="1" fill="none" stroke="#EA4335" stroke-width="1.5"/>
    </svg>`,
  },

  // Drive — clean 3-colour triangle
  Drive: {
    color: "#4285F4",
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,3 22,19 2,19" fill="none"/>
      <polygon points="8,3 20,3 14,13" fill="#4285F4"/>
      <polygon points="2,19 10,5 16,15" fill="#34A853"/>
      <polygon points="8,13 22,13 16,22 2,22" fill="#FBBC04"/>
    </svg>`,
  },

  "Post-its": {
    color: "#e0a800",
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#FCD34D"/>
      <path d="M7 8h10M7 12h7M7 16h5" stroke="#92400E" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
  },

  Facturas: {
    color: "#6b4ce0",
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="3" fill="#6b4ce0"/>
      <path d="M7 6h6l3 3v9H7V6z" fill="none" stroke="#fff" stroke-width="1.4"/>
      <path d="M13 6v3h3M9 13h6M9 16h4" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`,
  },

  Notion: {
    color: "#1a1a1a",
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#fff" stroke="#e2e8f0"/>
      <text x="12" y="17" text-anchor="middle" font-family="Georgia,serif" font-size="14" font-weight="900" fill="#1a1a1a">N</text>
    </svg>`,
  },

  Calendario: {
    color: "#ea4335",
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="18" rx="2" fill="#fff" stroke="#e2e8f0"/>
      <rect x="2" y="4" width="20" height="6" rx="2" fill="#EA4335"/>
      <path d="M8 2v4M16 2v4" stroke="#EA4335" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="6" y="14" width="3" height="3" rx=".5" fill="#4285F4"/>
      <rect x="10.5" y="14" width="3" height="3" rx=".5" fill="#FBBC05"/>
      <rect x="15" y="14" width="3" height="3" rx=".5" fill="#34A853"/>
    </svg>`,
  },

  // Alias used in tangle-visual (content.ts uses "Calendar" not "Calendario")
  Calendar: {
    color: "#ea4335",
    svg: `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="18" rx="2" fill="#fff" stroke="#e2e8f0"/>
      <rect x="2" y="4" width="20" height="6" rx="2" fill="#EA4335"/>
      <path d="M8 2v4M16 2v4" stroke="#EA4335" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="6" y="14" width="3" height="3" rx=".5" fill="#4285F4"/>
      <rect x="10.5" y="14" width="3" height="3" rx=".5" fill="#FBBC05"/>
      <rect x="15" y="14" width="3" height="3" rx=".5" fill="#34A853"/>
    </svg>`,
  },

}
