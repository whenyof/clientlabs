export default function StatCard({
    title,
    value,
  }: {
    title: string
    value: string
  }) {
    return (
      <div className="
        bg-white/5 border border-white/10
        rounded-xl p-6
      ">
        <p className="text-white/50 text-sm">
          {title}
        </p>
  
        <p className="text-2xl font-bold text-white mt-2">
          {value}
        </p>
      </div>
    )
  }