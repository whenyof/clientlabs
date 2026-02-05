# Sincronización entre paneles – Resumen

## Objetivo

Sincronización basada en eventos reales: un cambio persiste en BD, se revalida en las rutas afectadas y el dashboard (y paneles relacionados) reflejan el mismo estado sin estado local ni suposiciones de UI.

## Reglas aplicadas

- ✅ Todo cambio persiste en BD (ya existente).
- ✅ Revalidación de rutas afectadas en cada mutación.
- ✅ Dashboard y ActivityFeed refetchean al recuperar foco (ventana/tab).
- ❌ Sin nuevas tablas, sin nuevas features, sin estados duplicados ni delays artificiales.

---

## 1. Eventos / mutaciones sincronizados

| Origen | Acción | Persistencia | Revalidación | Reflejo en paneles |
|--------|--------|--------------|--------------|--------------------|
| **Sales (API)** | POST crear venta | `prisma.sale.create` | `revalidatePath('/dashboard/other')`, `revalidatePath('/dashboard/other/sales')` | Dashboard KPIs, lista Sales; al volver al tab se refrescan stats |
| **Sales (API)** | PATCH actualizar venta | `prisma.sale.update` | Misma revalidación | Igual que arriba |
| **Tasks** | create / update / toggle / delete | `prisma.task.*` | `revalidatePath('/dashboard/other/clients')`, `revalidatePath('/dashboard/other')`, `revalidatePath('/dashboard/tasks')` | Clients (tareas por cliente), Dashboard KPIs (tasks pendientes), lista Tasks |
| **Clients** | update, note, interaction, sale, task, etc. | `prisma.client.*` / `prisma.sale.*` / `prisma.task.*` | `revalidatePath('/dashboard/other/clients')`, `revalidatePath('/dashboard/other')` | Dashboard KPIs (clientes, ventas, tareas), lista Clients |
| **Leads** | create, update, stage, convert, etc. | `prisma.lead.*` + `Activity` (lead) | `revalidatePath('/dashboard/other/leads')`, `revalidatePath('/dashboard/other')` (y clients cuando aplica) | Dashboard KPIs (leads), Activity feed (eventos lead), lista Leads / Clients |

---

## 2. Cambios realizados (estados corregidos)

### 2.1 Dashboard como lector global

- **Antes:** Stats y gráficos se cargaban una sola vez al montar (`useEffect` con `[]`). Cambios en Sales/Tasks/Clients/Leads en otra pestaña o tras navegar no se veían hasta recargar la página.
- **Ahora:** Al recuperar foco de la ventana (`window.addEventListener('focus', ...)`), el dashboard vuelve a pedir `/api/dashboard/stats` y actualiza KPIs y `revenueByMonth`. No hay estado “fantasma”: lo que muestra el dashboard coincide con la BD al volver al tab.

### 2.2 Activity feed

- **Antes:** Actividad (eventos de leads) se cargaba solo al montar.
- **Ahora:** Al recuperar foco se vuelve a llamar a `/api/dashboard/activity`. Nuevas actividades de leads aparecen sin recargar la página.

### 2.3 Revalidación en mutaciones

- **Sales API** (`app/api/sales/route.ts`, `app/api/sales/[id]/route.ts`): Tras crear o actualizar una venta se llama a `revalidatePath('/dashboard/other')` y `revalidatePath('/dashboard/other/sales')`. Cualquier contenido servidor de esas rutas usa datos actualizados.
- **Tasks** (`modules/tasks/actions`, `app/dashboard/tasks/actions`): En create, update, toggle y delete se añadió `revalidatePath('/dashboard/other')` y `revalidatePath('/dashboard/tasks')` además de `/dashboard/other/clients`. El contador de tareas del dashboard y la lista de tasks quedan alineados con la BD.
- **Clients** (`app/dashboard/other/clients/actions.ts`, `modules/clients/actions/index.ts`): En todas las mutaciones que ya llamaban a `revalidatePath('/dashboard/other/clients')` se añadió `revalidatePath('/dashboard/other')`. Crear/editar cliente, ventas o tareas desde clientes actualiza el dashboard.
- **Leads** (`app/dashboard/other/leads/actions.ts`, `modules/leads/actions/index.ts`): Donde se revalidaba solo `/dashboard/other/leads` (y a veces `/dashboard/other/clients`) se añadió `revalidatePath('/dashboard/other')`. Cambios de leads y conversión a cliente se reflejan en el dashboard.

---

## 3. Puntos que estaban desincronizados y ahora no

| Antes | Ahora |
|-------|--------|
| Crear venta en Sales → dashboard seguía con KPIs antiguos hasta F5 | Dashboard refetch al foco; rutas revalidadas; mismo evento, mismo estado en todos los paneles |
| Completar/crear tarea en Tasks o desde Clients → dashboard con “tareas pendientes” desactualizado | Revalidación de `/dashboard/other` y `/dashboard/tasks`; refetch de stats al foco |
| Añadir cliente o venta desde Clients → dashboard sin actualizar | Revalidación de `/dashboard/other`; refetch de stats al foco |
| Cambiar lead o convertir a cliente → dashboard y feed de actividad desactualizados | Revalidación de `/dashboard/other`; Activity feed y stats refetchean al foco |
| Activity feed solo cargaba al montar | Refetch de actividad al recuperar foco de la ventana |

---

## 4. Flujo resultante

1. **Un evento ocurre una vez:** creación/actualización de Sale, Task, Client o Lead (y Activity para leads).
2. **Persistencia:** Todo se escribe en BD (Prisma); no se usa estado local para “reflejar” el cambio.
3. **Revalidación:** Cada mutación llama a `revalidatePath` de las rutas afectadas (`/dashboard/other`, `/dashboard/other/sales`, `/dashboard/tasks`, `/dashboard/other/clients`, `/dashboard/other/leads` según corresponda).
4. **Dashboard y Activity como lectores:** Al volver a la pestaña del dashboard, el listener de `focus` dispara refetch de `/api/dashboard/stats` y de `/api/dashboard/activity`, de modo que KPIs, gráficos y feed muestran el mismo estado que la BD.

Con esto se cumple: un evento ocurre una vez, el sistema entero lo refleja, ningún panel muestra información distinta y no se introducen lag ni estados falsos.
