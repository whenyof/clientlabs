import sys
# A white screen normally means Next.js threw an error during render, or there is an explicit global override.
# The user reports "Toda la app (landing + dashboard) esta renderizando en blanco."
# Wait, no. If everything became "white", it means the default text-primary or bg-main CSS vars broke.
# En el paso anterior puse: 
# .dashboard-theme {...}
# pero NO hay :root ! 
# Si el componente GlobalBackground.tsx y el <body className="bg-[var(--bg-main)] text-[var(--text-primary)]"> 
# ya no encuentran las variables porque las quité del :root y las metí en .dashboard-theme
# Entonces a nivel general "--bg-main" es nada, y el body renderiza default (blanco).
# El usuario especifica:
# app/layout.tsx -> Solo wrapper neutro sin fondo forzado
# app/(public)/layout.tsx -> Fondo claro
# app/(dashboard)/layout.tsx -> Fondo oscuro
