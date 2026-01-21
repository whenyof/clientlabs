export interface Provider {
  id: string
  name: string
  company: string
  email: string
  status: 'active' | 'inactive'
}

export interface ProviderKPIs {
  totalProviders: number
  activeProviders: number
  monthlySpend: number
}

// Mock data - 6 proveedores básicos
export const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Tech Solutions SL',
    company: 'Tech Solutions SL',
    email: 'contact@techsolutions.com',
    status: 'active'
  },
  {
    id: '2',
    name: 'Office Supplies Pro',
    company: 'Office Supplies Pro',
    email: 'ventas@officesupplies.com',
    status: 'active'
  },
  {
    id: '3',
    name: 'Marketing Agency Plus',
    company: 'Marketing Agency Plus',
    email: 'hello@marketingagency.com',
    status: 'inactive'
  },
  {
    id: '4',
    name: 'Facility Services Ltd',
    company: 'Facility Services Ltd',
    email: 'info@facilityservices.com',
    status: 'active'
  },
  {
    id: '5',
    name: 'Software Licenses Inc',
    company: 'Software Licenses Inc',
    email: 'sales@softwarelicenses.com',
    status: 'inactive'
  },
  {
    id: '6',
    name: 'Consulting Experts',
    company: 'Consulting Experts',
    email: 'contact@consultingexperts.com',
    status: 'active'
  }
]

export const mockProviderKPIs: ProviderKPIs = {
  totalProviders: mockProviders.length,
  activeProviders: mockProviders.filter(p => p.status === 'active').length,
  monthlySpend: 12500
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(amount)
}