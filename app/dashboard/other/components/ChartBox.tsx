export default function ChartBox({ title }: { title: string }) {
    return (
      <div className="
        bg-white/5 border border-white/10
        rounded-xl p-6 h-64
      ">
        <h3 className="text-white font-semibold mb-2">
          {title}
        </h3>
  
        <div className="
          h-full flex items-center justify-center
          text-white/30
        ">
          (Gráfica aquí)
        </div>
      </div>
    )
  }