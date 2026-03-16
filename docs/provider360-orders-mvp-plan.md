# Plan técnico: Módulo operativo de pedidos a proveedor (Provider360)

## 1. Plan de implementación por fases

### Fase 1 — Modelo de datos (ya existente, validación)
- **Prisma:** `Provider`, `ProviderProduct`, `ProviderOrder`, `ProviderOrderItem`, `ProviderEmailTemplate` ya existen.
- **ProviderProduct:** id, providerId, userId, name, code, unit, price, description, category, notes, isActive ✅
- **ProviderOrder:** id, providerId, userId, amount, status, orderDate, templateId, emailTo, emailSubject, emailBody, notes, orderNumber ✅
- **ProviderOrderItem:** id, orderId, productId, codeSnapshot, nameSnapshot, unitSnapshot, unitPriceSnapshot, quantity, subtotal ✅
- **ProviderEmailTemplate:** id, providerId, userId, name, subject, body, isDefault ✅
- **Acción:** No migración; opcional añadir `orderNumber` auto si no existe lógica. Resto listo.

### Fase 2 — Tab Productos (CRUD completo + UI)
- **Acciones:** `getProviderProducts`, `createProviderProduct`, `updateProviderProduct` existen. Añadir `category` a create/update si no se envía.
- **UI:** Tab Productos ya existe. Añadir: columna Categoría, búsqueda por nombre/código, botón "Importar Excel/CSV", "Descargar plantilla".
- **Edit product:** Dialog o inline para editar producto y activar/desactivar.
- **Archivos:** `ProviderSidePanel.tsx` (tab productos), `CreateProviderProductDialog.tsx` (añadir category), `EditProviderProductDialog.tsx` (nuevo opcional o reutilizar create con id).

### Fase 3 — Importación CSV/Excel
- **Servicio:** `modules/providers/services/importProviderProducts.ts` — parse CSV/Excel, validar filas, mapear columnas.
- **UI:** `ImportProductsDialog.tsx` — subir archivo, mapear columnas (nombre, código, precio, unidad, categoría), previsualizar, confirmar import.
- **Plantilla:** Endpoint o asset estático `/api/providers/product-import-template.csv` o botón que genera CSV de ejemplo.
- **Acción:** `importProviderProducts(providerId, rows[])` en `app/dashboard/providers/actions.ts`.

### Fase 4 — Tab Plantillas
- **Nueva tab:** "Plantillas" entre Productos y Archivos en `ProviderSidePanel`.
- **Acciones:** `getProviderEmailTemplates`, `createProviderEmailTemplate`, `updateProviderEmailTemplate`, `deleteProviderEmailTemplate`, `setDefaultProviderEmailTemplate`.
- **UI:** Lista de plantillas, "Nueva plantilla", editor (nombre, asunto, cuerpo), panel de variables, preview.
- **Componentes:** `ProviderTemplatesTab.tsx`, `CreateEditTemplateDialog.tsx`, variables: `{provider_name}`, `{order_date}`, `{order_number}`, `{products_table}`, `{total_amount}`, `{notes}`.

### Fase 5 — Flujo Nuevo pedido (con líneas)
- **Acción nueva:** `createProviderOrderWithItems(data: { providerId, templateId?, notes?, items: { productId, quantity }[] })` — crea Order + OrderItems con snapshots, genera emailSubject/emailBody, orderNumber.
- **Servicio:** `modules/providers/services/renderOrderEmail.ts` — sustituye variables en plantilla, genera `products_table` en texto.
- **UI:** `NewOrderModal.tsx` (o drawer ancho): izquierda = buscador + tabla productos + añadir cantidad; derecha = resumen líneas, total, notas, plantilla, preview email. Acciones: Guardar pedido, Guardar y abrir email, Copiar email.
- **Integración:** Sustituir o complementar `RegisterOrderDialog` desde Provider360 por este flujo cuando se quiera “pedido con líneas”. Mantener `RegisterOrderDialog` para registro rápido sin líneas si se desea.

### Fase 6 — Generación y preview del email
- **Lógica:** `renderOrderEmail(template, { providerName, orderDate, orderNumber, productsTable, totalAmount, notes })` → { subject, body }.
- **products_table:** Formato texto plano por línea, ej: `- COD123 | Tomate | 3 uds | 12,50 €`.
- **Guardar en Order:** emailTo (provider.contactEmail), emailSubject, emailBody al crear/actualizar.

### Fase 7 — Readiness en Resumen
- **Bloque "Preparación":** Mostrar estado: correo configurado (provider.contactEmail), catálogo cargado (products.length > 0), plantilla predeterminada (template isDefault). CTAs: Añadir correo, Importar productos, Crear plantilla. Si todo listo: CTA "Nuevo pedido".

---

## 2. Archivos nuevos y modificados

| Acción | Ruta |
|--------|------|
| **Nuevo** | `modules/providers/services/renderOrderEmail.ts` |
| **Nuevo** | `modules/providers/services/importProviderProducts.ts` (o en actions) |
| **Nuevo** | `modules/providers/components/ImportProductsDialog.tsx` |
| **Nuevo** | `modules/providers/components/NewOrderWithLinesModal.tsx` |
| **Nuevo** | `modules/providers/components/ProviderTemplatesTab.tsx` |
| **Nuevo** | `modules/providers/components/CreateEditTemplateDialog.tsx` |
| **Modificar** | `app/dashboard/providers/actions.ts` — getProviderEmailTemplates, create/update/delete/setDefault template; createProviderOrderWithItems; importProviderProducts |
| **Modificar** | `modules/providers/components/ProviderSidePanel.tsx` — tab Plantillas, tab Productos (búsqueda, columna categoría, botón importar), Resumen (readiness), botón Nuevo pedido → NewOrderWithLinesModal |
| **Modificar** | `modules/providers/components/CreateProviderProductDialog.tsx` — campo category opcional |
| **Modificar** | `modules/providers/actions.ts` — re-export nuevas acciones si están en dashboard/actions |

---

## 3. Modelos / entidades

- **ProviderProduct:** ya existe con category, notes.
- **ProviderOrder:** ya existe con templateId, emailTo, emailSubject, emailBody, orderNumber.
- **ProviderOrderItem:** ya existe con snapshots.
- **ProviderEmailTemplate:** ya existe con isDefault.
- Sin cambios de schema salvo que se quiera orden numérico auto (opcional).

---

## 4. Rutas, acciones, componentes y diálogos

| Tipo | Nombre | Descripción |
|------|--------|-------------|
| **Tab** | Plantillas | Nueva pestaña en Provider360 |
| **Server Actions** | getProviderEmailTemplates(providerId) | Listar plantillas |
| | createProviderEmailTemplate(data) | Crear |
| | updateProviderEmailTemplate(id, data) | Editar |
| | deleteProviderEmailTemplate(id) | Eliminar |
| | setDefaultProviderEmailTemplate(providerId, templateId) | Marcar predeterminada |
| | createProviderOrderWithItems(data) | Crear pedido con líneas + email |
| | importProviderProducts(providerId, rows) | Importar productos desde CSV/Excel |
| **Componentes** | ProviderTemplatesTab | Contenido tab Plantillas |
| | CreateEditTemplateDialog | Modal crear/editar plantilla |
| | ImportProductsDialog | Modal importar CSV/Excel |
| | NewOrderWithLinesModal | Modal/drawer nuevo pedido con productos |
| **Servicios** | renderOrderEmail(template, vars) | Sustitución variables → subject, body |

---

## 5. Decisiones de UX principales

- **Tab Plantillas** entre Productos y Archivos para flujo: Productos → Plantillas → Nuevo pedido.
- **Nuevo pedido:** modal ancho o drawer con dos zonas (productos | resumen + email); no reemplazar de entrada el registro rápido de pedido sin líneas; desde Resumen/Productos el CTA "Nuevo pedido" abre el flujo con líneas.
- **Readiness:** un solo bloque en Resumen con 3 comprobaciones y CTAs; si falta algo, no mostrar CTA "Nuevo pedido" principal o mostrarlo deshabilitado con tooltip.
- **Email:** solo generación y copiar/abrir en cliente; sin envío automático en MVP.
- **Importación:** flujo en 3 pasos (subir → mapear → previsualizar/importar); plantilla CSV descargable.

---

## 6. Checklist manual de prueba

- [ ] Tab Productos: listar, crear, editar, activar/desactivar; columna categoría; búsqueda por nombre/código.
- [ ] Descargar plantilla CSV; importar CSV con mapeo; comprobar productos creados.
- [ ] Tab Plantillas: listar, crear, editar, eliminar, marcar predeterminada; variables en ayuda; preview.
- [ ] Nuevo pedido: buscar productos, añadir cantidades, ver resumen y total; elegir plantilla; ver preview email; guardar pedido; guardar y abrir email; copiar email.
- [ ] Pedido guardado aparece en Pedidos y pagos con líneas; email guardado en order.
- [ ] Resumen: bloque preparación muestra estados correctos; CTAs llevan a Productos/Plantillas/Correo; "Nuevo pedido" cuando todo listo.
