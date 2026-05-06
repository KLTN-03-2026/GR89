import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import { SupportTicket } from '../type'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

/* ============================ SUPPORT CHAT (ADMIN/CONTENT) ============================ */

export async function getSupportTicketsForStaff(params?: {
  status?: 'open' | 'closed'
  waitingFor?: 'assignee' | 'requester'
  assigned?: 'assigned' | 'unassigned'
}): Promise<ApiResponse<SupportTicket[]>> {
  const query = new URLSearchParams()
  if (params?.status) query.append('status', params.status)
  if (params?.waitingFor) query.append('waitingFor', params.waitingFor)
  if (params?.assigned) query.append('assigned', params.assigned)

  const url = `/support-chat/admin/tickets${query.toString() ? `?${query.toString()}` : ''}`
  const response = await AuthorizedAxios.get(url)
  return response.data as ApiResponse<SupportTicket[]>
}

export async function getSupportTicketDetailForStaff(ticketId: string): Promise<ApiResponse<SupportTicket>> {
  const response = await AuthorizedAxios.get(`/support-chat/admin/tickets/${ticketId}`)
  return response.data as ApiResponse<SupportTicket>
}

export async function claimSupportTicket(ticketId: string, takeoverMinutes: number = 5): Promise<ApiResponse<SupportTicket>> {
  const response = await AuthorizedAxios.post(`/support-chat/admin/tickets/${ticketId}/claim`, { takeoverMinutes })
  return response.data as ApiResponse<SupportTicket>
}

export async function sendSupportMessageAsStaff(
  ticketId: string,
  content: string,
  attachments?: Array<{ type: 'image' | 'file'; url: string; name?: string; size?: number | null; mimeType?: string }>,
): Promise<ApiResponse<SupportTicket>> {
  const response = await AuthorizedAxios.post(`/support-chat/admin/tickets/${ticketId}/messages`, {
    content,
    attachments,
  })
  return response.data as ApiResponse<SupportTicket>
}

export async function openClaimTicket(): Promise<ApiResponse<SupportTicket>> {
  const response = await AuthorizedAxios.post(`/support-chat/admin/tickets/open-claim`)
  return response.data as ApiResponse<SupportTicket>
}
