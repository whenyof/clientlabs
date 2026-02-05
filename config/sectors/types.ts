/**
 * Sector Configuration Types
 * 
 * Define la estructura de configuración para cada sector de negocio.
 * Esto permite que la misma aplicación funcione para diferentes industrias
 * (online, fisioterapia, ferretería, etc.) sin cambiar el código base.
 */

export type SectorId = 'default' | 'online' | 'fisio' | 'retail' | 'services'

/**
 * Mapeo de terminología por sector
 */
export interface SectorTerminology {
    providers: string; // Ej: "Proveedores" o "Suministradores"
    clients: string;    // Ej: "Clientes" o "Pacientes"
    leads: string;      // Ej: "Leads" o "Prospectos"
    orders: string;     // Ej: "Pedidos" o "Sesiones"
}

/**
 * Labels para la UI - Todos los textos visibles configurables por sector
 */
export interface SectorLabels {
    dashboard: {
        title: string
        sections: {
            metrics: string
            analysis: string
            activity: string
            ai: string
        }
        charts: {
            revenue: {
                title: string
                subtitle: string
                series: {
                    income: string
                    target: string
                }
            }
            funnel: {
                title: string
                subtitle: string
                quantityLabel: string
                steps: {
                    visitors: string
                    leads: string
                    opportunities: string
                    sales: string
                }
            }
        }
        /** Labels para KPIs del dashboard (títulos ya vienen de labels.finance, etc.; aquí descripciones y KPI Bots) */
        kpis: {
            incomeDescription: string
            salesDescription: string
            clientsDescription: string
            leadsDescription: string
            tasksDescription: string
            botsTitle: string
            botsDescription: string
        }
        /** Labels para widgets del dashboard (activity feed, quick actions, system status, etc.) */
        widgets: {
            activityFeedTitle: string
            activityClientRegisteredDesc: string
            activitySaleCompletedDesc: string
            activityAutomationRun: string
            activityAutomationRunDesc: string
            activityTaskCompletedDesc: string
            activityMessageSent: string
            activityMessageSentDesc: string
            activitySystemAlert: string
            activitySystemAlertDesc: string
            quickActionsSuffix: string
            quickActionsAvailable: string
            quickActionsCustomize: string
            newInvoice: string
            newInvoiceDesc: string
            newAutomation: string
            newAutomationDesc: string
            viewAnalyticsDesc: string
            createReport: string
            createReportDesc: string
            systemStatusTitle: string
            systemStatusActiveServices: string
            statusOnline: string
            statusWarning: string
            statusOffline: string
            apiServer: string
            database: string
            apiServerDesc: string
            databaseDesc: string
            automationsStatusDesc: string
            integrationsStatusDesc: string
            uptime: string
            insightOpportunityTitle: string
            insightOpportunityMessage: string
            insightClientRiskMessage: string
            insightPatternTitle: string
            insightPatternMessage: string
            insightActionTitle: string
            insightActionMessage: string
        }
    }

    // Navegación
    nav: {
        dashboard: string
        providers: string
        clients: string
        leads: string
        tasks: string
        sales: string
        finance: string
        billing: string
        analytics: string
        integrations: string
        notifications: string
        settings: string
    }

    // Proveedores
    providers: {
        title: string
        singular: string
        plural: string
        newButton: string
        emptyState: string
        // Campos
        fields: {
            name: string
            type: string
            contactEmail: string
            contactPhone: string
            website: string
            monthlyCost: string
            dependencyLevel: string
            status: string
        }
        // Tipos de proveedor
        types: {
            SERVICE: string
            PRODUCT: string
            SOFTWARE: string
            OTHER: string
        }
        // Estados
        status: {
            ACTIVE: string
            PAUSED: string
            BLOCKED: string
            OK: string
            PENDING: string
            ISSUE: string
        }
        // Dependencia
        dependency: {
            LOW: string
            MEDIUM: string
            HIGH: string
            CRITICAL: string
        }
        // Acciones
        actions: {
            newOrder: string
            newTask: string
            addNote: string
            uploadFile: string
            markReceived: string
            markPaid: string
            cancel: string
        }
    }

    // Clientes
    clients: {
        title: string
        singular: string
        plural: string
        newButton: string
        emptyState: string
        status: {
            ACTIVE: string
            FOLLOW_UP: string
            INACTIVE: string
            VIP: string
        }
    }

    // Leads / Prospectos (alineado con Prisma: NEW, CONTACTED, INTERESTED, QUALIFIED, LOST, CONVERTED)
    leads: {
        title: string
        singular: string
        plural: string
        newButton: string
        emptyState: string
        /** Título de la página del panel (ej. "Pipeline de Oportunidades") */
        pageTitle: string
        /** Subtítulo bajo el título (ej. "Identifica, prioriza y convierte...") */
        pageSubtitle: string
        status: {
            NEW: string
            CONTACTED: string
            INTERESTED: string
            QUALIFIED: string
            PROPOSAL?: string
            NEGOTIATION?: string
            CONVERTED: string
            LOST: string
        }
        temperatures: {
            HOT: string
            WARM: string
            COLD: string
        }
        actions: {
            registerCall: string
            registerEmail: string
            registerMeeting: string
            convertToClient: string
        }
        /** Campos visibles en side panel / listado */
        fields: {
            source: string
            created: string
            lastAction: string
            score: string
        }
        /** Textos de UI: empty state, filtros, toasts, diálogos, etc. */
        ui: {
            emptyStateHint: string
            emptyStateImportCsv: string
            emptyStateImportCsvDesc: string
            emptyStateConnectWeb: string
            emptyStateConnectWebDesc: string
            emptyStateAutomate: string
            emptyStateAutomateDesc: string
            filterStatus: string
            filterAll: string
            filterTemperature: string
            filterAllTemps: string
            filterSource: string
            filterSourceAll: string
            searchPlaceholder: string
            sortScoreDesc: string
            sortScoreAsc: string
            sortLastActionDesc: string
            sortLastActionAsc: string
            sortCreatedDesc: string
            sortCreatedAsc: string
            sortTempHotFirst: string
            showingResults: string
            requireAttention: string
            quickActions: string
            addNote: string
            sendEmail: string
            noEmail: string
            convertToClientShort: string
            markLostShort: string
            changeStatus: string
            markAs: string
            deleteLead: string
            viewClient: string
            noteLabel: string
            notePlaceholder: string
            reason: string
            lostReasonPlaceholder: string
            lostDialogTitle: string
            convertDialogTitle: string
            convertIrreversible: string
            convertBullet1: string
            convertBullet2: string
            convertBullet3: string
            confirmConvert: string
                toastNoteSaved: string
                toastErrorNote: string
                toastErrorStatus: string
                toastDeleted: string
                toastErrorDelete: string
                deleteDialogTitle: string
                deleteDialogDescription: string
                deleteDialogConfirm: string
                deleteDialogWarning: string
                deleteButton: string
                deleteButtonLoading: string
                toastMarkedLost: string
            toastConverted: string
            toastConvertedLinked: string
            toastErrorConvert: string
            toastTagAdded: string
            toastTagRemoved: string
            toastTagError: string
            toastReminderAdded: string
            toastReminderError: string
            toastReminderCompleted: string
            toastReminderCompleteError: string
                toastTempChanged: string
                toastTempChangeError: string
            sidebarInfo: string
            sidebarSource: string
            sidebarCreated: string
            sidebarLastAction: string
            sidebarScore: string
            sidebarTags: string
            sidebarAddTag: string
            sidebarAddTagPlaceholder: string
            sidebarTagsHint: string
            sidebarTagsReadOnly: string
            sidebarNotes: string
            sidebarNotesPlaceholder: string
            sidebarSaveNote: string
            sidebarReadOnlyNote: string
            sidebarReminders: string
            sidebarNoReminders: string
            sidebarAddReminder: string
            reminderTypeCall: string
            reminderTypeEmail: string
            reminderTypeFollowUp: string
            reminderTypeCustom: string
            reminderComplete: string
            changeTemperature: string
            selectNewTemperature: string
            closeButton: string
            automationTitle: string
            automationComing: string
            registerCallInNotes: string
            registerFollowUpInNotes: string
            leadConvertedOrLostReadOnly: string
            sidebarNoNotes: string
            sidebarTasks: string
            sidebarAddTask: string
            sidebarNoTasks: string
            sidebarNextReminder: string
            reminderChange: string
            createHowTitle: string
            createManual: string
            createManualDesc: string
            createImport: string
            createImportDesc: string
            createPaste: string
            createPasteDesc: string
            createScraping: string
            createScrapingDesc: string
            badgeComing: string
            daysNever: string
            daysToday: string
            daysYesterday: string
        }
    }

    // Tareas (alineado con Prisma: TaskStatus PENDING|DONE|CANCELLED, TaskPriority LOW|MEDIUM|HIGH, TaskType MANUAL|CALL|EMAIL|MEETING)
    tasks: {
        title: string
        singular: string
        plural: string
        newButton: string
        /** Subtítulo de la página del panel */
        pageSubtitle: string
        status: {
            PENDING: string
            IN_PROGRESS?: string
            DONE: string
            CANCELLED: string
        }
        priorities: {
            LOW: string
            MEDIUM: string
            HIGH: string
            URGENT?: string
        }
        /** Tipos de tarea (TaskType en Prisma) */
        types: {
            MANUAL: string
            CALL: string
            EMAIL: string
            MEETING: string
        }
        /** Vistas de filtro (Hoy, Esta semana, Vencidas, Todas) */
        views: {
            today: string
            week: string
            overdue: string
            all: string
        }
        /** Textos de UI: empty state, filtros, diálogos, toasts, etc. */
        ui: {
            loadingTasks: string
            emptyStateTitle: string
            emptyStateDescription: string
            searchPlaceholder: string
            filterButton: string
            priorityHighBadge: string
            overdueBadge: string
            noDate: string
            edit: string
            delete: string
            deleteDialogTitle: string
            deleteDialogDescription: string
            toastErrorUpdate: string
            dialogTitleNew: string
            dialogTitleEdit: string
            formTitle: string
            formTitlePlaceholder: string
            formPriority: string
            formType: string
            formDueDate: string
            cancel: string
            saveChanges: string
            createTask: string
            toastTitleRequired: string
            toastSaved: string
            toastCreated: string
            toastErrorSave: string
            focusMode: string
            visibleCount: string
            productivitySection: string
        }
    }

    // Ventas / Sales
    sales: {
        title: string
        singular: string
        plural: string
        newButton: string
        pageSubtitle: string
        stats: {
            totalRevenue: string
            growth: string
            avgTicket: string
        }
        kpis: {
            factHoy: string
            factMes: string
            ticketMedio: string
            ratioConversion: string
            hintHoy: string
            hintMes: string
            hintTicket: string
            hintRatio: string
        }
        table: {
            pipelineTitle: string
            registerTitle: string
            client: string
            product: string
            amount: string
            channel: string
            commercial: string
            state: string
            date: string
            origin: string
        }
        status: {
            nueva: string
            seguimiento: string
            negociacion: string
            ganada: string
            perdida: string
        }
        ui: {
            automationTitle: string
            externalInputs: string
            webhooksHint: string
            stateLabel: string
            nextStepsTitle: string
            createSale: string
            manualRegister: string
            saveSale: string
            saleSelected: string
            detail: string
            recentNotes: string
            originLabel: string
            manualOrigin: string
            webhookOrigin: string
            currentState: string
            moveTo: string
        }
    }

    // Finanzas
    finance: {
        title: string
        pageSubtitle: string
        income: string
        expenses: string
        netProfit: string
        burnRate: string
        cashFlow: string
        tabs: {
            overview: string
            transactions: string
            budgets: string
            forecast: string
            goals: string
            alerts: string
            automation: string
        }
    }

    // Billing / Facturación (documentos)
    billing: {
        title: string
        pageSubtitle: string
        newInvoice: string
        searchPlaceholder: string
    }

    // Analytics / Reports
    analytics: {
        title: string
        pageTitle: string
        pageSubtitle: string
        conversionRate: string
        roi: string
        performance: string
    }

    // Notificaciones
    notifications: {
        title: string
        pageSubtitle: string
        markAllRead: string
    }

    // IA Assistant
    aiAssistant: {
        title: string
        subtitle: string
        pageSubtitle: string
        insights: string
        recommendations: string
        predictions: string
        newInsights: string
        precision: string
        lastUpdate: string
        apply: string
        ignore: string
        viewFullAnalysis: string
        tabs: {
            overview: string
            insights: string
            hotLeads: string
            predictions: string
            recommendations: string
            automations: string
            chat: string
            timeline: string
            settings: string
        }
    }

    // Integraciones
    integrations: {
        title: string
        pageSubtitle: string
        connected: string
        available: string
        tabs: {
            overview: string
            logs: string
            workflows: string
            ai: string
        }
    }

    // Automatizaciones
    automations: {
        title: string
        active: string
        pageSubtitle: string
        newButton: string
        ui: {
            searchLabel: string
            searchPlaceholder: string
            categoryLabel: string
            categoryAll: string
            statusLabel: string
            statusAll: string
            statusActive: string
            statusPaused: string
            statusDraft: string
            logs: string
            templates: string
            categorySales: string
            categoryAi: string
            categoryOperations: string
            categoryMarketing: string
        }
    }

    // Ajustes / Settings
    settings: {
        title: string
        pageSubtitle: string
        profile: string
        company: string
        security: string
        billing: string
        notifications: string
        team: string
        permissions: string
        plans: string
        usage: string
        appearance: string
        dangerZone: string
    }

    // Pedidos (Proveedores)
    orders: {
        title: string
        singular: string
        plural: string
        status: {
            PENDING: string
            RECEIVED: string
            COMPLETED: string
            CANCELLED: string
            PAID: string
            DELAYED: string
        }
        types: {
            ONE_TIME: string
            RECURRING: string
            ONE_OFF: string
            MATERIAL: string
            SERVICE: string
            SUBSCRIPTION: string
        }
    }

    // Genéricos
    common: {
        save: string
        cancel: string
        delete: string
        edit: string
        create: string
        loading: string
        error: string
        success: string
        confirm: string
        search: string
        filter: string
        noResults: string
        actions: string
        viewAll: string
        loadMore: string
    }
}

/**
 * Configuración de features por sector
 */
export interface SectorFeatures {
    // Módulos habilitados
    modules: {
        providers: boolean
        clients: boolean
        leads: boolean
        sales: boolean
        finance: boolean
        billing: boolean
        tasks: boolean
        automations: boolean
        aiInsights: boolean
        analytics: boolean
        integrations: boolean
        notifications: boolean
    }

    // Features específicas de providers
    providers: {
        showOrders: boolean
        showPayments: boolean
        showTimeline: boolean
        showFiles: boolean
        showServices: boolean
        showEconomicImpact: boolean
        showStockRisk: boolean
        allowAutoPayment: boolean
    }
}

/**
 * Configuración completa del sector
 */
export interface SectorConfig {
    id: SectorId
    name: string
    description: string
    labels: SectorLabels
    features: SectorFeatures

    // Contratos de Panel por Entidad
    // Esto sobreescribe el comportamiento por defecto del core para este sector
    contracts?: {
        providers?: {
            allowedStatuses?: string[]
            allowedActions?: string[] // IDs de acciones permitidas
            terminology?: string
        }
        clients?: {
            allowedStatuses?: string[]
            allowedActions?: string[]
            terminology?: string
        }
        leads?: {
            allowedStatuses?: string[]
            allowedActions?: string[]
            terminology?: string
        }
        tasks?: {
            allowedStatuses?: string[]
            allowedActions?: string[]
            terminology?: string
        }
    }

    // Flujos de trabajo predeterminados
    flows?: {
        autoCreatePaymentOnOrder?: boolean
        requireNoteOnStatusChange?: boolean
        defaultTaskPriority?: 'LOW' | 'MEDIUM' | 'HIGH'
    }

    // Rutas base (para compatibilidad)
    routes: {
        base: string // '/dashboard' o '/dashboard/other'
        providers: string
        clients: string
        leads: string
    }

    /** Orden/visibilidad de KPIs en el dashboard (opcional). Si no se define, se usa orden por defecto. */
    dashboard?: {
        /** Orden de IDs de KPI: 'income' | 'sales' | 'clients' | 'leads' | 'tasks' | 'bots'. Omisión = orden actual. */
        kpiOrder?: Array<'income' | 'sales' | 'clients' | 'leads' | 'tasks' | 'bots'>
    }

    // Tema (futuro)
    theme?: {
        primaryColor?: string
        accentColor?: string
    }
}

/**
 * Partial config para overrides
 */
export type PartialSectorConfig = Partial<SectorConfig> & { id: SectorId }
