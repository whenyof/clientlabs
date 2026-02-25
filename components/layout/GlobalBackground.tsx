export default function GlobalBackground() {
 return (
 <div className="pointer-events-none fixed inset-0 -z-10">
 <div className="absolute inset-0 bg-[var(--bg-card)] will-change-transform" />
 
 <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_22%,rgba(255,255,255,0.04)_45%,rgba(255,255,255,0)_68%,rgba(255,255,255,0.04)_90%)] opacity-30" />
 
 </div>
 )
}
