'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

export type LogoVariant =
  | 'full-green' | 'full-black' | 'full-white'
  | 'icon-gradient-green' | 'icon-solid-green'
  | 'icon-solid-black' | 'icon-solid-white'
  | 'avatar-green' | 'avatar-black'

const SRC: Record<LogoVariant, string> = {
  'full-green':          '/clientlabs-logo-full-green.svg',
  'full-black':          '/clientlabs-logo-full-black.svg',
  'full-white':          '/clientlabs-logo-full-white.svg',
  'icon-gradient-green': '/clientlabs-icon-gradient-green.svg',
  'icon-solid-green':    '/clientlabs-icon-solid-green.svg',
  'icon-solid-black':    '/clientlabs-icon-solid-black.svg',
  'icon-solid-white':    '/clientlabs-icon-solid-white.svg',
  'avatar-green':        '/clientlabs-avatar-green.svg',
  'avatar-black':        '/clientlabs-avatar-black.svg',
}

const RATIO: Record<LogoVariant, number> = {
  'full-green': 4,  'full-black': 4,  'full-white': 4,
  'icon-gradient-green': 1, 'icon-solid-green': 1,
  'icon-solid-black': 1,    'icon-solid-white': 1,
  'avatar-green': 1,        'avatar-black': 1,
}

interface LogoProps {
  variant?: LogoVariant
  width?: number
  height?: number
  className?: string
  alt?: string
  priority?: boolean
}

export function Logo({
  variant = 'icon-solid-green',
  width = 28,
  height,
  className,
  alt = 'ClientLabs',
  priority = false,
}: LogoProps) {
  const h = height ?? Math.round(width / RATIO[variant])
  return (
    <Image
      src={SRC[variant]}
      alt={alt}
      width={width}
      height={h}
      className={cn('select-none', className)}
      priority={priority}
    />
  )
}
