# Provider360 – Arquitectura de componentes

## 1. Árbol de archivos (estructura actual)

```
modules/providers/
├── actions.ts                          # Re-export central de acciones (app/dashboard/providers/actions)
├── actions/
│   ├── products/index.ts              # list, create, update, import (re-export o wrapper)
│   ├── templates/index.ts             # list, create, update, delete, setDefault
│   └── orders/index.ts                # list, create, update status
├── components/
│   ├── ProviderSidePanel.tsx          # Orquestador: layout, tabs, estado y diálogos
│   ├── Provider360View.tsx            # Vista página detalle (ruta /dashboard/providers/[id])
│   ├── tabs/
│   │   ├── index.ts                   # Export de todas las tabs
│   │   ├── ProviderSummaryTab.tsx     # Resumen (readiness, centro operativo, sugerencia, etc.)
│   │   ├── ProviderOrdersTab.tsx     # Pedidos y pagos
│   │   ├── ProviderProductsTab.tsx   # Catálogo de productos
│   │   ├── ProviderTemplatesTab.tsx  # Plantillas de correo
│   │   ├── ProviderFilesTab.tsx      # Archivos
│   │   ├── ProviderTasksTab.tsx      # Tareas
│   │   └── ProviderTimelineTab.tsx   # Timeline
│   ├── summary/
│   │   ├── ProviderReadinessCard.tsx
│   │   ├── ProviderOperationalCenterCard.tsx
│   │   ├── ProviderSuggestionCard.tsx
│   │   ├── ProviderQuickActionsCard.tsx
│   │   ├── ProviderContactCard.tsx
│   │   ├── ProviderRiskCard.tsx
│   │   └── ProviderRecentActivityCard.tsx
│   ├── products/
│   │   ├── ProviderProductsHeader.tsx
│   │   ├── ProviderProductsTable.tsx
│   │   ├── ProviderProductRowActions.tsx
│   │   └── ProviderProductsEmptyState.tsx
│   ├── templates/
│   │   ├── ProviderTemplateCard.tsx
│   │   └── ProviderTemplatesEmptyState.tsx
│   ├── CreateProviderProductDialog.tsx / EditProviderProductDialog.tsx
│   ├── ImportProductsDialog.tsx
│   ├── CreateEditTemplateDialog.tsx
│   ├── NewProviderOrderModal.tsx
│   ├── RegisterOrderDialog.tsx
│   ├── AddNoteDialog.tsx, CreateTaskDialog.tsx, FileUploadDialog.tsx, FilePreviewModal.tsx
│   └── ...
├── lib/
│   ├── provider-products-import.ts
│   ├── provider-products-columns.ts
│   ├── provider-products-validation.ts
│   ├── provider-template-variables.ts
│   ├── render-provider-template.ts
│   ├── provider-order-calculations.ts
│   └── build-provider-order-email.ts
├── types/
│   ├── index.ts
│   ├── provider-product.ts
│   ├── provider-template.ts
│   └── provider-order.ts
└── services/
    └── renderOrderEmail.ts
```

## 2. Responsabilidad de cada componente

| Componente | Responsabilidad |
|------------|-----------------|
| **ProviderSidePanel** | Orquestador: estado (orders, products, templates, tasks, timeline, files), carga de datos, barra de tabs, render condicional de cada tab y de los diálogos (orden, tarea, nota, producto, plantilla, import, archivo). No contiene UI inline de cada sección. |
| **ProviderSummaryTab** | Recibe props (readiness, centro operativo, sugerencia, alertas, acciones rápidas, contacto, riesgo, actividad, notas) y compone las cards del resumen. |
| **ProviderOrdersTab** | Lista de pedidos, expansión, acciones por estado (marcar recibido, cancelar, registrar pago), archivos por pedido. |
| **ProviderProductsTab** | Header (búsqueda, añadir, importar, descargar plantilla), tabla de productos o empty state, callbacks editar/activar-desactivar. |
| **ProviderTemplatesTab** | Lista de plantillas, empty state, acciones por plantilla (predeterminada, editar, eliminar). |
| **ProviderFilesTab** | Agrupación de archivos (pedidos, pagos, generales), subida y vista previa. |
| **ProviderTasksTab** | Lista de tareas con toggle estado. |
| **ProviderTimelineTab** | Lista de eventos del timeline. |
| **ProviderReadinessCard** | Bloque “Preparación para pedidos”: checks (email, catálogo, plantilla) y CTAs. |
| **ProviderOperationalCenterCard** | Métricas operativas y gráfico de compras 6 meses. |
| **ProviderProductsHeader** | Título, búsqueda, botones Añadir / Importar / Descargar plantilla. |
| **ProviderProductsTable** | Tabla productos con columnas y acciones por fila. |
| **ProviderTemplateCard** | Una fila de plantilla (nombre, asunto, predeterminada, editar, eliminar). |

## 3. Partes movidas fuera de ProviderSidePanel

- **Resumen**: Todo el contenido del tab Resumen está en `ProviderSummaryTab` y en las cards de `summary/` (Readiness, OperationalCenter, Suggestion, QuickActions, Contact, Risk, RecentActivity). El panel solo calcula `summaryData` (alertas, chart, sugerencia, etc.) y lo pasa por props.
- **Pedidos**: La lista y detalle de pedidos están en `ProviderOrdersTab`; el panel solo pasa `orders`, `expandedOrderId`, `formatCurrency`, labels y callbacks (onNewOrder, onExpandOrder, onMarkReceived, onCancelOrder, onRegisterPayment, onUploadInvoice, onPreviewFile, onDeleteFile).
- **Productos**: Header, tabla y empty state están en `ProviderProductsTab` y en `products/`; el panel pasa `products`, `searchTerm`, `onSearchChange`, y callbacks (onAddProduct, onImport, onDownloadTemplate, onEdit, onToggleActive).
- **Plantillas**: Lista y empty state están en `ProviderTemplatesTab` y `ProviderTemplateCard` / `ProviderTemplatesEmptyState`; el panel pasa `templates`, `loadingTemplates`, y callbacks (onCreateTemplate, onSetDefault, onEdit, onDelete).
- **Files / Tasks / Timeline**: Cada tab tiene su componente en `tabs/`; el panel solo pasa datos y callbacks.

## 4. Navegación de tabs

Orden en la barra de tabs (cuando `embeddedInPage`):

1. Resumen  
2. Pedidos y Pagos  
3. Productos  
4. Plantillas  
5. Archivos  
6. Tareas  
7. Timeline  

Cada tab se renderiza con `{activeTab === "summary" && <ProviderSummaryTab ... />}`, etc. El estado `activeTab` es `"summary" | "orders" | "productos" | "plantillas" | "files" | "tasks" | "timeline"`. La tab “Plantillas” está integrada y usa `ProviderTemplatesTab`.

## 5. Placeholders / siguiente fase

- **Productos**: `ProviderProductForm` unificado (crear/editar), `AddProviderProductDialog` / `EditProviderProductDialog` bajo `products/`, `ImportProviderProductsMappingStep` y `ImportProviderProductsPreviewStep` para flujo de importación con mapeo.
- **Plantillas**: `ProviderTemplateEditor`, `ProviderTemplateVariablesHelp`, `CreateProviderTemplateDialog`, `EditProviderTemplateDialog`, `PreviewProviderTemplateDialog` como componentes específicos bajo `templates/`.
- **Pedidos**: Componentes bajo `orders/`: `CreateProviderOrderDialog`, `ProviderOrderProductPicker`, `ProviderOrderSummary`, `ProviderOrderEmailPreview`, `ProviderOrdersList`, `ProviderOrderCard`, `ProviderOrderDetailsSheet`, etc., para descomponer `NewProviderOrderModal` y la lista de pedidos.
- **Resumen**: Las cards ya existen; opcional refinar contenido o añadir más bloques sin tocar el orquestador.

## 6. Checklist manual (Provider360 tras reorganización)

- [ ] Abrir `/dashboard/providers` y hacer clic en un proveedor → se abre la página detalle (o panel según contexto).
- [ ] **Resumen**: Se ven readiness, centro operativo, sugerencia, acciones rápidas, contacto, riesgo, actividad reciente; CTAs (Nuevo pedido, Añadir correo, Importar productos, Crear plantilla) según estado.
- [ ] **Pedidos y Pagos**: Lista de pedidos, expandir fila, marcar recibido, cancelar, registrar pago, subir factura/archivo, vista previa y eliminar archivo.
- [ ] **Productos**: Búsqueda, Añadir producto, Importar Excel/CSV, Descargar plantilla; tabla con Editar y Activar/Desactivar; empty state cuando no hay productos.
- [ ] **Plantillas**: Lista de plantillas, Nueva plantilla, Predeterminada / Editar / Eliminar por plantilla; empty state cuando no hay plantillas.
- [ ] **Archivos**: Secciones facturas / pedidos / generales; subir y previsualizar archivos.
- [ ] **Tareas**: Lista de tareas y cambio de estado.
- [ ] **Timeline**: Eventos ordenados por fecha.
- [ ] Diálogos: Nuevo pedido (modal con líneas y email), Registrar pedido rápido, Nueva tarea, Añadir nota, Añadir producto, Editar producto, Importar productos, Nueva/Editar plantilla, Subir archivo, Registro de pago.
- [ ] Header: “Nuevo pedido” y “Nueva tarea” funcionan; en página detalle, “Volver al listado” lleva a `/dashboard/providers`.
