"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

export interface FilterDropdownOption {
  value: string
  label: string
}

export interface FilterDropdownProps {
  label: string
  value: string
  options: FilterDropdownOption[]
  onChange: (value: string) => void
  /** Optional placeholder when value is empty */
  placeholder?: string
  className?: string
}

const triggerHeight = "h-9"
const triggerStyles = [
  "inline-flex items-center justify-between gap-2 rounded-xl border border-white/10",
  "bg-white/5 text-white text-sm font-medium",
  "hover:bg-white/[0.07] active:bg-white/10",
  "transition-colors duration-150 outline-none",
  "focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20",
  "min-w-[7rem] px-3 py-2",
  triggerHeight,
].join(" ")

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Todos",
  className,
}: FilterDropdownProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const [open, setOpen] = React.useState(false)
  const displayLabel = value ? options.find((o) => o.value === value)?.label ?? value : placeholder

  const handleSelect = (v: string) => {
    onChange(v)
    setOpen(false)
  }

  if (!mounted) return null

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger
        className={cn(triggerStyles, className)}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDownIcon
          className={cn("w-4 h-4 shrink-0 text-white/50 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="start"
          sideOffset={6}
          className={cn(
            "z-50 min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))]",
            "rounded-xl border border-white/10 shadow-2xl",
            "bg-[#0f172a] backdrop-blur-md",
            "overflow-hidden overflow-y-auto p-1",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2"
          )}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {options.map((opt) => (
            <DropdownMenuPrimitive.Item
              key={opt.value}
              onSelect={() => handleSelect(opt.value)}
              className={cn(
                "relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-white outline-none",
                "hover:bg-white/10 focus:bg-white/10 data-[highlighted]:bg-white/10",
                "transition-colors duration-100",
                value === opt.value && "bg-white/15 text-white"
              )}
            >
              {value === opt.value ? (
                <CheckIcon className="w-4 h-4 shrink-0 text-white/80" aria-hidden />
              ) : (
                <span className="w-4 shrink-0" aria-hidden />
              )}
              <span className="truncate">{opt.label}</span>
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
