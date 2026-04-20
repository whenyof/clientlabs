/**
 * Mapping of semantic icon names → lucide-react components.
 * Use these instead of importing lucide icons directly in landing components,
 * so icon changes only need updating here.
 */

import {
  ArrowRight,
  Check,
  Plus,
  Calendar,
  Link2,
  Zap,
  Bot,
  Target,
  Users,
  FileText,
  FileSpreadsheet,
  Calculator,
  CheckSquare,
  Receipt,
  Puzzle,
  Play,
  ChevronDown,
  Lock,
  Globe,
  Sparkles,
  TrendingUp,
  Clock,
  Brain,
  BarChart2,
  CheckCircle2,
  CreditCard,
  Star,
  Menu,
  X,
} from "lucide-react"

export const LandingIcons = {
  // Navigation / generic
  arrow:        ArrowRight,
  check:        Check,
  checkCircle:  CheckCircle2,
  plus:         Plus,
  chev:         ChevronDown,
  menu:         Menu,
  close:        X,
  play:         Play,
  lock:         Lock,
  globe:        Globe,
  star:         Star,
  creditCard:   CreditCard,

  // Feature icons
  calendar:     Calendar,
  link:         Link2,
  bolt:         Zap,
  bot:          Bot,
  target:       Target,
  users:        Users,
  sparkles:     Sparkles,
  trending:     TrendingUp,
  clock:        Clock,
  brain:        Brain,
  chart:        BarChart2,

  // Resource icons
  fileText:       FileText,
  fileSpreadsheet: FileSpreadsheet,
  calculator:     Calculator,
  checkSquare:    CheckSquare,
  receipt:        Receipt,
  puzzle:         Puzzle,
} as const

export type LandingIconKey = keyof typeof LandingIcons
