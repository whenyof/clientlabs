import type { MemberPermissions } from "@prisma/client"

type PermissionValues = Omit<MemberPermissions, "id" | "memberId" | "updatedAt">

export const DEFAULT_PERMISSIONS: Record<string, PermissionValues> = {
  OWNER: {
    createInvoices: true,  editInvoices: true,  deleteInvoices: true,  issueInvoices: true,  viewInvoices: true,
    createDocuments: true, editDocuments: true, deleteDocuments: true,
    createClients: true,   editClients: true,   deleteClients: true,   viewAllClients: true,
    viewLeads: true,       editLeads: true,     deleteLeads: true,
    viewReports: true,     exportData: true,
    createAutomations: true, editAutomations: true, deleteAutomations: true,
    inviteMembers: true,   manageMembers: true, manageSettings: true,  manageBilling: true,
  },
  ADMIN: {
    createInvoices: true,  editInvoices: true,  deleteInvoices: true,  issueInvoices: true,  viewInvoices: true,
    createDocuments: true, editDocuments: true, deleteDocuments: true,
    createClients: true,   editClients: true,   deleteClients: true,   viewAllClients: true,
    viewLeads: true,       editLeads: true,     deleteLeads: true,
    viewReports: true,     exportData: true,
    createAutomations: true, editAutomations: true, deleteAutomations: true,
    inviteMembers: false,  manageMembers: false, manageSettings: true, manageBilling: false,
  },
  MANAGER: {
    createInvoices: true,  editInvoices: true,  deleteInvoices: false, issueInvoices: true,  viewInvoices: true,
    createDocuments: true, editDocuments: true, deleteDocuments: false,
    createClients: true,   editClients: true,   deleteClients: true,   viewAllClients: true,
    viewLeads: true,       editLeads: true,     deleteLeads: true,
    viewReports: true,     exportData: true,
    createAutomations: true, editAutomations: true, deleteAutomations: false,
    inviteMembers: false,  manageMembers: false, manageSettings: false, manageBilling: false,
  },
  SALES: {
    createInvoices: false, editInvoices: false, deleteInvoices: false, issueInvoices: false, viewInvoices: false,
    createDocuments: false, editDocuments: false, deleteDocuments: false,
    createClients: true,   editClients: true,   deleteClients: false,  viewAllClients: true,
    viewLeads: true,       editLeads: true,     deleteLeads: true,
    viewReports: false,    exportData: false,
    createAutomations: false, editAutomations: false, deleteAutomations: false,
    inviteMembers: false,  manageMembers: false, manageSettings: false, manageBilling: false,
  },
  MEMBER: {
    createInvoices: true,  editInvoices: true,  deleteInvoices: false, issueInvoices: false, viewInvoices: true,
    createDocuments: true, editDocuments: false, deleteDocuments: false,
    createClients: true,   editClients: true,   deleteClients: false,  viewAllClients: true,
    viewLeads: true,       editLeads: false,    deleteLeads: false,
    viewReports: true,     exportData: false,
    createAutomations: false, editAutomations: false, deleteAutomations: false,
    inviteMembers: false,  manageMembers: false, manageSettings: false, manageBilling: false,
  },
  VIEWER: {
    createInvoices: false, editInvoices: false, deleteInvoices: false, issueInvoices: false, viewInvoices: true,
    createDocuments: false, editDocuments: false, deleteDocuments: false,
    createClients: false,  editClients: false,  deleteClients: false,  viewAllClients: true,
    viewLeads: true,       editLeads: false,    deleteLeads: false,
    viewReports: true,     exportData: false,
    createAutomations: false, editAutomations: false, deleteAutomations: false,
    inviteMembers: false,  manageMembers: false, manageSettings: false, manageBilling: false,
  },
}

export const ROLE_META: Record<string, {
  label: string
  description: string
  color: string
  badgeClass: string
}> = {
  OWNER: {
    label: "Propietario",
    description: "Acceso total e irrevocable.",
    color: "#d97706",
    badgeClass: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  },
  ADMIN: {
    label: "Administrador",
    description: "Acceso total. Gestiona equipo y ajustes.",
    color: "#dc2626",
    badgeClass: "bg-red-50 text-red-700 border border-red-200",
  },
  MANAGER: {
    label: "Gestor",
    description: "Gestiona leads, clientes, facturas y proveedores.",
    color: "#2563eb",
    badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  SALES: {
    label: "Ventas",
    description: "Solo leads y clientes. Sin acceso a facturas.",
    color: "#16a34a",
    badgeClass: "bg-green-50 text-green-700 border border-green-200",
  },
  MEMBER: {
    label: "Miembro",
    description: "Acceso básico de colaborador.",
    color: "#4b5563",
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  VIEWER: {
    label: "Visor",
    description: "Solo lectura. No puede crear ni editar.",
    color: "#7c3aed",
    badgeClass: "bg-purple-50 text-purple-700 border border-purple-200",
  },
}
