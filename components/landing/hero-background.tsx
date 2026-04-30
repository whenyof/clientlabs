"use client"

export function HeroBackground() {
  return (
    <>
      <style>{`
        @keyframes hl-drift-1 {
          0%   { transform: translate(0px, 0px) scale(1);    }
          30%  { transform: translate(110px, -80px) scale(1.12); }
          65%  { transform: translate(-70px, 60px) scale(0.92);  }
          100% { transform: translate(0px, 0px) scale(1);    }
        }
        @keyframes hl-drift-2 {
          0%   { transform: translate(0px, 0px) scale(1);    }
          40%  { transform: translate(-130px, 90px) scale(1.15); }
          75%  { transform: translate(80px, -50px) scale(0.95);  }
          100% { transform: translate(0px, 0px) scale(1);    }
        }
        @keyframes hl-drift-3 {
          0%   { transform: translate(0px, 0px) scale(1);    }
          35%  { transform: translate(80px, 100px) scale(1.08); }
          70%  { transform: translate(-90px, -40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1);    }
        }
        @keyframes hl-drift-4 {
          0%   { transform: translate(0px, 0px) scale(1);    }
          50%  { transform: translate(-70px, -100px) scale(1.10); }
          100% { transform: translate(0px, 0px) scale(1);    }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Orb 1 — top-left, grande */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-5%",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(31,169,122,0.38) 0%, rgba(31,169,122,0.14) 38%, transparent 68%)",
            animation: "hl-drift-1 18s ease-in-out infinite",
            willChange: "transform",
          }}
        />

        {/* Orb 2 — bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "-12%",
            right: "-6%",
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(31,169,122,0.32) 0%, rgba(31,169,122,0.10) 38%, transparent 68%)",
            animation: "hl-drift-2 24s ease-in-out infinite",
            willChange: "transform",
          }}
        />

        {/* Orb 3 — center-right, mediano */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "12%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(31,169,122,0.24) 0%, rgba(31,169,122,0.07) 45%, transparent 70%)",
            animation: "hl-drift-3 30s ease-in-out infinite",
            willChange: "transform",
          }}
        />

        {/* Orb 4 — bottom-left, suave */}
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "20%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(31,169,122,0.22) 0%, transparent 65%)",
            animation: "hl-drift-4 22s ease-in-out infinite 4s",
            willChange: "transform",
          }}
        />
      </div>
    </>
  )
}
