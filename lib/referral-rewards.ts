export type RewardType = "discount" | "free_month" | "free_months" | "free_year" | "template_pack" | "consulting" | "lifetime" | "cash"

export type ReferralReward = {
  type: RewardType
  value: number
  description: string
}

export type ReferralLevel = {
  level: number
  name: string
  minReferrals: number
  color: string
  rewards: ReferralReward[]
}

export const REFERRAL_LEVELS: ReferralLevel[] = [
  {
    level: 0,
    name: "Novato",
    minReferrals: 0,
    color: "#94A3B8",
    rewards: [],
  },
  {
    level: 1,
    name: "Embajador",
    minReferrals: 1,
    color: "#F59E0B",
    rewards: [
      { type: "discount", value: 10, description: "10% de descuento en tu próximo mes" },
    ],
  },
  {
    level: 2,
    name: "Embajador Pro",
    minReferrals: 3,
    color: "#EF6C00",
    rewards: [
      { type: "discount", value: 20, description: "20% de descuento durante 3 meses" },
    ],
  },
  {
    level: 3,
    name: "Embajador Elite",
    minReferrals: 5,
    color: "#7C3AED",
    rewards: [
      { type: "free_month", value: 1, description: "1 mes gratis de tu plan actual" },
      { type: "template_pack", value: 1, description: "Pack completo de plantillas premium gratis" },
    ],
  },
  {
    level: 4,
    name: "Embajador Gold",
    minReferrals: 10,
    color: "#D4AF37",
    rewards: [
      { type: "free_months", value: 3, description: "3 meses gratis del plan Business" },
    ],
  },
  {
    level: 5,
    name: "Embajador Platinum",
    minReferrals: 25,
    color: "#1FA97A",
    rewards: [
      { type: "free_year", value: 1, description: "1 año gratis de ClientLabs Business" },
      { type: "consulting", value: 1, description: "Sesión de consultoría personalizada 1:1 con el equipo de ClientLabs" },
    ],
  },
  {
    level: 6,
    name: "Leyenda",
    minReferrals: 50,
    color: "#DC2626",
    rewards: [
      { type: "lifetime", value: 1, description: "ClientLabs Business gratis de por vida" },
      { type: "cash", value: 500, description: "500€ en metálico" },
    ],
  },
]

export const REFERRAL_RAFFLE = {
  active: true,
  prize: "2.500€ en metálico",
  description: "Todos los Embajadores Pro o superior entran en el sorteo trimestral de 2.500€",
  drawDate: "Septiembre 2026",
  minReferrals: 3,
}

export function getLevelForReferrals(count: number): ReferralLevel {
  return (
    [...REFERRAL_LEVELS].reverse().find(l => count >= l.minReferrals) ?? REFERRAL_LEVELS[0]
  )
}

export function getNextLevel(current: ReferralLevel): ReferralLevel | null {
  const idx = REFERRAL_LEVELS.findIndex(l => l.level === current.level)
  return REFERRAL_LEVELS[idx + 1] ?? null
}

export function getProgressPercent(count: number, current: ReferralLevel, next: ReferralLevel | null): number {
  if (!next) return 100
  const range = next.minReferrals - current.minReferrals
  const progress = count - current.minReferrals
  return Math.min(100, Math.round((progress / range) * 100))
}
