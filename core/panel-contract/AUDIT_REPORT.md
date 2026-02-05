# Auditoría de Arquitectura - Dashboard Core

## 1. Estado Actual de los Paneles

| Entidad | Componente Panel | Sistema de Estados | Fuente de Timeline | Relaciones Clave |
| :--- | :--- | :--- | :--- | :--- |
| **Provider** | `ProviderSidePanel` | Enum `ProviderStatus` | `ProviderTimelineEvent` | Pedidos, Pagos, Tareas |
| **Client** | `ClientSidePanel` | String (Normalizado) | `getClientTimeline` (Custom) | Ventas, Tareas, Notas |
| **Lead** | `LeadSidePanel` | Enum `LeadStatus` | Fragmentado (Notes, Activities) | Tareas, Recordatorios |
| **Sale** | `SaleSidePanel` | String (`status`) | N/A (Eventos en Client) | Cliente |

## 2. Inconsistencias Detectadas

### 🔴 Timeline Fragmentado
No existe una interfaz común para el historial. Mientras que **Providers** tiene una tabla dedicada en DB (`ProviderTimelineEvent`), **Clientes** usa un agregador en la acción de servidor y **Leads** depende mayoritariamente de un campo de texto `notes` y una tabla de `activities`.

### 🟡 Gestión de Estados Inconsistente
- **Providers**: Usa enums estrictos.
- **Leads**: Mezcla `status` (string), `leadStatus` (enum) y `temperature` (enum).
- **Clientes**: Usa lógica derivada (`deriveClientStatus`) basada en tareas pendientes, lo cual es potente pero difícil de unificar sin un contrato.

### 🟡 Acciones Redundantes
Se repite lógica de "Añadir Nota", "Crear Tarea" y "Cambiar Estado" en los tres grandes módulos con ligeras variaciones en el manejo de UI/Toasts.

## 3. Contratos No Cumplidos (GAP Analysis)

1. **PanelContract**: Ningún panel expone su configuración de forma declarativa. La lógica de qué botones mostrar está "hardcodeada" en el JSX de cada SidePanel.
2. **TimelineContract**: Los eventos de Clientes y Leads no incluyen metadatos estandarizados (IP, UserAgent, Severity) que sí podrían soportarse en el nuevo contrato.
3. **StateMachine**: Las transiciones permitidas (ej: de NEW a CONVERTED en Leads) están validadas en las acciones de servidor, pero no son visibles para la UI de forma sistemática.

## 4. Próximos Pasos Recomendados (Roadmap)

1. **Migración del Timeline**: Crear un `UniversalTimeline` que pueda leer tanto del contrato nuevo como de las fuentes legacy.
2. **Estandarización de Acciones**: Crear hooks `usePanelActions` que consuman el contrato para reducir boilerplate.
3. **Validación de Estados**: Implementar la `StateMachine` en las acciones de servidor para asegurar integridad persistente.
