import 'server-only'
import { fetchServer } from '@/lib/apis/fetch-server'
import { SupportTicket } from '../type'

export async function getSupportTicketsForStaffServer(params?: {
  status?: 'open' | 'closed'
  waitingFor?: 'assignee' | 'requester'
  assigned?: 'assigned' | 'unassigned'
}): Promise<SupportTicket[]> {
  const query = new URLSearchParams()
  if (params?.status) query.append('status', params.status)
  if (params?.waitingFor) query.append('waitingFor', params.waitingFor)
  if (params?.assigned) query.append('assigned', params.assigned)

  const url = `/support-chat/admin/tickets${query.toString() ? `?${query.toString()}` : ''}`
  const res = await fetchServer<SupportTicket[]>(url)
  return (res?.data || []) as SupportTicket[]
}

export async function getSupportTicketDetailForStaffServer(ticketId: string): Promise<SupportTicket | null> {
  if (!ticketId) return null
  const res = await fetchServer<SupportTicket>(`/support-chat/admin/tickets/${ticketId}`)
  return (res?.data || null) as SupportTicket | null
}

