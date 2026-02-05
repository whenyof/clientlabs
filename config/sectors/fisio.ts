import { SectorConfig } from "./types";
import { defaultSectorConfig } from "./default";

export const fisioSectorConfig: SectorConfig = {
    ...defaultSectorConfig,
    id: 'fisio',
    name: 'Fisioterapia y Bienestar',
    description: 'Gestión de clínicas, pacientes y sesiones de tratamiento.',

    // Terminología personalizada
    labels: {
        ...defaultSectorConfig.labels,
        nav: {
            ...defaultSectorConfig.labels.nav,
            providers: 'Proveedores',
            clients: 'Pacientes',
            sales: 'Sesiones',
        },
        providers: {
            ...defaultSectorConfig.labels.providers,
            title: 'Suministradores',
            singular: 'Suministrador',
            plural: 'Suministradores',
        },
        clients: {
            ...defaultSectorConfig.labels.clients,
            title: 'Pacientes',
            singular: 'Paciente',
            plural: 'Pacientes',
            newButton: 'Nuevo Paciente',
        },
        orders: {
            ...defaultSectorConfig.labels.orders,
            title: 'Sesiones y Bonos',
            singular: 'Sesión',
            plural: 'Sesiones',
        }
    },

    // Contratos específicos
    contracts: {
        providers: {
            allowedStatuses: ['ACTIVE', 'PAUSED', 'BLOCKED'],
            allowedActions: ['new-order', 'add-note', 'upload-file'],
            terminology: 'Suministrador'
        },
        clients: {
            allowedStatuses: ['ACTIVE', 'FOLLOW_UP', 'INACTIVE'],
            allowedActions: ['new-sale', 'new-task', 'new-call', 'new-reminder'],
            terminology: 'Paciente'
        }
    },

    // Flujos específicos
    flows: {
        autoCreatePaymentOnOrder: false, // En fisio los pedidos a proveedores suelen ser facturados después
        requireNoteOnStatusChange: true,
        defaultTaskPriority: 'MEDIUM'
    },

    features: {
        ...defaultSectorConfig.features,
        providers: {
            ...defaultSectorConfig.features.providers,
            showStockRisk: true, // Importante para material de clínica
            allowAutoPayment: false
        }
    }
};
