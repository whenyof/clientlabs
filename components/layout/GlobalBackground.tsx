export default function GlobalBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] will-change-transform" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.2),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(124,58,237,0.16),transparent_32%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_22%,rgba(255,255,255,0.04)_45%,rgba(255,255,255,0)_68%,rgba(255,255,255,0.04)_90%)] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(124,58,237,0.16),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_60%_80%,rgba(124,58,237,0.1),transparent_30%)]" />
    </div>
  )
}
