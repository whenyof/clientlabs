# El user se queja de que toda la app se quedo blanca!! 
# En el paso previo quité bg-[var(--bg-main)] del app/layout.tsx body
# Eso arregla la herencia globar, PERO:
# Landing publico: app/page.tsx NO ESTÁ BAJO NINGUN ROOT con color (si no es que lo pongo)
# app/dashboard/layout.tsx ahora SI tiene .dashboard-theme
# Ah, entiendo qué pasa:
# En mi intento anterior metí public/page.tsx, pero no moví layout o Navbar de sitio.
# Todo el app usa '@/app/dashboard/' internal paths, no puedo meter TODO dashboard bajo (dashboard) 
# porque hay MILLONES de imports relativos y absolutos q apuntan a @/app/dashboard/...
# Nextjs los soporta si muevo la carpeta, pero Typescript rompe import '@/app/dashboard/...' si la carpeta fisica se llama '(dashboard)'.
# (Bueno, si lo llamo `app/(dashboard)/dashboard/...` es doble y raro).
# Asi que VOy a DEVOLVER la estructura:
# app/dashboard/... (no es un route group)
# y crearé el envoltorio allí.
