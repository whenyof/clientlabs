# Plan técnico: Módulo operativo de pedidos a proveedor (Provider360)

## 1. Estado actual

- **Prisma**: `ProviderProduct`, `ProviderOrder`, `ProviderOrderItem`, `ProviderEmailTemplate` ya existen con los campos necesarios.
- **Tabs**: Resumen, Pedidos y pagos, Productos, Plantillas, Archivos, Tareas, Timeline. La tab **Plantillas** existe.
- **Productos**: CRUD create + list + search; tabla con código, nombre, categoría, unidad, precio, estado. Falta: editar, activar/desactivar, importación real.
- **Plantillas**: CRUD completo (crear, editar, eliminar, marcar predeterminada). Falta: bloque de ayuda con variables.
- **Pedidos**: `createProviderOrder` crea solo cabecera (amount, description, type). No hay líneas ni generación de email.
- **Email**: `renderOrderEmail` en `modules/providers/services/renderOrderEmail.ts` con variables `{provider_name}`, `{order_date}`, `{order_number}`, `{products_table}`, `{total_amount}`, `{notes}`.

## 2. Fases de implementación

### Fase 1 — Modelo de datos
- Sin cambios en Prisma (modelos listos). Opcional: asegurar que `ProviderOrder` tenga `orderNumber` generado al crear.

### Fase 2 — Tab Productos (CRUD completo)
- **Acciones**: `updateProviderProduct` y `getProviderProducts` ya existen.
- **UI**: Diálogo de edición de producto (reutilizar campos de CreateProviderProductDialog). Acciones en fila: Editar, Activar/Desactivar.
- **Archivos**: `EditProviderProductDialog.tsx` (nuevo o reutilizar Create como create/edit). En `ProviderSidePanel` tab productos: botón Editar por fila, toggle estado.

### Fase 3 — Importación CSV/Excel
- **Acción**: `importProviderProductsFromCsv(providerId, rows: { code, name, category?, unit?, price, description? }[])`.
- **UI**: `ImportProductsDialog.tsx`: subida de archivo, parse CSV (papaparse o similar), mapeo de columnas (opcional en MVP: columnas fijas código, nombre, categoría, unidad, precio, descripción), previsualización tabla, botón Importar. Botón "Descargar plantilla" ya existe en la tab.
- **Validación**: código y nombre obligatorios, precio numérico; duplicados por código: actualizar o saltar según criterio (MVP: crear todos y dejar duplicados por código para revisión manual o ignorar duplicados).

### Fase 4 — Tab Plantillas
- Añadir en la UI (tab Plantillas o en CreateEditTemplateDialog) un bloque lateral o colapsable con "Variables disponibles": `{provider_name}`, `{order_date}`, `{order_number}`, `{products_table}`, `{total_amount}`, `{notes}`.
- Opcional: botón "Vista previa" que rellene variables de ejemplo.

### Fase 5 — Flujo Nuevo pedido (con líneas y email)
- **Acción**: `createProviderOrderWithItems(data: { providerId, orderDate, templateId?, notes?, items: { productId, code, name, unit, unitPrice, quantity }[], emailTo? })`.
  - Generar `orderNumber` (ej. PRO-YYYYMM-XXX).
  - Crear `ProviderOrder` (status DRAFT o PREPARED), total = suma de subtotales.
  - Crear `ProviderOrderItem` por cada línea (codeSnapshot, nameSnapshot, unitSnapshot, unitPriceSnapshot, quantity, subtotal).
  - Si hay templateId, resolver plantilla y llamar a `renderOrderEmail` con variables; guardar emailSubject, emailBody, emailTo en el pedido.
- **UI**: Modal/drawer "Nuevo pedido":
  - Izquierda: buscador de productos del proveedor, lista de productos activos con input cantidad y "Añadir".
  - Derecha: resumen del pedido (líneas añadidas, subtotal por línea, total), notas, selector de plantilla, preview del email generado.
  - Acciones: "Guardar pedido", "Guardar y abrir email" (mailto:), "Copiar contenido del email".
- **Componente**: `NewProviderOrderModal.tsx` (nuevo), sustituir o complementar el actual "Registrar pedido" desde Provider360 para usar este flujo cuando se quiera pedido con líneas; el actual RegisterOrderDialog puede quedar para "registro rápido sin líneas".

### Fase 6 — Bloque de preparación (readiness) en Resumen
- En la tab Resumen de Provider360, añadir bloque "Preparación para pedidos":
  - Correo de pedidos configurado: `provider.contactEmail` presente.
  - Catálogo cargado: `products.length > 0`.
  - Plantilla predeterminada: `templates.some(t => t.isDefault)`.
  - Si falta algo: mensaje + CTA (Añadir correo → editar proveedor o hint; Importar productos → tab Productos o abrir import; Crear plantilla → tab Plantillas).
  - Si todo listo: CTA principal "Nuevo pedido" que abre el modal de Fase 5.

## 3. Archivos nuevos

| Archivo | Descripción |
|---------|-------------|
| `modules/providers/components/EditProviderProductDialog.tsx` | Editar producto existente (nombre, código, categoría, unidad, precio, estado activo). |
| `modules/providers/components/ImportProductsDialog.tsx` | Subida CSV/Excel, previsualización, importación. |
| `modules/providers/components/NewProviderOrderModal.tsx` | Modal/drawer nuevo pedido: selector productos, líneas, plantilla, preview email, acciones guardar/abrir email/copiar. |

## 4. Archivos a modificar

| Archivo | Cambios |
|---------|---------|
| `app/dashboard/providers/actions.ts` | `importProviderProductsFromCsv`, `createProviderOrderWithItems`, generación `orderNumber`. |
| `modules/providers/components/ProviderSidePanel.tsx` | Tab Productos: acciones Editar y Activar/Desactivar; render de `ImportProductsDialog` y `EditProviderProductDialog`; Resumen: bloque readiness y CTA Nuevo pedido; sustituir o combinar con `NewProviderOrderModal`. |
| `modules/providers/components/CreateEditTemplateDialog.tsx` | Añadir bloque "Variables disponibles" (opcional). |
| `modules/providers/services/renderOrderEmail.ts` | Ya listo; usarlo desde `createProviderOrderWithItems`. |

## 5. Decisiones de UX

- **Nuevo pedido**: Un solo flujo "Nuevo pedido" desde Provider360 que abre el modal con líneas + email; "Registrar pedido" rápido (solo importe) puede seguir existiendo para casos sin catálogo.
- **Importación**: MVP con CSV (columnas: codigo, nombre, categoria, unidad, precio, descripcion). Excel vía librería (xlsx) si se incluye; si no, solo CSV.
- **Readiness**: Tres checks (email, catálogo, plantilla). CTAs directos a la tab o acción correspondiente.
- **Estética**: Mantener estilo premium e institucional; reutilizar componentes de diseño existentes (Button, Input, Dialog, etc.).

## 6. Checklist manual de prueba

- [ ] Tab Productos: crear producto, editar producto, activar/desactivar, búsqueda por nombre/código.
- [ ] Descargar plantilla CSV, rellenar, importar: comprobar que los productos aparecen y se pueden editar.
- [ ] Tab Plantillas: crear, editar, eliminar, marcar predeterminada; ver variables disponibles.
- [ ] Resumen: con/sin email, con/sin productos, con/sin plantilla: comprobar mensajes y CTAs del bloque de preparación.
- [ ] Nuevo pedido: añadir líneas desde catálogo, elegir plantilla, ver preview del email, guardar pedido; comprobar que el pedido aparece en Pedidos y pagos con líneas y que emailSubject/emailBody están guardados.
- [ ] "Guardar y abrir email": abre cliente de correo con asunto y cuerpo.
- [ ] "Copiar contenido del email": copia al portapapeles el cuerpo (o asunto+cuerpo).
