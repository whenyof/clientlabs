"use client"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const TOOLS = [
  { id:"excel",    label:"Excel",     bg:"#217346", rotBase:-15,
    icon:<svg viewBox="0 0 24 24" width="26" height="26"><rect x="2" y="2" width="20" height="20" rx="3" fill="#217346"/><path d="M7 7l3.5 5L7 17M17 7v10M10 12h7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id:"whatsapp", label:"WhatsApp",  bg:"#25D366", rotBase:12,
    icon:<svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="10" fill="#25D366"/><path d="M17 14.5c-.3.8-1.5 1.5-2.4 1.7-.6.1-1.5.2-4.3-1.8-2.3-1.7-3.8-4-4-4.4-.1-.4-.1-1.7.7-2.8.3-.4.8-.6 1.2-.6h.4c.3 0 .7.1.9.7l.7 1.8c.1.3 0 .6-.2.8l-.4.5c-.1.2-.1.4 0 .6.4.8 1 1.5 1.8 2 .7.5 1.5.8 2.1.9.2 0 .4-.1.5-.3l.4-.5c.2-.3.5-.4.8-.2l1.8.8c.6.3.8.7.7 1.1z" fill="#fff"/></svg> },
  { id:"gmail",    label:"Gmail",     bg:"#fff",    rotBase:-8,
    icon:<svg viewBox="0 0 24 24" width="26" height="26"><rect x="2" y="5" width="20" height="14" rx="2" fill="#fff" stroke="#e2e8f0"/><path d="M2 7l10 7 10-7" stroke="#EA4335" strokeWidth="2" fill="none"/></svg> },
  { id:"drive",    label:"Drive",     bg:"#fff",    rotBase:18,
    icon:<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 4L4 18h16L12 4z" fill="#FBBC04"/><path d="M4 18l4-7h12l-4 7H4z" fill="#0F9D58"/><path d="M8 11L4 18h8L8 11z" fill="#4285F4"/></svg> },
  { id:"postit",   label:"Post-its",  bg:"#FCD34D", rotBase:-22,
    icon:<svg viewBox="0 0 24 24" fill="none" width="26" height="26"><rect x="3" y="3" width="18" height="18" rx="2" fill="#FCD34D"/><path d="M7 8h10M7 12h7M7 16h5" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id:"factura",  label:"Facturas",  bg:"#475569", rotBase:14,
    icon:<svg viewBox="0 0 24 24" fill="none" width="26" height="26"><rect x="4" y="2" width="16" height="20" rx="2" fill="#475569"/><path d="M8 7h8M8 11h8M8 15h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 15l2 2 3-3" stroke="#1FA97A" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id:"notion",   label:"Notion",    bg:"#191919", rotBase:-10,
    icon:<svg viewBox="0 0 24 24" fill="none" width="26" height="26"><rect x="3" y="3" width="18" height="18" rx="2" fill="#191919"/><path d="M7 7h6v2H7zM7 11h10v1.5H7zM7 14h8v1.5H7z" fill="#fff" opacity=".8"/></svg> },
  { id:"calendar", label:"Calendario",bg:"#2563EB", rotBase:20,
    icon:<svg viewBox="0 0 24 24" fill="none" width="26" height="26"><rect x="3" y="4" width="18" height="17" rx="2" fill="#2563EB"/><path d="M3 9h18" stroke="#fff" strokeWidth="1.5"/><path d="M8 3v3M16 3v3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><rect x="7" y="12" width="3" height="3" rx=".5" fill="#fff" opacity=".8"/><rect x="11" y="12" width="3" height="3" rx=".5" fill="#fff" opacity=".8"/></svg> },
]

// Posiciones px desde el centro — lado DERECHO
const POSITIONS = [
  { x: 180, y: -140 },
  { x: 290, y:  -55 },
  { x: 230, y:   65 },
  { x: 330, y:  145 },
  { x: 145, y: -225 },
  { x: 265, y:  205 },
  { x: 165, y:  165 },
  { x: 310, y: -185 },
]

// DATOS MEDIDOS EN VIVO DEL NAVEGADOR
// stScrollable = 3195px, winH = 754px
// Hero termina en p=0.253
// Plataforma empieza en p=0.717
// "02" centrado en scrollY=2625 → p=0.8216
const P = {
  TOOLS_COLLAPSE_START: 0.14,
  TOOLS_COLLAPSE_END:   0.24,
  PH_EMERGE_START:      0.22,
  PH_EMERGE_END:        0.32,
  SCREEN_ON_START:      0.26,
  SCREEN_ON_END:        0.36,
  LS_FADE_START:        0.30,
  LS_FADE_END:          0.40,
  DI_ON:                0.32,
  NOTIF_1:              0.34,
  NOTIF_2:              0.42,
  NOTIF_3:              0.52,
  MORPH_START:          0.574,
  MORPH_END:            0.800,
  PH_FADE_START:        0.72,
  PH_FADE_END:          0.800,
  DASH_EMERGE_START:    0.68,
  DASH_EMERGE_END:      0.8216,
  LOCK:                 0.8216,
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t))
}
function inv(t: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (t - a) / (b - a)))
}
function eOut(t: number) {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3)
}
function eIO(t: number) {
  t = Math.min(1, Math.max(0, t))
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function ChaosAnimation() {
  const toolRefs = useRef<(HTMLDivElement | null)[]>([])
  const phRef    = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const scrRef   = useRef<HTMLDivElement>(null)
  const soffRef  = useRef<HTMLDivElement>(null)
  const lsRef    = useRef<HTMLDivElement>(null)
  const diRef    = useRef<HTMLDivElement>(null)
  const diTRef   = useRef<HTMLSpanElement>(null)
  const ln1Ref   = useRef<HTMLDivElement>(null)
  const ln2Ref   = useRef<HTMLDivElement>(null)
  const ln3Ref   = useRef<HTMLDivElement>(null)
  const dashRef  = useRef<HTMLDivElement>(null)
  const ripRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)   // sticky canvas — se convierte en fixed al LOCK
  const floatAnimsRef = useRef<gsap.core.Tween[]>([])

  const [hora, setHora] = useState('09:41')
  const [fecha, setFecha] = useState('Lunes, 20 de abril')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const now = () => {
      const d = new Date()
      const h = d.getHours().toString().padStart(2,'0')
      const m = d.getMinutes().toString().padStart(2,'0')
      setHora(`${h}:${m}`)
      setFecha(d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}))
    }
    now()
    const iv = setInterval(now, 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => { setMounted(true) }, [])

  function renderScrollFrame(p: number) {
    p = Math.min(p, P.LOCK)   // la animación no pasa de este punto
    const ph   = phRef.current
    const shell = shellRef.current
    const inner = innerRef.current
    const scr   = scrRef.current
    const soff  = soffRef.current
    const ls    = lsRef.current
    const di    = diRef.current
    const diT   = diTRef.current
    const ln1   = ln1Ref.current
    const ln2   = ln2Ref.current
    const ln3   = ln3Ref.current
    const dash  = dashRef.current
    const rip   = ripRef.current
    if (!ph) return

    const vw = window.innerWidth
    const destX = -(vw * 0.26) - 110 // posición izquierda del iPhone

    // ── TOOLS: colapsan convergiendo hacia destX
    const collapseT = eIO(inv(p, P.TOOLS_COLLAPSE_START, P.TOOLS_COLLAPSE_END))
    if (p >= P.TOOLS_COLLAPSE_START) {
      toolRefs.current.forEach((el, i) => {
        if (!el) return
        const pos = POSITIONS[i]
        const tool = TOOLS[i]
        const cx = lerp(pos.x, destX, collapseT)
        const cy = lerp(pos.y, 0, collapseT)
        const cs = lerp(1, 0, collapseT)
        const co = lerp(1, 0, collapseT)
        const cr = lerp(tool.rotBase, 0, collapseT)
        el.style.transform = `translate(${cx}px,${cy}px) rotate(${cr}deg) scale(${cs})`
        el.style.opacity = String(co)
      })
    }

    // ── BLOQUEO FINAL en p=0.8216
    // El dashboard es un portal fixed en document.body — no necesita
    // posicionamiento: solo opacity y scale.
    if (p >= P.LOCK) {
      ph.style.opacity = '0'
      if (rip) rip.style.opacity = '0'
      if (dash) {
        dash.style.opacity   = '1'
        dash.style.transform = 'translateX(-50%) scale(1)'
      }
      return
    }

    // ── iPHONE posición base (izquierda)
    if (p < P.MORPH_START) {
      ph.style.width  = '220px'
      ph.style.height = '440px'
      ph.style.borderRadius = '44px'
      if (shell) shell.style.borderRadius = '44px'
      if (inner) inner.style.borderRadius = '40px'
      if (scr)   scr.style.borderRadius   = '40px'
      ph.style.position   = 'absolute'
      ph.style.left       = '50%'
      ph.style.top        = '50%'
      ph.style.marginLeft = destX + 'px'
      ph.style.marginTop  = '-220px'
    }

    // Emerge: p 0.22→0.32
    ph.style.opacity = String(eOut(inv(p, P.PH_EMERGE_START, P.PH_EMERGE_END)))
    if (p < P.MORPH_START) {
      ph.style.transform = `scale(${lerp(0.05, 1, eIO(inv(p, P.PH_EMERGE_START, P.PH_EMERGE_END + 0.02)))})`
    }

    // Pantalla enciende
    if (soff) soff.style.opacity = String(lerp(1, 0, eIO(inv(p, P.SCREEN_ON_START, P.SCREEN_ON_END))))
    if (ls)   ls.style.opacity   = String(eOut(inv(p, P.LS_FADE_START, P.LS_FADE_END)))

    // Dynamic Island
    if (di) di.classList.toggle('chaos-di-on', p >= P.DI_ON)
    if (diT && p >= P.DI_ON && p < P.NOTIF_2) diT.textContent = 'Nuevo lead'

    // Notificaciones
    if (ln1) ln1.classList.toggle('chaos-ln-in', p >= P.NOTIF_1)
    if (ln2) {
      ln2.classList.toggle('chaos-ln-in', p >= P.NOTIF_2)
      if (diT && p >= P.NOTIF_2 && p < P.NOTIF_3) diT.textContent = 'Factura cobrada'
    }
    if (ln3) {
      ln3.classList.toggle('chaos-ln-in', p >= P.NOTIF_3)
      if (diT && p >= P.NOTIF_3 && p < P.MORPH_START) diT.textContent = 'Automatización'
    }

    // ── MORPH: p 0.574→0.800
    if (p >= P.MORPH_START) {
      const mp = eIO(inv(p, P.MORPH_START, P.MORPH_END))
      const targetW = Math.min(vw * 0.84, 1000)
      const targetH = 580
      const iW  = lerp(220, targetW, mp)
      const iH  = lerp(440, targetH, mp)
      const iBR = lerp(44, 14, mp)

      ph.style.width        = iW + 'px'
      ph.style.height       = iH + 'px'
      ph.style.borderRadius = iBR + 'px'
      ph.style.left         = '50%'
      ph.style.top          = '50%'
      ph.style.marginLeft   = (-iW / 2) + 'px'
      ph.style.marginTop    = (-iH / 2) + 'px'
      ph.style.transform    = 'scale(1)'
      ph.style.opacity      = String(
        p > P.PH_FADE_START
          ? lerp(1, 0, eIO(inv(p, P.PH_FADE_START, P.PH_FADE_END)))
          : 1
      )

      if (shell) shell.style.borderRadius = iBR + 'px'
      if (inner) inner.style.borderRadius = Math.max(iBR - 4, 0) + 'px'
      if (scr)   scr.style.borderRadius   = Math.max(iBR - 8, 0) + 'px'
      if (ls)    ls.style.opacity = String(lerp(1, 0, eIO(inv(p, P.MORPH_START, P.MORPH_START + 0.05))))

      // Ripple al inicio del morph
      if (rip) {
        if (p <= P.MORPH_START + 0.06) {
          const rp = eOut(inv(p, P.MORPH_START, P.MORPH_START + 0.06))
          rip.style.opacity   = String(lerp(0.8, 0, rp))
          rip.style.transform = `scale(${lerp(1, 6, rp)})`
          rip.style.position  = 'absolute'
          rip.style.left      = '50%'
          rip.style.top       = '50%'
          rip.style.marginLeft = (destX) + 'px'
          rip.style.marginTop  = '-220px'
        } else {
          rip.style.opacity = '0'
        }
      }

      // Dashboard emerge: p 0.68→0.8216 — solo opacity y scale
      if (dash) {
        dash.style.opacity   = String(eOut(inv(p, P.DASH_EMERGE_START, P.DASH_EMERGE_END)))
        dash.style.transform = `translateX(-50%) scale(${lerp(0.2, 1, eIO(inv(p, P.MORPH_START, P.MORPH_END)))})`
      }
    } else {
      if (dash) { dash.style.opacity = '0'; dash.style.transform = 'translateX(-50%) scale(0.2)' }
      if (rip)  rip.style.opacity = '0'
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      // CRÍTICO: el scroll está en document.body
      ScrollTrigger.defaults({ scroller: document.body })

      const wrapper = document.getElementById('landing-anim-wrapper')
      if (!wrapper) return

      // Float de tools
      toolRefs.current.forEach((el, i) => {
        if (!el) return
        const pos = POSITIONS[i]
        const tool = TOOLS[i]
        gsap.set(el, { x: pos.x, y: pos.y, rotation: tool.rotBase, scale: 0, opacity: 0 })
        gsap.to(el, { scale: 1, opacity: 1, duration: 0.7, delay: 0.3 + i * 0.08, ease: 'back.out(1.4)' })
        const dur = 3.0 + i * 0.3
        const ampX = 10 + (i % 3) * 5
        const ampY = 8 + (i % 4) * 4
        const ampR = 5 + (i % 3) * 3
        const d = i % 2 === 0 ? 1 : -1
        floatAnimsRef.current.push(
          gsap.to(el, {
            x: pos.x + ampX * d, y: pos.y + ampY * -d,
            rotation: tool.rotBase + ampR * d,
            duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1,
          })
        )
      })

      // ── SCROLL LOCK POINT ────────────────────────────────────────────
      const scrollable  = wrapper.offsetHeight - window.innerHeight
      const lockScrollY = Math.round(scrollable * P.LOCK)

      // ScrollTrigger con scrub reducido (0.3) para menos lag
      const st = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
        scroller: document.body,
        onUpdate: (self) => {
          renderScrollFrame(self.progress)
        },
        // Cuando el trigger sale por abajo (usuario pasó el wrapper completo)
        // forzamos el estado final directamente — así no queda a medias por el scrub
        onLeave: () => {
          renderScrollFrame(P.LOCK)
        },
      })

      // ── CAPA DE SEGURIDAD: listener nativo ───────────────────────────
      // En cuanto scrollTop >= lockScrollY, forzamos el dashboard a plena
      // visibilidad sin esperar al scrub. Esto elimina cualquier lag visual.
      const enforceDash = () => {
        if (document.body.scrollTop < lockScrollY) return
        const dash = dashRef.current
        const ph   = phRef.current
        if (dash) {
          dash.style.opacity   = '1'
          dash.style.transform = 'translateX(-50%) scale(1)'
        }
        if (ph) ph.style.opacity = '0'
      }
      document.body.addEventListener('scroll', enforceDash, { passive: true })

      renderScrollFrame(0)

      return () => {
        st.kill()
        document.body.removeEventListener('scroll', enforceDash)
        floatAnimsRef.current.forEach(t => t.kill())
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Estilos del iPhone reutilizados
  const iphoneShell: React.CSSProperties = {
    position: 'absolute', inset: 0, borderRadius: '44px',
    background: 'linear-gradient(160deg,#2a2a2a 0%,#141414 40%,#0a0a0a 60%,#1e1e1e 100%)',
    boxShadow: 'inset 0 0 0 .5px rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.10),0 0 0 .5px #000,0 24px 80px rgba(0,0,0,.8)',
  }

  return (
    <>
    <div ref={canvasRef} style={{
      position: 'sticky', top: 0, height: '100vh', marginBottom: '-100vh',
      paddingTop: '64px', pointerEvents: 'none', zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* Fondo grid puntos */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(31,169,122,0.06) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}/>

      {/* Glow central */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(31,169,122,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      {/* TOOLS */}
      {TOOLS.map((tool, i) => (
        <div key={tool.id} ref={el => { toolRefs.current[i] = el }}
          style={{ position: 'absolute', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px', opacity: 0 }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px', background: tool.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>{tool.icon}</div>
          <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.4px', textTransform: 'uppercase' }}>{tool.label}</span>
        </div>
      ))}

      {/* RIPPLE */}
      <div ref={ripRef} style={{
        position: 'absolute', width: '220px', height: '440px', borderRadius: '44px',
        border: '1.5px solid rgba(31,169,122,.6)', opacity: 0, zIndex: 9, pointerEvents: 'none',
      }}/>

      {/* iPHONE */}
      <div ref={phRef} style={{
        position: 'absolute', left: '50%', top: '50%',
        marginLeft: `${-(window?.innerWidth ?? 1440) * 0.26 - 110}px`,
        marginTop: '-220px',
        width: '220px', height: '440px',
        borderRadius: '44px', overflow: 'hidden',
        opacity: 0, zIndex: 10,
        willChange: 'transform, width, height, opacity',
      }}>
        <div ref={shellRef} style={iphoneShell}/>
        {/* Botones */}
        {[
          { right:'-2.5px', top:'105px', width:'2.5px', height:'58px', borderRadius:'0 2px 2px 0', background:'linear-gradient(to right,#141414,#252525)' } as React.CSSProperties,
          { left:'-2.5px',  top:'85px',  width:'2.5px', height:'28px', borderRadius:'2px 0 0 2px', background:'linear-gradient(to left,#141414,#252525)'  } as React.CSSProperties,
          { left:'-2.5px',  top:'122px', width:'2.5px', height:'48px', borderRadius:'2px 0 0 2px', background:'linear-gradient(to left,#141414,#252525)'  } as React.CSSProperties,
          { left:'-2.5px',  top:'180px', width:'2.5px', height:'48px', borderRadius:'2px 0 0 2px', background:'linear-gradient(to left,#141414,#252525)'  } as React.CSSProperties,
        ].map((s, i) => <div key={i} style={{ position: 'absolute', ...s }}/>)}

        <div ref={innerRef} style={{ position:'absolute', inset:'5px', borderRadius:'40px', background:'#000', overflow:'hidden' }}>
          <div ref={scrRef} style={{ position:'absolute', inset:0, borderRadius:'40px', background:'#000', overflow:'hidden' }}>

            {/* Dynamic Island */}
            <div ref={diRef} style={{
              position:'absolute', top:'10px', left:'50%', transform:'translateX(-50%)',
              width:'74px', height:'24px', background:'#000', borderRadius:'16px', zIndex:20,
              transition:'width .45s cubic-bezier(.34,1.56,.64,1),height .45s cubic-bezier(.34,1.56,.64,1)',
              display:'flex', alignItems:'center', padding:'0 8px', overflow:'hidden',
            }} className="chaos-di">
              <div className="chaos-di-dot" style={{
                width:'7px', height:'7px', borderRadius:'50%', background:'#1FA97A',
                opacity:0, transition:'opacity .3s', boxShadow:'0 0 6px #1FA97A', flexShrink:0,
              }}/>
              <span ref={diTRef} className="chaos-di-txt" style={{
                fontSize:'9px', color:'rgba(255,255,255,.92)', fontWeight:600,
                opacity:0, transition:'opacity .3s', whiteSpace:'nowrap', flex:1, padding:'0 6px',
              }}>Nuevo lead</span>
            </div>

            {/* Screen off */}
            <div ref={soffRef} style={{ position:'absolute', inset:0, borderRadius:'40px', background:'#000', zIndex:5 }}/>

            {/* Lock screen */}
            <div ref={lsRef} style={{
              position:'absolute', inset:0, borderRadius:'40px', zIndex:4, opacity:0,
              background:'linear-gradient(180deg,#071422 0%,#0c1d32 45%,#071422 100%)',
              display:'flex', flexDirection:'column', alignItems:'center', paddingTop:'44px',
            }}>
              <div style={{ fontSize:'56px', fontWeight:100, color:'#fff', letterSpacing:'-3px', lineHeight:1, marginBottom:'4px' }}>{hora}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,.45)', fontWeight:300, marginBottom:'18px', textTransform:'capitalize' }}>{fecha}</div>
              <div style={{ width:'100%', padding:'0 10px', display:'flex', flexDirection:'column', gap:'7px' }}>
                {[
                  { ref:ln1Ref, bg:'rgba(31,169,122,.18)', title:'Lead nuevo — María García', sub:'Formulario web · Diseño web', time:'ahora',
                    icon:<svg viewBox="0 0 16 16" fill="none" width="13" height="13"><circle cx="8" cy="6" r="3" stroke="#1FA97A" strokeWidth="1.5"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="#1FA97A" strokeWidth="1.5" strokeLinecap="round"/></svg> },
                  { ref:ln2Ref, bg:'rgba(59,130,246,.18)',  title:'Factura cobrada — 2.400€', sub:'Restaurante Mirador', time:'3m',
                    icon:<svg viewBox="0 0 16 16" fill="none" width="13" height="13"><rect x="2" y="4" width="12" height="8" rx="1.5" stroke="#3b82f6" strokeWidth="1.5"/><path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="#3b82f6" strokeWidth="1.5"/></svg> },
                  { ref:ln3Ref, bg:'rgba(139,92,246,.18)',  title:'Automatización enviada', sub:'12 leads en seguimiento', time:'8m',
                    icon:<svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M8 2l1.6 3.2L13 6l-2.5 2.4.6 3.4L8 10.1l-3.1 1.7.6-3.4L3 6l3.4-.8L8 2z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
                ].map((n, i) => (
                  <div key={i} ref={n.ref} className="chaos-ln" style={{
                    background:'rgba(255,255,255,.07)', border:'.5px solid rgba(255,255,255,.09)',
                    borderRadius:'14px', padding:'8px 10px',
                    display:'flex', alignItems:'center', gap:'8px',
                    transform:'translateY(-22px) scale(.92)', opacity:0,
                    transition:'all .45s cubic-bezier(.34,1.56,.64,1)',
                  }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:n.bg,
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{n.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'7px', color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:'1px' }}>ClientLabs</div>
                      <div style={{ fontSize:'10px', fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.title}</div>
                      <div style={{ fontSize:'8.5px', color:'rgba(255,255,255,.4)', marginTop:'1px' }}>{n.sub}</div>
                    </div>
                    <div style={{ fontSize:'7.5px', color:'rgba(255,255,255,.28)', flexShrink:0 }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS dinámico */}
      <style>{`
        .chaos-di-on { width: 175px !important; height: 30px !important; }
        .chaos-di-on .chaos-di-dot { opacity: 1 !important; }
        .chaos-di-on .chaos-di-txt { opacity: 1 !important; }
        .chaos-ln-in { transform: translateY(0) scale(1) !important; opacity: 1 !important; }
      `}</style>
    </div>

    {/* DASHBOARD — portal a document.body para que position:fixed funcione
        sin importar qué scroll container o overflow:hidden tenga ningún padre */}
    {mounted && createPortal(
      <div ref={dashRef} style={{
        position: 'fixed',
        top: 'calc(50vh - 290px)',
        left: '50%',
        transform: 'translateX(-50%) scale(0.2)',
        width: 'min(1000px, 84vw)',
        height: '580px',
        borderRadius: '14px',
        overflow: 'hidden',
        opacity: 0,
        zIndex: 9999,
        background: '#f0f2f5',
        boxShadow: '0 40px 120px rgba(0,0,0,.5), 0 0 80px rgba(31,169,122,.08)',
        display: 'flex',
        willChange: 'transform, opacity',
        pointerEvents: 'none',
        transformOrigin: 'center center',
      }}>
        {/* Sidebar */}
        <div style={{ width:'185px', flexShrink:0, background:'#fff', borderRight:'.5px solid #e8eaed', display:'flex', flexDirection:'column', padding:'16px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', padding:'0 14px 14px' }}>
            <div style={{ width:'20px', height:'20px', background:'#1FA97A', borderRadius:'6px' }}/>
            <span style={{ fontSize:'13px', fontWeight:700, color:'#0B1F2A', letterSpacing:'-.3px' }}>Client<span style={{ color:'#1FA97A' }}>Labs</span></span>
          </div>
          {[
            { s:true, l:'Core' },
            { l:'Dashboard', a:true },
            { l:'Leads', b:'47', bc:'#E1F5EE', bt:'#1FA97A' },
            { l:'Clientes' }, { l:'Proveedores' },
            { l:'Tareas', b:'3', bc:'#fee2e2', bt:'#ef4444' },
            { l:'Finanzas' },
            { s:true, l:'Inteligencia' },
            { l:'Marketing' }, { l:'Automatizaciones' },
          ].map((item: any, i) => item.s ? (
            <div key={i} style={{ fontSize:'9px', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.8px', padding:'10px 14px 4px' }}>{item.l}</div>
          ) : (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 12px', margin:'0 5px', borderRadius:'8px', background:item.a?'#E1F5EE':'transparent' }}>
              <span style={{ fontSize:'11px', fontWeight:item.a?600:500, color:item.a?'#1FA97A':'#64748b', flex:1 }}>{item.l}</span>
              {item.b && <span style={{ fontSize:'9px', fontWeight:700, padding:'1px 5px', borderRadius:'10px', background:item.bc, color:item.bt }}>{item.b}</span>}
            </div>
          ))}
          <div style={{ flex:1 }}/>
          <div style={{ height:'.5px', background:'#e8eaed', margin:'0 12px 8px' }}/>
          <div style={{ padding:'8px 12px', display:'flex', alignItems:'center', gap:'7px' }}>
            <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#1FA97A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:700, color:'#fff' }}>CL</div>
            <div><div style={{ fontSize:'10px', fontWeight:600, color:'#1e293b' }}>ClientLabs</div><div style={{ fontSize:'9px', color:'#94a3b8' }}>Plan Pro</div></div>
          </div>
        </div>
        {/* Main */}
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ height:'50px', flexShrink:0, background:'#fff', borderBottom:'.5px solid #e8eaed', display:'flex', alignItems:'center', padding:'0 20px', gap:'10px' }}>
            <div style={{ flex:1 }}><div style={{ fontSize:'15px', fontWeight:700, color:'#0B1F2A' }}>Buenas tardes ☀️</div><div style={{ fontSize:'10px', color:'#94a3b8', marginTop:'1px' }}>Resumen del negocio en tiempo real</div></div>
            <button style={{ padding:'5px 10px', borderRadius:'8px', border:'.5px solid #e2e8f0', background:'#fff', fontSize:'10px', fontWeight:600, color:'#64748b' }}>+ Nuevo lead</button>
            <button style={{ padding:'5px 10px', borderRadius:'8px', border:'none', background:'#1FA97A', fontSize:'10px', fontWeight:600, color:'#fff' }}>+ Nueva tarea</button>
          </div>
          <div style={{ flex:1, padding:'14px 18px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gridTemplateRows:'auto auto 1fr', gap:'11px', overflow:'hidden' }}>
            {[
              { l:'Facturado este mes', v:'14.280€', s:'↑ +23%', sc:'#1FA97A', w:'74%', bc:'#1FA97A' },
              { l:'Pendiente de cobro',  v:'3.900€',  s:'2 facturas · 8d', sc:'#94a3b8', w:'38%', bc:'#f59e0b' },
              { l:'Leads activos',       v:'47',       s:'↑ +12 esta semana', sc:'#1FA97A', w:'82%', bc:'#1FA97A' },
            ].map((k, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:'11px', border:'.5px solid #e8eaed', padding:'13px 15px' }}>
                <div style={{ fontSize:'8px', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:'4px' }}>{k.l}</div>
                <div style={{ fontSize:'24px', fontWeight:800, color:'#0B1F2A', letterSpacing:'-.5px', lineHeight:1 }}>{k.v}</div>
                <div style={{ fontSize:'9px', color:k.sc, marginTop:'3px', fontWeight:600 }}>{k.s}</div>
                <div style={{ height:'2px', background:'#f1f5f9', borderRadius:'2px', marginTop:'6px', overflow:'hidden' }}><div style={{ height:'100%', width:k.w, background:k.bc, borderRadius:'2px' }}/></div>
              </div>
            ))}
            <div style={{ background:'#fff', borderRadius:'11px', border:'.5px solid #e8eaed', padding:'13px 15px', gridColumn:'1/4' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#0B1F2A', marginBottom:'8px', display:'flex', justifyContent:'space-between' }}>Pipeline de leads<span style={{ fontSize:'9px', fontWeight:500, color:'#94a3b8' }}>47 en total</span></div>
              <div style={{ display:'flex', gap:'7px' }}>
                {[{l:'Nuevo',n:18,c:'#1FA97A',bg:'#E1F5EE'},{l:'Contactado',n:12,c:'#3b82f6',bg:'#dbeafe'},{l:'Cualificado',n:9,c:'#f59e0b',bg:'#fef3c7'},{l:'Convertido',n:6,c:'#8b5cf6',bg:'#ede9fe'},{l:'Perdido',n:2,c:'#ef4444',bg:'#fee2e2'}].map((col,i)=>(
                  <div key={i} style={{ flex:1, background:'#f8fafc', borderRadius:'8px', padding:'9px', border:'.5px solid #e8eaed' }}>
                    <div style={{ fontSize:'8px', fontWeight:700, color:col.c, marginBottom:'3px' }}>{col.l}</div>
                    <div style={{ fontSize:'17px', fontWeight:800, color:'#0B1F2A' }}>{col.n}</div>
                    <div style={{ height:'2px', background:col.bg, borderRadius:'2px', marginTop:'4px' }}><div style={{ height:'100%', width:'100%', background:col.c, borderRadius:'2px' }}/></div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'#fff', borderRadius:'11px', border:'.5px solid #e8eaed', padding:'13px 15px', gridColumn:'1/3' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#0B1F2A', marginBottom:'7px' }}>Leads recientes</div>
              {[{av:'MG',c:'#1FA97A',n:'María García Ruiz',m:'Diseño web',bl:'Nuevo',bc:'#E1F5EE',bt:'#1FA97A'},{av:'RM',c:'#3b82f6',n:'Restaurante Mirador',m:'Branding',bl:'Contactado',bc:'#dbeafe',bt:'#3b82f6'},{av:'EV',c:'#f59e0b',n:'Estudio Vega',m:'Web + SEO',bl:'Cualificado',bc:'#fef3c7',bt:'#d97706'},{av:'HM',c:'#8b5cf6',n:'Hotel Miramar BCN',m:'Diseño web',bl:'Propuesta',bc:'#ede9fe',bt:'#7c3aed'}].map((r,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 0', borderBottom:'.5px solid #f1f5f9' }}>
                  <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:r.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:700, color:'#fff', flexShrink:0 }}>{r.av}</div>
                  <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:'10px', fontWeight:600, color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.n}</div><div style={{ fontSize:'9px', color:'#94a3b8' }}>{r.m}</div></div>
                  <span style={{ padding:'2px 6px', borderRadius:'5px', fontSize:'8px', fontWeight:700, background:r.bc, color:r.bt, flexShrink:0 }}>{r.bl}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'#fff', borderRadius:'11px', border:'.5px solid #e8eaed', padding:'13px 15px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#0B1F2A', marginBottom:'7px' }}>Actividad reciente</div>
              {[{c:'#1FA97A',t:'Nuevo lead — María García',m:'Hace 2 minutos'},{c:'#3b82f6',t:'Factura cobrada 2.400€',m:'Hace 8 minutos'},{c:'#8b5cf6',t:'Email automático enviado',m:'Hace 15 minutos'},{c:'#f59e0b',t:'Tarea — Propuesta Vega',m:'Hace 1 hora'}].map((a,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'7px', padding:'5px 0', borderBottom:i<3?'.5px solid #f1f5f9':'none' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:a.c, flexShrink:0, marginTop:'3px' }}/>
                  <div style={{ flex:1 }}><div style={{ fontSize:'9px', fontWeight:600, color:'#334155' }}>{a.t}</div><div style={{ fontSize:'8px', color:'#94a3b8', marginTop:'1px' }}>{a.m}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  )
}
