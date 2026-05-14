"use client"

import { useQuery } from "@tanstack/react-query"

type ProfileData = {
  percent: number
  nextStep: string | null
}

export function ProfileCompletionBar() {
  const { data } = useQuery<ProfileData>({
    queryKey: ["profile-completion"],
    queryFn: () => fetch("/api/onboarding/profile-completion").then((r) => r.json()),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    staleTime: 120_000,
  })

  const percent = data?.percent ?? 0
  if (percent >= 100) return null

  return (
    <div className="px-3 py-2 mx-2 mb-2 rounded-lg bg-[var(--bg-subtle,#F8FAFC)]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-[var(--text-secondary,#64748B)]">
          Perfil al {percent}%
        </span>
        {data?.nextStep && (
          <span className="text-[10px] text-emerald-600 truncate max-w-[130px] text-right leading-tight">
            {data.nextStep}
          </span>
        )}
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
