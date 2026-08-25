export interface Client {
  id: number
  name: string
  phone?: string | null
  email?: string | null
  createdAt: string
}

export interface Ticket {
  id: number
  clientId: number
  client?: Client
  title: string
  body: string
  response?: string | null
  priority: string
  category?: string | null
  status: string
  closedAt?: string | null
  createdAt: string
}

export interface WhatsAppNotification {
  id: number
  ticketId: number
  ticket?: Ticket
  phone: string
  message: string
  status: string
  sentAt?: string | null
  createdAt: string
}

export interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'number' | 'date'
  required?: boolean
  placeholder?: string
}

export interface ColumnDef<T> {
  key: string
  label: string
  render?: (row: T) => string
}
