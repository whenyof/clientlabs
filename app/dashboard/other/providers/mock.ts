export interface Provider {
  id: string
  name: string
  company: string
  email: string
  phone: string
  category: string
  status: 'active' | 'inactive' | 'pending'
  rating: number
  totalSpent: number
  totalOrders: number
  lastOrder: string
}

export interface ProviderKPIs {
  totalProviders: number
  activeProviders: number
  monthlySpend: number
  averageOrderValue: number
}

// Mock data
export const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Tech Solutions SL',
    company: 'Tech Solutions SL',
    email: 'contact@techsolutions.com',
    phone: '+34 912 345 678',
    category: 'Software',
    status: 'active',
    rating: 4.8,
    totalSpent: 45000,
    totalOrders: 24,
    lastOrder: '2025-01-15'
  },
  {
    id: '2',
    name: 'Office Supplies Pro',
    company: 'Office Supplies Pro',
    email: 'ventas@officesupplies.com',
    phone: '+34 931 222 333',
    category: 'Suministros',
    status: 'active',
    rating: 4.5,
    totalSpent: 12500,
    totalOrders: 48,
    lastOrder: '2025-01-12'
  },
  {
    id: '3',
    name: 'Marketing Agency Plus',
    company: 'Marketing Agency Plus',
    email: 'hello@marketingagency.com',
    phone: '+34 910 111 222',
    category: 'Marketing',
    status: 'inactive',
    rating: 4.2,
    totalSpent: 8900,
    totalOrders: 12,
    lastOrder: '2024-12-20'
  },
  {
    id: '4',
    name: 'Facility Services Ltd',
    company: 'Facility Services Ltd',
    email: 'info@facilityservices.com',
    phone: '+34 934 555 666',
    category: 'Servicios',
    status: 'active',
    rating: 4.6,
    totalSpent: 35000,
    totalOrders: 36,
    lastOrder: '2025-01-10'
  },
  {
    id: '5',
    name: 'Software Licenses Inc',
    company: 'Software Licenses Inc',
    email: 'sales@softwarelicenses.com',
    phone: '+34 900 888 777',
    category: 'Software',
    status: 'pending',
    rating: 4.0,
    totalSpent: 2100,
    totalOrders: 4,
    lastOrder: '2025-01-05'
  },
  {
    id: '6',
    name: 'Consulting Experts',
    company: 'Consulting Experts',
    email: 'contact@consultingexperts.com',
    phone: '+34 911 222 333',
    category: 'Consultoría',
    status: 'active',
    rating: 4.9,
    totalSpent: 55000,
    totalOrders: 18,
    lastOrder: '2025-01-14'
  }
]

export const mockProviderKPIs: ProviderKPIs = {
  totalProviders: mockProviders.length,
  activeProviders: mockProviders.filter(p => p.status === 'active').length,
  monthlySpend: 12500,
  averageOrderValue: 2083
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(amount)
}

export const getProvidersByCategory = (category: string) => {
  return mockProviders // Mock implementation
}

export const getProvidersByStatus = (status: string) => {
  return mockProviders.filter(p => p.status === status)
}

export const mockProviderOrders = [
  { id: 'ORD-1', providerId: '1', total: 1200, status: 'completed', date: '2025-01-15' },
  { id: 'ORD-2', providerId: '2', total: 800, status: 'pending', date: '2025-01-16' }
]