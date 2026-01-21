export interface Invoice {
  id: string
  number: string
  client: {
    name: string
    nif: string
    address: string
    email: string
  }
  company: {
    name: string
    nif: string
    address: string
  }
  date: string
  dueDate: string
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  haciendaStatus: 'pending' | 'sent' | 'accepted' | 'rejected'
  origin: 'manual' | 'automatic'
  lines: InvoiceLine[]
  subtotal: number
  taxAmount: number
  total: number
  currency: string
  notes?: string
  paymentTerms: string
  hash?: string
  timestamp?: string
}

export interface InvoiceLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  discount?: number
  total: number
}

export interface BillingKPIs {
  monthlyRevenue: number
  monthlyTax: number
  pendingInvoices: number
  paidInvoices: number
  overdueInvoices: number
}

export interface AeatLog {
  id: string
  invoiceId: string
  timestamp: string
  status: 'pending' | 'sent' | 'accepted' | 'rejected'
  message?: string
  hash?: string
}

// Mock data
export const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2024-001",
    client: {
      name: "Tech Solutions SL",
      nif: "B12345678",
      address: "Calle Mayor 123, Madrid",
      email: "contact@techsolutions.com"
    },
    company: {
      name: "Mi Empresa SL",
      nif: "A87654321",
      address: "Gran Vía 456, Barcelona"
    },
    date: "2024-01-15",
    dueDate: "2024-02-15",
    status: "paid",
    haciendaStatus: "accepted",
    origin: "manual",
    lines: [
      {
        id: "1",
        description: "Desarrollo web",
        quantity: 1,
        unitPrice: 2000,
        taxRate: 21,
        total: 2420
      }
    ],
    subtotal: 2000,
    taxAmount: 420,
    total: 2420,
    currency: "EUR",
    paymentTerms: "30 días",
    hash: "abc123",
    timestamp: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    number: "INV-2024-002",
    client: {
      name: "Marketing Pro",
      nif: "B87654321",
      address: "Plaza España 789, Valencia",
      email: "info@marketingpro.es"
    },
    company: {
      name: "Mi Empresa SL",
      nif: "A87654321",
      address: "Gran Vía 456, Barcelona"
    },
    date: "2024-01-20",
    dueDate: "2024-02-20",
    status: "overdue",
    haciendaStatus: "sent",
    origin: "automatic",
    lines: [
      {
        id: "1",
        description: "Campaña publicitaria",
        quantity: 1,
        unitPrice: 1500,
        taxRate: 21,
        total: 1815
      }
    ],
    subtotal: 1500,
    taxAmount: 315,
    total: 1815,
    currency: "EUR",
    paymentTerms: "30 días"
  },
  {
    id: "3",
    number: "INV-2024-003",
    client: {
      name: "Consultoría Digital",
      nif: "B11223344",
      address: "Rambla Nova 321, Tarragona",
      email: "admin@consultoriadigital.com"
    },
    company: {
      name: "Mi Empresa SL",
      nif: "A87654321",
      address: "Gran Vía 456, Barcelona"
    },
    date: "2024-01-25",
    dueDate: "2024-02-25",
    status: "issued",
    haciendaStatus: "pending",
    origin: "manual",
    lines: [
      {
        id: "1",
        description: "Auditoría SEO",
        quantity: 1,
        unitPrice: 800,
        taxRate: 21,
        total: 968
      },
      {
        id: "2",
        description: "Optimización de contenidos",
        quantity: 5,
        unitPrice: 200,
        taxRate: 21,
        total: 1050
      }
    ],
    subtotal: 1800,
    taxAmount: 378,
    total: 2178,
    currency: "EUR",
    paymentTerms: "15 días"
  }
]

export const mockKPIs: BillingKPIs = {
  monthlyRevenue: 6408,
  monthlyTax: 1113,
  pendingInvoices: 1,
  paidInvoices: 1,
  overdueInvoices: 1
}

export const mockAeatLogs: AeatLog[] = [
  {
    id: "1",
    invoiceId: "1",
    timestamp: "2024-01-15T14:30:00Z",
    status: "sent",
    message: "Factura enviada correctamente",
    hash: "abc123"
  },
  {
    id: "2",
    invoiceId: "1",
    timestamp: "2024-01-15T14:35:00Z",
    status: "accepted",
    message: "Factura aceptada por Hacienda"
  },
  {
    id: "3",
    invoiceId: "2",
    timestamp: "2024-01-20T16:00:00Z",
    status: "sent",
    message: "Factura enviada correctamente"
  }
]

// Helper functions
export const getInvoicesByStatus = (status: Invoice['status']) =>
  mockInvoices.filter(invoice => invoice.status === status)

export const getInvoicesByHaciendaStatus = (status: Invoice['haciendaStatus']) =>
  mockInvoices.filter(invoice => invoice.haciendaStatus === status)

export const calculateTotals = (invoices: Invoice[]) => ({
  subtotal: invoices.reduce((sum, inv) => sum + inv.subtotal, 0),
  taxAmount: invoices.reduce((sum, inv) => sum + inv.taxAmount, 0),
  total: invoices.reduce((sum, inv) => sum + inv.total, 0)
})