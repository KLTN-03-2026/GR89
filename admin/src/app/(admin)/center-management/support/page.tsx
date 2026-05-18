import { SupportMain } from '@/features/center-management/support'
import { getSupportTicketDetailForStaffServer, getSupportTicketsForStaffServer } from '@/features/center-management/support/services/serverApi'

export default async function SupportPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const status = (typeof resolvedSearchParams?.status === 'string' ? resolvedSearchParams.status : 'open') as 'open' | 'closed'
  const waitingFor =
    typeof resolvedSearchParams?.waitingFor === 'string'
      ? (resolvedSearchParams.waitingFor as 'assignee' | 'requester')
      : undefined
  const assigned =
    typeof resolvedSearchParams?.assigned === 'string'
      ? (resolvedSearchParams.assigned as 'assigned' | 'unassigned')
      : undefined
  const ticketId = typeof resolvedSearchParams?.ticketId === 'string' ? resolvedSearchParams.ticketId : ''

  const tickets = await getSupportTicketsForStaffServer({ status, waitingFor, assigned })
  const initialSelectedTicketId = ticketId || tickets?.[0]?._id || ''
  const initialSelectedTicket = initialSelectedTicketId
    ? await getSupportTicketDetailForStaffServer(initialSelectedTicketId)
    : null

  return (
    <SupportMain
      initialTickets={tickets}
      initialSelectedTicketId={initialSelectedTicketId}
      initialSelectedTicket={initialSelectedTicket}
    />
  )
}
