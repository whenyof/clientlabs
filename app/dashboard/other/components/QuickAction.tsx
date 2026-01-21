type Props = {
    title: string
    description: string
  }
  
  export default function QuickAction({ title, description }: Props) {
    return (
      <button className="
        bg-white/5 border border-white/10
        rounded-xl p-6 text-left
        hover:bg-white/10 transition
      ">
        <h4 className="text-white font-semibold">
          {title}
        </h4>
        <p className="text-white/60 text-sm mt-1">
          {description}
        </p>
      </button>
    )
  }