export default function Activity() {
    return (
      <div className="
        bg-[var(--bg-main)] border border-[var(--border-subtle)]
        rounded-xl p-6
      ">
        <h3 className="text-[var(--text-primary)] font-semibold mb-4">
          Actividad reciente
        </h3>
  
        <div className="space-y-3 text-[var(--text-secondary)] text-sm">
          <p>✔ Nuevo cliente registrado</p>
          <p>✔ Venta añadida (120 €)</p>
          <p>✔ Reporte descargado</p>
        </div>
      </div>
    )
  }