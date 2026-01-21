export default function Topbar() {
    return (
      <header className="
        h-16 border-b border-white/10
        flex items-center justify-between
        px-8
      ">
  
        <p className="text-white/60">
          Panel de control
        </p>
  
        <div className="flex items-center gap-4">
          <div className="
            w-9 h-9 rounded-full
            bg-white/20
          "/>
        </div>
      </header>
    )
  }