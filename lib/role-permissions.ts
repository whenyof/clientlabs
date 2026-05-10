import type { MemberPermissions } from "@prisma/client"

type PermissionValues = Omit<MemberPermissions, "id" | "memberId" | "updatedAt">

export const DEFAULT_PERMISSIONS: Record<"OWNER" | "ADMIN" | "MEMBER", PermissionValues> = {
  OWNER: {
    createInvoices: true, editInvoices: true, deleteInvoices: true, issueInvoices: true, viewInvoices: true,
    createDocuments: true, editDocuments: true, deleteDocuments: true,
    createClients: true, editClients: true, deleteClients: true, viewAllClients: true,
    viewLeads: true, editLeads: true, deleteLeads: true,
    viewReports: true, exportData: true,
    createAutomations: true, editAutomations: true, deleteAutomations: true,
    inviteMembers: true, manageMembers: true, manageSettings: true, manageBilling: true,
  },
  ADMIN: {
    createInvoices: true, editInvoices: true, deleteInvoices: true, issueInvoices: true, viewInvoices: true,
    createDocuments: true, editDocuments: true, deleteDocuments: true,
    createClients: true, editClients: true, deleteClients: true, viewAllClients: true,
    viewLeads: true, editLeads: true, deleteLeads: true,
    viewReports: true, exportData: true,
    createAutomations: true, editAutomations: true, deleteAutomations: true,
    inviteMembers: false, manageMembers: false, manageSettings: true, manageBilling: false,
  },
  MEMBER: {
    createInvoices: true, editInvoices: true, deleteInvoices: false, issueInvoices: false, viewInvoices: true,
    createDocuments: true, editDocuments: false, deleteDocuments: false,
    createClients: true, editClients: true, deleteClients: false, viewAllClients: true,
    viewLeads: true, editLeads: false, deleteLeads: false,
    viewReports: true, exportData: false,
    createAutomations: false, editAutomations: false, deleteAutomations: false,
    inviteMembers: false, manageMembers: false, manageSettings: false, manageBilling: false,
  },
}
