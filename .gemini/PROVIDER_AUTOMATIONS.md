# AUTOMATIZACIONES DE PROVEEDORES - IMPLEMENTACIÓN COMPLETA ✅

## 🎯 OBJETIVO CUMPLIDO

Se han implementado **automatizaciones simples y visibles** para proveedores, basadas en **reglas claras** sin IA.

---

## ✅ AUTOMATIZACIONES IMPLEMENTADAS

### **1️⃣ ALERTAS DE GASTO**

#### **Límite de Presupuesto Mensual**
**Configuración:**
- Campo: `monthlyBudgetLimit` (Float, opcional)
- Configurable por proveedor
- Visible en panel lateral

**Alertas generadas:**
- **BUDGET_WARNING** (MEDIUM): Al 80% del límite
  - Mensaje: "Presupuesto al 80%"
  - Details: "Gastado: X€ de Y€"
  
- **BUDGET_EXCEEDED** (HIGH): Al 100% o más
  - Mensaje: "Presupuesto excedido (X%)"
  - Details: "Gastado: X€ de Y€"

**Cálculo:**
```typescript
const currentMonthSpending = sum(payments where month = current)
const budgetUsage = (currentMonthSpending / monthlyBudgetLimit) * 100

if (budgetUsage >= 100) → BUDGET_EXCEEDED (HIGH)
else if (budgetUsage >= 80) → BUDGET_WARNING (MEDIUM)
```

#### **Comparativa con Mes Anterior**
**Cálculo automático:**
```typescript
const currentMonth = sum(payments where month = current)
const previousMonth = sum(payments where month = previous)
const increasePercentage = ((current - previous) / previous) * 100
```

**Alerta generada:**
- **UNUSUAL_SPENDING** (MEDIUM): Si aumento >= 50%
  - Mensaje: "Gasto inusual (+X% vs mes anterior)"
  - Details: "Mes actual: X€ | Mes anterior: Y€"

**Regla clara:**
- Solo se compara con mes inmediatamente anterior
- Solo si ambos meses tienen gastos > 0
- Umbral fijo: 50% de aumento

---

### **2️⃣ RECORDATORIOS DE PEDIDO**

#### **Configuración Manual**
**Campos:**
- `reminderInterval` (Int, opcional): Días entre recordatorios
- `lastReminderDate` (DateTime, opcional): Última vez que se mostró

**Configuración:**
- Usuario define intervalo en días (ej: 30, 60, 90)
- Se resetea `lastReminderDate` al configurar
- Null = sin recordatorios

**Alerta generada:**
- **REMINDER_DUE** (LOW): Cuando `daysSince >= interval`
  - Mensaje: "Recordatorio de pedido"
  - Details: "Configurado cada X días"

**Cálculo:**
```typescript
const daysSinceLastReminder = differenceInDays(now, lastReminderDate)

if (daysSinceLastReminder >= reminderInterval) → REMINDER_DUE (LOW)
```

**Acción del usuario:**
- Botón "Confirmar recordatorio" → actualiza `lastReminderDate`
- Reinicia el contador

---

### **3️⃣ FLAG "PROVEEDOR CRÍTICO"**

#### **Toggle Manual**
**Campo:**
- `isCritical` (Boolean, default: false)
- Toggle visible en panel lateral
- Acción inmediata

**Efectos:**
- **CRITICAL_PROVIDER** (HIGH): Siempre que `isCritical = true`
  - Mensaje: "Proveedor marcado como crítico"
  - Details: "Requiere atención prioritaria"

**Prioridad:**
- Esta alerta siempre aparece primera
- Siempre genera estado "CRÍTICO"
- Sobrescribe otras alertas en importancia visual

**Uso:**
- Proveedores esenciales para el negocio
- Proveedores con historial de problemas
- Proveedores que requieren seguimiento especial

---

### **4️⃣ ESTADOS AUTOMÁTICOS**

#### **Cálculo Basado en Alertas**
```typescript
function calculateAutomaticStatus(alerts) {
  if (alerts.some(a => a.type === "CRITICAL_PROVIDER")) {
    return "CRÍTICO"
  }
  
  if (alerts.some(a => a.severity === "HIGH")) {
    return "CRÍTICO"
  }
  
  if (alerts.some(a => a.severity === "MEDIUM")) {
    return "ATENCIÓN"
  }
  
  return "NORMAL"
}
```

#### **Estados Posibles:**

**NORMAL:**
- Sin alertas o solo alertas LOW
- Color: Verde
- Badge: "✓ Todo OK"

**ATENCIÓN:**
- Al menos una alerta MEDIUM
- Color: Ámbar
- Badge: "Requiere Atención"
- Ejemplos:
  - Presupuesto al 80%
  - Gasto inusual
  - Tareas vencidas (no prioritarias)

**CRÍTICO:**
- Al menos una alerta HIGH o flag crítico
- Color: Rojo
- Badge: "Estado Crítico"
- Ejemplos:
  - Proveedor marcado como crítico
  - Presupuesto excedido
  - Tareas prioritarias vencidas

---

### **5️⃣ ALERTAS ADICIONALES**

#### **Tareas Vencidas**
**Cálculo:**
```typescript
const overdueTasks = tasks.filter(t => 
  t.status === "PENDING" && 
  t.dueDate < now
)

const highPriorityOverdue = overdueTasks.filter(t => 
  t.priority === "HIGH"
)
```

**Alertas generadas:**
- **OVERDUE_TASK** (HIGH): Si hay tareas HIGH vencidas
  - Mensaje: "X tarea(s) prioritaria(s) vencida(s)"
  - Details: Título de la primera tarea
  
- **OVERDUE_TASK** (MEDIUM): Si hay tareas vencidas (no HIGH)
  - Mensaje: "X tarea(s) vencida(s)"
  - Details: Título de la primera tarea

---

## 🎨 VISUALIZACIÓN DE ALERTAS

### **En Panel Lateral**

#### **Banner de Estado Automático**
```
┌─────────────────────────────────────────┐
│ ⚠️ Estado Crítico                       │
│ 3 alertas activas                       │
└─────────────────────────────────────────┘
```

#### **Lista de Alertas**
```
┌─────────────────────────────────────────┐
│ Alertas Activas                         │
│                                         │
│ 🚩 Proveedor marcado como crítico      │
│    Requiere atención prioritaria  [HIGH]│
│                                         │
│ 💰 Presupuesto excedido (105%)         │
│    Gastado: 5,250€ de 5,000€     [HIGH]│
│                                         │
│ 🔔 Recordatorio de pedido              │
│    Configurado cada 30 días       [LOW]│
└─────────────────────────────────────────┘
```

### **En Tabla de Proveedores**

#### **Badge de Estado**
- **CRÍTICO**: Badge rojo con icono ⚠️
- **ATENCIÓN**: Badge ámbar con icono ⚡
- **NORMAL**: Badge verde (o sin badge)

#### **Indicador de Alertas**
- Número de alertas activas
- Color según severidad máxima

---

## 📊 KPIs BÁSICOS

### **Contadores Simples**

**En Dashboard:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Proveedores     │ Críticos        │ Con Alertas     │
│ Críticos        │                 │                 │
│ 3               │ 12              │ 8               │
└─────────────────┴─────────────────┴─────────────────┘
```

**Cálculo:**
```typescript
const criticalProviders = providers.filter(p => p.isCritical).length
const providersWithAlerts = providers.filter(p => 
  getProviderAlerts(p.id).length > 0
).length
```

---

## 🔧 CONFIGURACIÓN

### **Panel de Automatizaciones**

**Tab "Automatizaciones" en Panel Lateral:**

```
┌─────────────────────────────────────────┐
│ Configuración de Automatizaciones       │
│                                         │
│ 🚩 Proveedor Crítico          [Toggle] │
│    Marca este proveedor como crítico   │
│                                         │
│ 💰 Límite de Presupuesto Mensual       │
│    [5000€]                   [Guardar] │
│    Alerta al 80% (4000€) y al 100%     │
│                                         │
│ 🔔 Recordatorio de Pedido              │
│    [30] días                 [Guardar] │
│    Próximo recordatorio en 30 días     │
└─────────────────────────────────────────┘
```

**Acciones:**
- Toggle crítico: Inmediato
- Presupuesto: Click "Guardar"
- Recordatorio: Click "Guardar"
- Feedback: Toast de confirmación

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
prisma/
└── schema.prisma  ✅ MODIFICADO
    - isCritical: Boolean
    - monthlyBudgetLimit: Float?
    - reminderInterval: Int?
    - lastReminderDate: DateTime?

lib/
└── provider-automations.ts  ✅ NUEVO
    - getProviderAlerts()
    - calculateProviderAutomaticStatus()
    - getSpendingComparison()
    - acknowledgeReminder()
    - toggleCriticalFlag()
    - updateBudgetLimit()
    - updateReminderInterval()

app/dashboard/providers/
└── actions.ts  ✅ MODIFICADO
    - toggleProviderCritical()
    - updateProviderBudget()
    - updateProviderReminder()
    - acknowledgeProviderReminder()
    - getProviderAlertsAction()

app/dashboard/other/providers/components/
├── ProviderAlerts.tsx  ✅ NUEVO
│   - Componente visual de alertas
│   - Banner de estado automático
│   - Lista de alertas con iconos
│
└── ProviderAutomationSettings.tsx  ✅ NUEVO
    - Configuración de automatizaciones
    - Toggle crítico
    - Input presupuesto
    - Input recordatorio
```

---

## 🎯 REGLAS CLARAS (NO IA)

### **Todas las Alertas son Deterministas:**

1. **Presupuesto:**
   - `>= 80%` → WARNING
   - `>= 100%` → EXCEEDED
   - Cálculo: suma de pagos del mes actual

2. **Gasto Inusual:**
   - `>= 50% aumento` vs mes anterior
   - Solo si ambos meses > 0
   - Cálculo: `(actual - anterior) / anterior * 100`

3. **Recordatorio:**
   - `días desde último >= intervalo` → REMINDER_DUE
   - Cálculo: `differenceInDays(now, lastReminderDate)`

4. **Tareas Vencidas:**
   - `dueDate < now && status === PENDING`
   - HIGH priority → HIGH severity
   - Otras → MEDIUM severity

5. **Crítico:**
   - `isCritical === true` → CRITICAL_PROVIDER (HIGH)
   - Siempre genera estado CRÍTICO

### **Estado Automático:**
```
if (CRITICAL_PROVIDER exists) → CRÍTICO
else if (any HIGH severity) → CRÍTICO
else if (any MEDIUM severity) → ATENCIÓN
else → NORMAL
```

**NO HAY:**
- ❌ Machine learning
- ❌ Predicciones
- ❌ Análisis de patrones complejos
- ❌ Lógica oculta
- ❌ Umbrales dinámicos

**TODO ES:**
- ✅ Configurable
- ✅ Visible
- ✅ Predecible
- ✅ Transparente

---

## ✅ RESTRICCIONES CUMPLIDAS

- [x] **NO IA** (solo reglas claras)
- [x] **NO notificaciones externas** (solo en panel)
- [x] **NO tareas globales** (solo por proveedor)
- [x] **NO cambios de routing** (todo en panel lateral)
- [x] **NO lógica opaca** (todo documentado y visible)

---

## 🚀 RESULTADO FINAL

**Sistema de Proveedores que:**

✅ **Avisa** - Alertas claras y visibles  
✅ **Prioriza** - Estado automático (NORMAL/ATENCIÓN/CRÍTICO)  
✅ **Ahorra tiempo** - Automatizaciones configurables  
✅ **No confunde** - Reglas simples y transparentes  

**Características:**

⭐ **5 tipos de alertas** (presupuesto, gasto inusual, recordatorio, tareas, crítico)  
⭐ **3 niveles de severidad** (LOW, MEDIUM, HIGH)  
⭐ **3 estados automáticos** (NORMAL, ATENCIÓN, CRÍTICO)  
⭐ **Configuración manual** (toggle, inputs, botones)  
⭐ **Feedback inmediato** (toasts, actualizaciones)  

---

## 📊 EJEMPLO DE USO

### **Caso: Proveedor AWS**

**Configuración:**
- `isCritical`: true
- `monthlyBudgetLimit`: 5000€
- `reminderInterval`: 30 días

**Mes actual:**
- Gastado: 5,250€
- Mes anterior: 3,500€

**Alertas generadas:**
1. **CRITICAL_PROVIDER** (HIGH)
   - "Proveedor marcado como crítico"

2. **BUDGET_EXCEEDED** (HIGH)
   - "Presupuesto excedido (105%)"
   - "Gastado: 5,250€ de 5,000€"

3. **UNUSUAL_SPENDING** (MEDIUM)
   - "Gasto inusual (+50% vs mes anterior)"
   - "Mes actual: 5,250€ | Mes anterior: 3,500€"

**Estado automático:** **CRÍTICO** (tiene alertas HIGH)

**Visualización:**
```
┌─────────────────────────────────────────┐
│ ⚠️ Estado Crítico                       │
│ 3 alertas activas                       │
└─────────────────────────────────────────┘

🚩 Proveedor marcado como crítico    [HIGH]
💰 Presupuesto excedido (105%)       [HIGH]
📊 Gasto inusual (+50% vs anterior) [MEDIUM]
```

---

## ✅ ESTADO ACTUAL

**IMPLEMENTACIÓN COMPLETA** ✅

✅ Schema actualizado  
✅ Lógica de automatizaciones  
✅ Server actions  
✅ Componentes visuales  
✅ Configuración en panel  
✅ Alertas visibles  
✅ Estados automáticos  
✅ KPIs básicos  

**LISTO PARA USAR** 🚀
